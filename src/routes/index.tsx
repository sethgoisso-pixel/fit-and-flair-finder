import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { 
  ShoppingBag, Sparkles, X, Upload, TrendingDown, Check, 
  AlertTriangle, Download, ShieldCheck, Leaf, ArrowRight 
} from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/products";
import { computeFit, analyzeTension, type FitPref } from "@/lib/fit";
import { startYoucamCloth, pollYoucamCloth } from "@/lib/youcam.functions";
import modelImg from "@/assets/model.jpg";
import modelFemme from "@/assets/model-femme.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OmniFit AI — Essayage virtuel & sizing biométrique" },
      { name: "description", content: "Mode haut de gamme avec essayage virtuel YouCam réel et moteur prédictif anti-retours." },
      { property: "og:title", content: "OmniFit AI — Essayage virtuel & sizing biométrique" },
      { property: "og:description", content: "Essayez virtuellement par IA, recevez la taille exacte, éliminez les retours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type CartItem = { id: string; name: string; size: string; price: number; image: string; qty: number; returnRisk: number };

function Index() {
  const [filter, setFilter] = useState<"tous" | "femme" | "homme">("tous");
  const [vto, setVto] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [b2b, setB2b] = useState(false);

  const add = (p: Product, size: string, returnRisk: number = 4) => {
    setCart((c) => {
      const f = c.find((i) => i.id === p.id && i.size === size);
      if (f) return c.map((i) => (i === f ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { id: p.id, name: p.name, size, price: p.price, image: p.image, qty: 1, returnRisk }];
    });
    toast.success(`${p.name} — taille ${size} ajoutée au panier`);
    setCartOpen(true);
  };
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="font-display text-xl tracking-tight">OMNIFIT<span className="text-primary">.AI</span></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setB2b(true)} 
              className="hidden rounded-full border border-border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-2 transition-colors hover:border-primary/50"
            >
              <TrendingDown className="h-3.5 w-3.5 text-primary" />
              Impact Marchand B2B
            </button>
            <button onClick={() => setCartOpen(true)} aria-label="Panier" className="relative rounded-full border border-border p-2 hover:bg-secondary">
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground font-semibold">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" />
          YouCam VTO Real AI × Biométrie Prédictive
        </div>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-normal leading-[1.05] sm:text-6xl md:text-7xl">
          Essayez en IA.<br /><em className="text-muted-foreground">Ne retournez plus jamais.</em>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed">
          La première technologie d'essayage virtuel qui couple le rendu photoréaliste YouCam à la physique de tension du tissu pour anéantir les retours de taille.
        </p>
        <button onClick={() => setB2b(true)} className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:hidden">
          <TrendingDown className="h-3.5 w-3.5 text-primary" />Simulateur B2B
        </button>
      </section>

      <div className="mx-auto flex max-w-7xl gap-2 px-5 pb-6">
        {(["tous", "femme", "homme"] as const).map((g) => (
          <button 
            key={g} 
            onClick={() => setFilter(g)} 
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-all ${
              filter === g ? "border-primary bg-primary text-primary-foreground font-medium" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.filter((p) => filter === "tous" || p.gender === filter).map((p, i) => (
          <article key={p.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-border/60 bg-card/40 p-3 hover:border-primary/40 transition-all">
            <button onClick={() => setVto(p)} className="relative block w-full overflow-hidden rounded-lg bg-card">
              <img src={p.image} alt={p.name} width={768} height={1024} loading={i ? "lazy" : undefined} className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[11px] backdrop-blur font-mono">{p.tag}</span>
            </button>
            <div className="mt-3 flex items-start justify-between gap-3 px-1">
              <div>
                <h2 className="font-display text-lg">{p.name}</h2>
                <p className="text-xs text-muted-foreground capitalize">{p.gender} · {p.material}</p>
              </div>
              <p className="font-mono text-base font-medium">{p.price} €</p>
            </div>
            <button 
              onClick={() => setVto(p)} 
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-95 transition-opacity"
            >
              <Sparkles className="h-4 w-4" />
              Essayer virtuellement
            </button>
          </article>
        ))}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        OmniFit AI — Concours Officiel YouCam Skin AI & eCommerce VTO
      </footer>

      {vto && <VtoStudio p={vto} onClose={() => setVto(null)} onAdd={add} />}
      {b2b && <B2BModal onClose={() => setB2b(false)} />}
      <CartDrawer open={cartOpen} items={cart} setItems={setCart} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function Overlay({ onClose, children, side }: { onClose: () => void; children: React.ReactNode; side?: boolean }) {
  useEffect(() => { 
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); 
    window.addEventListener("keydown", h); 
    return () => window.removeEventListener("keydown", h); 
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200" role="dialog">
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={onClose} />
      <div className={side ? "relative ml-auto h-full w-full max-w-md animate-in slide-in-from-right duration-300 border-l border-border bg-card" : "relative m-auto max-h-[92vh] w-[calc(100%-1.5rem)] max-w-5xl overflow-y-auto animate-in zoom-in-95 duration-300 rounded-xl border border-border bg-card shadow-2xl"}>
        <button onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 z-20 rounded-full bg-background/80 p-2 hover:bg-secondary border border-border">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

async function toDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const blob = await (await fetch(url)).blob();
  return await new Promise((res) => { 
    const r = new FileReader(); 
    r.onload = () => res(r.result as string); 
    r.readAsDataURL(blob); 
  });
}

const STEPS = ["Analyse de la posture", "Connexion sécurisée YouCam", "L'IA habille la silhouette", "Finalisation du rendu HD"];

function VtoStudio({ p, onClose, onAdd }: { p: Product; onClose: () => void; onAdd: (p: Product, s: string, risk: number) => void }) {
  const defaultModel = p.gender === "femme" ? modelFemme : modelImg;
  const [src, setSrc] = useState<string>(defaultModel);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [split, setSplit] = useState(50);
  const [h, setH] = useState(p.gender === "femme" ? 166 : 178);
  const [w, setW] = useState(p.gender === "femme" ? 58 : 72);
  const [pref, setPref] = useState<FitPref>("standard");
  
  const fit = useMemo(() => computeFit(p.sizes, p.stretch, h, w, pref), [p, h, w, pref]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Synchronise la taille sélectionnée avec la recommandation au calcul
  useEffect(() => {
    if (fit.size) setSelectedSize(fit.size);
  }, [fit.size]);

  // Analyse de tension dynamique pour la taille couramment inspectée
  const currentSpec = p.sizes.find((s) => s.size === (selectedSize || fit.size || p.sizes[0].size)) || p.sizes[0];
  const tension = useMemo(() => analyzeTension(currentSpec, p.stretch, h, w, pref), [currentSpec, p.stretch, h, w, pref]);

  const fileRef = useRef<HTMLInputElement>(null);
  const runId = useRef(0);
  const start = useServerFn(startYoucamCloth);
  const poll = useServerFn(pollYoucamCloth);

  const run = async (image: string) => {
    const id = ++runId.current;
    setResult(null); setError(null); setProgress(5);
    try {
      const [person, garment] = await Promise.all([toDataUrl(image), toDataUrl(p.image)]);
      if (id !== runId.current) return;
      setProgress(20);
      const t = await start({ data: { person, garment, category: p.category } });
      if (!t.ok) throw new Error(t.error);
      setProgress(35);
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        if (id !== runId.current) return;
        setProgress((v) => Math.min(95, v + 3));
        const r = await poll({ data: { taskId: t.taskId } });
        if (r.status === "success") { setResult(r.url); setProgress(100); return; }
        if (r.status === "error") throw new Error(r.error);
      }
      throw new Error("Délai de traitement dépassé");
    } catch (e) {
      if (id !== runId.current) return;
      setError(e instanceof Error ? e.message : "Erreur de connexion"); setProgress(0);
    }
  };

  useEffect(() => { 
    void run(defaultModel); 
    return () => { runId.current++; }; 
  }, [p.id]);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setSrc(r.result as string); void run(r.result as string); };
    r.readAsDataURL(f);
  };

  const downloadLook = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `omnifit-${p.id}-look.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Image du look téléchargée !");
  };

  const busy = !result && !error;
  const step = STEPS[Math.min(3, Math.floor(progress / 26))];

  return (
    <Overlay onClose={onClose}>
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        {/* Colonne Gauche : Miroir YouCam avec curseur avant/après */}
        <div className="relative aspect-[3/4] select-none overflow-hidden bg-background">
          <img src={src} alt="Votre silhouette" className="absolute inset-0 h-full w-full object-cover" />
          
          {result && (
            <>
              <div className="absolute inset-0 animate-in fade-in duration-700" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
                <img src={result} alt={`Rendu YouCam — ${p.name}`} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary shadow-lg" style={{ left: `${split}%` }} />
              <input 
                type="range" 
                min={0} 
                max={100} 
                value={split} 
                onChange={(e) => setSplit(+e.target.value)} 
                aria-label="Curseur comparateur avant/après" 
                className="absolute inset-x-0 bottom-4 mx-auto w-3/4 accent-primary z-10" 
              />
              <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[11px] backdrop-blur font-mono">Avant</span>
              <span className="absolute right-14 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] text-primary-foreground font-mono font-medium shadow">IA YouCam</span>

              <button 
                onClick={downloadLook} 
                className="absolute bottom-12 right-3 z-10 rounded-full bg-background/80 p-2.5 text-foreground hover:bg-secondary border border-border backdrop-blur"
                title="Télécharger l'image"
              >
                <Download className="h-4 w-4" />
              </button>
            </>
          )}

          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-xs">
              <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_20px_var(--primary)] transition-all duration-500" style={{ top: `${progress}%` }} />
              <div className="w-3/4 text-center">
                <p className="text-sm font-medium text-primary">{step}… {progress}%</p>
                <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">Appel API YouCam réel · 20 à 45 s</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 grid place-items-center bg-background/85 p-6 text-center">
              <div>
                <AlertTriangle className="mx-auto h-7 w-7 text-destructive" />
                <p className="mt-2 text-sm text-foreground">Échec du rendu YouCam : {error}</p>
                <button onClick={() => run(src)} className="mt-3 rounded-md border border-border px-4 py-2 text-xs hover:bg-secondary">
                  Réessayer le rendu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Colonne Droite : Moteur Biologique OmniFit */}
        <div className="space-y-4 p-5 sm:p-6 overflow-y-auto max-h-[85vh]">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              OmniFit Biomechanical Engine
            </div>
            <h2 className="font-display text-2xl mt-0.5">{p.name}</h2>
            <p className="text-xs text-muted-foreground">{p.material} · Élasticité {p.stretch} · {p.price} €</p>
          </div>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/50 py-3 text-xs hover:bg-primary/5 transition-colors font-medium">
            <Upload className="h-4 w-4 text-primary" />
            Essayer sur ma propre photo
          </button>
          {src !== defaultModel && (
            <button onClick={() => { setSrc(defaultModel); void run(defaultModel); }} className="w-full text-center text-xs text-muted-foreground underline">
              Revenir au mannequin par défaut
            </button>
          )}

          {/* Morphologie interactive */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono">Silhouette Client</span>
              <span className="text-[11px] text-muted-foreground">Buste estimé : <strong className="text-foreground">{fit.body.chest} cm</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-muted-foreground">
                Taille <strong className="text-foreground">{h} cm</strong>
                <input type="range" min={150} max={205} value={h} onChange={(e) => setH(+e.target.value)} className="mt-1 w-full accent-primary" />
              </label>
              <label className="text-xs text-muted-foreground">
                Poids <strong className="text-foreground">{w} kg</strong>
                <input type="range" min={40} max={130} value={w} onChange={(e) => setW(+e.target.value)} className="mt-1 w-full accent-primary" />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(["ajustee", "standard", "oversize"] as FitPref[]).map((f) => (
                <button 
                  key={f} 
                  onClick={() => setPref(f)} 
                  className={`rounded-md border py-1.5 text-xs capitalize transition-all ${
                    pref === f ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"
                  }`}
                >
                  {f === "ajustee" ? "Ajustée" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur de taille & Analyse de Tension */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono">Test de Taille & Tension</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                tension.status === "optimal" ? "bg-success/15 text-success" : tension.status === "tight" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
              }`}>
                Risque retour : {tension.returnRisk}%
              </span>
            </div>

            {/* Boutons de tailles interactifs */}
            <div className="grid grid-cols-4 gap-2">
              {p.sizes.map((s) => {
                const isRec = fit.size === s.size;
                const isSelected = (selectedSize || fit.size) === s.size;
                return (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => setSelectedSize(s.size)}
                                        className={`relative rounded-lg border py-2 text-center text-xs transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-foreground hover:bg-secondary/50"
                    } ${s.stock === 0 ? "opacity-35 cursor-not-allowed" : ""}`}
                  >
                    <div className="font-bold">{s.size}</div>
                    <div className="text-[10px] text-muted-foreground">{s.stock > 0 ? `${s.stock} dispo` : "Épuisé"}</div>
                    {isRec && (
                      <span className="absolute -top-1.5 -right-1 rounded-full bg-primary px-1 text-[9px] text-primary-foreground font-mono">
                        Idéal
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Diagnostic de coupe dynamique */}
            <div className={`p-3 rounded-lg border text-xs ${
              tension.status === "optimal" 
                ? "border-success/30 bg-success/5 text-success" 
                : tension.status === "tight" 
                ? "border-destructive/30 bg-destructive/5 text-destructive" 
                : "border-warning/30 bg-warning/5 text-warning"
            }`}>
              <div className="font-semibold flex items-center gap-1.5">
                {tension.status === "optimal" ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {tension.label}
              </div>
              <p className="text-[11px] opacity-90 mt-1">
                {tension.status === "optimal" 
                  ? `Parfait pour une coupe ${pref}. Le vêtement s'adapte à votre morphologie sans tension excessive.`
                  : tension.status === "tight"
                  ? `Le vêtement risque d'être trop ajusté aux épaules et de tirer au buste.`
                  : `Le tissu aura une aisance marquée par rapport à votre préférence.`}
              </p>
            </div>
          </div>

          {/* Bouton d'ajout au panier */}
          <button
            disabled={!selectedSize && !fit.size}
            onClick={() => {
              const targetSize = selectedSize || fit.size;
              if (targetSize) {
                add(p, targetSize, tension.returnRisk);
                onClose();
              }
            }}
            className="w-full rounded-xl bg-primary py-3.5 text-center text-xs font-semibold text-primary-foreground tracking-wide hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <ShoppingBag className="h-4 w-4" />
            Ajouter la taille {selectedSize || fit.size || "recommandée"} au panier
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// -------------------------------------------------------------
// TIROIR PANIER & CALCUL D'IMPACT ANTI-RETOURS
// -------------------------------------------------------------
function CartDrawer({
  cart,
  onClose,
  onRemove,
  onCheckout,
}: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string, size: string) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const avgRisk = cart.length ? Math.round(cart.reduce((s, i) => s + i.returnRisk, 0) / cart.length) : 0;
  const co2Saved = (cart.length * 3.4).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex h-full w-full max-w-md flex-col bg-card border-l border-border p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg">Mon Panier</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Badge d'impact positif */}
        {cart.length > 0 && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-medium text-primary">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Garantie Coupe OmniFit
              </span>
              <span className="font-mono">Risque : {avgRisk}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Leaf className="h-3 w-3 text-success inline" />
              Taille validée par l'algorithme : ~{co2Saved} kg de CO₂ de transport évités.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Votre panier est vide.
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background/50">
                <img src={item.image} alt={item.name} className="h-16 w-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold truncate">{item.name}</h4>
                  <p className="text-[11px] text-muted-foreground">Taille : <span className="font-mono text-primary font-bold">{item.size}</span></p>
                  <p className="text-xs font-mono font-medium mt-1">{item.price} €</p>
                </div>
                <button onClick={() => onRemove(item.id, item.size)} className="text-muted-foreground hover:text-destructive p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total estimé</span>
            <span className="font-mono text-lg font-bold">{total} €</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full rounded-xl bg-primary py-3.5 text-xs font-semibold text-primary-foreground tracking-wide hover:brightness-110 transition-all disabled:opacity-40"
          >
            Passer la commande
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODALE B2B : SIMULATEUR DE RETOURS POUR LE JURY
// -------------------------------------------------------------
function B2BModal({ onClose }: { onClose: () => void }) {
  const [orders, setOrders] = useState(5000);
  const aov = 85; // Panier moyen en €
  const baseReturnRate = 0.32; // Taux de retour moyen textile (32%)
  const omnifitReturnRate = 0.11; // Taux de retour avec OmniFit (11%)
  
  const savedReturns = Math.round(orders * (baseReturnRate - omnifitReturnRate));
  const logisticsSaved = savedReturns * 14.5; // Coût moyen d'un retour (14,50 €)
  const co2SavedTonnes = ((savedReturns * 3.4) / 1000).toFixed(1);

  return (
    <Overlay onClose={onClose}>
      <div className="p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
            <TrendingDown className="h-4 w-4" />
            Merchant ROI Calculator
          </div>
          <h2 className="font-display text-2xl mt-1">Impact Financier OmniFit</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Modèle de rentabilité pour les marques e-commerce de mode intégrant le VTO biométrique.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Volume de commandes mensuelles</span>
            <span className="font-mono font-bold text-primary">{orders.toLocaleString()} commandes/mois</span>
          </div>
          <input 
            type="range" 
            min={1000} 
            max={50000} 
            step={1000} 
            value={orders} 
            onChange={(e) => setOrders(+e.target.value)} 
            className="w-full accent-primary" 
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-border p-3.5 bg-background">
            <div className="text-xl sm:text-2xl font-bold font-mono text-primary">-{Math.round((baseReturnRate - omnifitReturnRate) * 100)}%</div>
            <div className="text-[11px] text-muted-foreground mt-1">Taux de retours</div>
          </div>
          <div className="rounded-xl border border-border p-3.5 bg-background">
            <div className="text-xl sm:text-2xl font-bold font-mono text-success">+{Math.round(logisticsSaved).toLocaleString()} €</div>
            <div className="text-[11px] text-muted-foreground mt-1">Économies logistique</div>
          </div>
          <div className="rounded-xl border border-border p-3.5 bg-background">
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">{co2SavedTonnes} t</div>
            <div className="text-[11px] text-muted-foreground mt-1">CO₂ non émis</div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Pourquoi ce chiffre convainc les marques ?</p>
          <p>
            En mode en ligne, 70 % des retours sont dus à une incertitude de taille. En combinant l'essayage visuel YouCam et l'algorithme morphologique en amont du panier, OmniFit supprime l'achat multi-tailles.
          </p>
        </div>

        <button onClick={onClose} className="w-full rounded-xl bg-secondary py-3 text-xs font-semibold text-foreground hover:bg-secondary/80">
          Fermer le simulateur
        </button>
      </div>
    </Overlay>
  );
}

// -------------------------------------------------------------
// COMPOSANT OVERLAY (MODALE UNIFIÉE)
// -------------------------------------------------------------
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden my-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-20 rounded-full border border-border bg-background/80 p-2 text-muted-foreground hover:text-foreground backdrop-blur"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
