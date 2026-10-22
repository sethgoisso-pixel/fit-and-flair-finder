export type Stretch = "faible" | "moyen" | "eleve";
export type FitPref = "ajustee" | "standard" | "oversize";
export type SizeSpec = { size: string; shoulders: number; chest: number; length: number; stock: number };

export const EASE: Record<FitPref, number> = { ajustee: 4, standard: 8, oversize: 14 };
export const STRETCH_TOL: Record<Stretch, number> = { faible: 2, moyen: 4, eleve: 6 };

// Estimation biométrique basée sur taille et poids
export function estimateBody(heightCm: number, weightKg: number) {
  return {
    chest: Math.round(0.35 * heightCm + 0.45 * weightKg),
    shoulders: Math.round(0.25 * heightCm),
    length: Math.round(0.38 * heightCm),
  };
}

export type FitResult = {
  status: "PERFECT_MATCH" | "SMART_ALTERNATIVE" | "OUT_OF_STOCK";
  size: string | null;
  idealSize: string;
  confidence: number;
  returnRisk: number;
  body: ReturnType<typeof estimateBody>;
  target: { chest: number; shoulders: number };
  explanation: string[];
};

export type TensionAnalysis = {
  size: string;
  chestDiff: number; // Différence entre mesure vêtement et corps
  easeTarget: number;
  status: "optimal" | "tight" | "loose";
  label: string;
  returnRisk: number;
  stock: number;
};

// Évalue une taille spécifique par rapport à la silhouette
export function analyzeTension(
  spec: SizeSpec,
  stretch: Stretch,
  heightCm: number,
  weightKg: number,
  pref: FitPref
): TensionAnalysis {
  const body = estimateBody(heightCm, weightKg);
  const targetEase = EASE[pref];
  const tol = STRETCH_TOL[stretch];
  const realEase = spec.chest - body.chest;
  const delta = realEase - targetEase;

  let status: "optimal" | "tight" | "loose" = "optimal";
  let label = "Ajustement idéal";
  let risk = 3;

  if (delta < -tol) {
    status = "tight";
    label = `Tension forte (${Math.abs(delta)} cm sous l'aisance voulue)`;
    risk = Math.min(85, 25 + Math.abs(delta) * 12);
  } else if (delta > tol * 1.8) {
    status = "loose";
    label = `Coupe trop lâche (+${Math.round(delta)} cm d'excédent)`;
    risk = Math.min(65, 15 + Math.round(delta) * 7);
  } else {
    status = "optimal";
    label = `Aisance parfaite (+${realEase} cm au buste)`;
    risk = Math.max(2, Math.round(Math.abs(delta) * 2));
  }

  return {
    size: spec.size,
    chestDiff: realEase,
    easeTarget: targetEase,
    status,
    label,
    returnRisk: risk,
    stock: spec.stock,
  };
}

function score(s: SizeSpec, targetChest: number, targetShoulders: number, tol: number) {
  const dChest = Math.max(0, Math.abs(s.chest - targetChest) - tol);
  const dSh = Math.max(0, Math.abs(s.shoulders - targetShoulders) - tol / 2);
  return Math.max(0, Math.min(99, Math.round(99 - dChest * 5 - dSh * 4)));
}

export function computeFit(
  sizes: SizeSpec[],
  stretch: Stretch,
  heightCm: number,
  weightKg: number,
  pref: FitPref
): FitResult {
  const body = estimateBody(heightCm, weightKg);
  const tol = STRETCH_TOL[stretch];
  const target = {
    chest: body.chest + EASE[pref],
    shoulders: body.shoulders + (pref === "oversize" ? 4 : pref === "standard" ? 1.5 : 0),
  };
  const ranked = sizes
    .map((s) => ({ s, sc: score(s, target.chest, target.shoulders, tol) }))
    .sort((a, b) => b.sc - a.sc);
  const ideal = ranked[0]!;
  const explanation = [
    `Poitrine estimée ${body.chest} cm + aisance ${pref} ${EASE[pref]} cm = cible ${target.chest} cm`,
    `Épaules estimées ${body.shoulders} cm, tolérance stretch ${stretch} ±${tol} cm`,
  ];
  const risk = (sc: number) => Math.max(1, Math.round((100 - sc) / 3));

  if (ideal.s.stock > 0 && ideal.sc >= 80) {
    return {
      status: "PERFECT_MATCH",
      size: ideal.s.size,
      idealSize: ideal.s.size,
      confidence: ideal.sc,
      returnRisk: risk(ideal.sc),
      body,
      target,
      explanation: [...explanation, `Taille ${ideal.s.size} en stock (${ideal.s.stock} pcs)`],
    };
  }
  const alt = ranked.find((r) => r.s.stock > 0 && r.sc >= 65);
  if (alt) {
    return {
      status: "SMART_ALTERNATIVE",
      size: alt.s.size,
      idealSize: ideal.s.size,
      confidence: alt.sc,
      returnRisk: risk(alt.sc),
      body,
      target,
      explanation: [
        ...explanation,
        `Taille ${ideal.s.size} ${ideal.s.stock === 0 ? "épuisée" : "hors tolérance"} → ${alt.s.size} reste dans la tolérance de coupe`,
      ],
    };
  }
  return {
    status: "OUT_OF_STOCK",
    size: null,
    idealSize: ideal.s.size,
    confidence: ideal.sc,
    returnRisk: risk(ideal.sc),
    body,
    target,
    explanation: [...explanation, `Aucune taille cohérente disponible en stock`],
  };
}
