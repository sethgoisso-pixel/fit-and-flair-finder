export type Stretch = "faible" | "moyen" | "eleve";
export type FitPref = "ajustee" | "standard" | "oversize";
export type SizeSpec = { size: string; shoulders: number; chest: number; length: number; stock: number };

export const EASE: Record<FitPref, number> = { ajustee: 4, standard: 8, oversize: 14 };
export const STRETCH_TOL: Record<Stretch, number> = { faible: 2, moyen: 4, eleve: 6 };

// Biometric estimate based on height and weight
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
  chestDiff: number; // Difference between garment and body measurement
  easeTarget: number;
  status: "optimal" | "tight" | "loose";
  label: string;
  returnRisk: number;
  stock: number;
};

// Evaluates a specific size against the body profile
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
  let label = "Optimal fit";
  let risk = 3;

  if (delta < -tol) {
    status = "tight";
    label = `High tension (${Math.abs(delta)} cm below target ease)`;
    risk = Math.min(85, 25 + Math.abs(delta) * 12);
  } else if (delta > tol * 1.8) {
    status = "loose";
    label = `Loose drape (+${Math.round(delta)} cm excess fabric)`;
    risk = Math.min(65, 15 + Math.round(delta) * 7);
  } else {
    status = "optimal";
    label = `Perfect ease (+${realEase} cm chest ease)`;
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
    `Estimated chest ${body.chest} cm + ease ${pref} ${EASE[pref]} cm = cible ${target.chest} cm`,
    `Estimated shoulders ${body.shoulders} cm, stretch tolerance ${stretch} ±${tol} cm`,
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
      explanation: [...explanation, `Size ${ideal.s.size} in stock (${ideal.s.stock} units)`],
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
        `Size ${ideal.s.size} ${ideal.s.stock === 0 ? "out of stock" : "outside tolerance"} → ${alt.s.size} is within the fit tolerance`,
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
    explanation: [...explanation, `No suitable size is currently in stock`],
  };
}
