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
      { title: "OmniFit AI — Virtual Try-On & Biometric Sizing" },
      { name: "description", content: "Premium fashion with real YouCam virtual try-on and a predictive return-reduction engine." },
      { property: "og:title", content: "OmniFit AI — Virtual Try-On & Biometric Sizing" },
      { property: "og:description", content: "Try on clothes virtually with AI, get your ideal size, and reduce returns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type CartItem = { id: string; name: string; size: string; price: number; image: string; qty: number; returnRisk: number };

function Index() {
  const [filter, setFilter] = useState<"tous" | "femme" | "homme">("tous");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [b2b, setB2b] = useState(false);

  const add = (p: Product, size: string, returnRisk: number = 4) => {
    setCart((c) => {
      const f = c.find((i) => i.id === p.id && i.size === size);
      if (f) return c.map((i) => (i === f ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { id: p.id, name: p.name, size, price: p.price, image: p.image, qty: 1, returnRisk }];
    });
    toast.success(`${p.name} — size ${size} added to cart`);
    setCartOpen(true);
  };
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = PRODUCTS.filter((p) => {
    if (filter === "femme") return p.gender === "femme";
    if (filter === "homme") return p.gender === "homme";
    return true;
  });

    return (
    <div className="min-h-screen bg-background text-foreground antialiased relative overflow-hidden selection:bg-sky-200">
      {/* Halos de lumière simulant un ciel nuageux vaporeux */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-gradient-to-b from-sky-200/60 via-blue-100/35 to-transparent blur-3xl" />
        <div className="absolute top-[35%] -left-32 h-[450px] w-[500px] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute top-[60%] -right-32 h-[500px] w-[550px] rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      {/* Barre de navigation haute flottante en verre dépoli */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="font-display text-2xl font-extrabold tracking-tight">
            OMNIFIT<span className="text-primary font-normal">.AI</span>
          </div>
                    <div className="flex items-center gap-3">
            <button 
              onClick={() => setB2b(true)} 
              className="hidden rounded-full border border-border/80 bg-white/60 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-2 transition-all hover:border-primary/50 hover:bg-white shadow-sm"
            >
              <TrendingDown className="h-3.5 w-3.5 text-primary" />
              B2B Merchant Impact
            </button>
            <button 
              onClick={() => setCartOpen(true)} 
              aria-label="Shopping Cart" 
              className="relative rounded-full border border-border/80 bg-white/70 p-2.5 shadow-sm hover:bg-white transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-14 pb-10 sm:pt-20 sm:pb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/60 bg-sky-100/70 px-4 py-1.5 text-xs text-sky-800 font-semibold mb-5 shadow-sm backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          YouCam AI VTO Engine & Biomechanical Sizing
        </div>
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.08] text-slate-900">
          The morphological truth before you buy.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Experience realistic AI try-on powered by YouCam, and eliminate return guesswork with real-time textile tension analysis.
        </p>

        {/* Filter pills */}
        <div className="mt-8 flex justify-center gap-2.5">
          {[
            { id: "tous", label: "All" },
            { id: "femme", label: "Women" },
            { id: "homme", label: "Men" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id as any)}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                filter === id 
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-sky-500/25 scale-105" 
                  : "border border-border/80 bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Grille de produits aux cartes bento galbées */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div 
              key={p.id} 
              className="group relative flex flex-col rounded-3xl border border-white/80 bg-card/90 backdrop-blur-md p-3.5 shadow-sm hover:shadow-xl hover:shadow-sky-200/50 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/50">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur">
                  {p.gender === "femme" ? "Women" : "Men"} · {p.category === "lower_body" ? "Lower Body" : p.category === "full_body" ? "Full Body" : "Upper Body"}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur">
                  {p.price} €
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4 pt-5">
                <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">{p.name}</h3>
                <p className="mt-1.5 text-xs text-slate-500 font-normal leading-relaxed">{p.description}</p>

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => setActiveProduct(p)}
                    className="w-full rounded-2xl bg-primary py-3.5 text-xs font-bold text-primary-foreground tracking-wide hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-500/25"
                  >
                    <Sparkles className="h-4 w-4" />
                    Try On Virtually
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modale Studio VTO */}
      {activeProduct && (
        <VtoStudio p={activeProduct} onClose={() => setActiveProduct(null)} add={add} />
      )}

      {/* Panier latéral */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={(id, size) => setCart((c) => c.filter((i) => !(i.id === id && i.size === size)))}
          onCheckout={() => {
            toast.success("Demo order completed successfully! Thank you for your purchase.");
            setCart([]);
            setCartOpen(false);
          }}
        />
      )}

      {/* Modale d'impact B2B */}
      {b2b && <B2BModal onClose={() => setB2b(false)} />}
    </div>
  );
}

const STEPS = [
  "Preparing your model",
  "Sending to YouCam servers",
  "AI is adjusting the garment",
  "Finalizing HD rendering",
];

function VtoStudio({
  p,
  onClose,
  add,
}: {
  p: Product;
  onClose: () => void;
  add: (p: Product, size: string, risk?: number) => void;
}) {
  const defaultModel = p.gender === "femme" ? modelFemme : modelImg;
  const [src, setSrc] = useState(defaultModel);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [split, setSplit] = useState(50);
  const fileRef = useRef<HTMLInputElement>(null);
  const runId = useRef(0);

  // Mensurations interactives
  const [h, setH] = useState(p.gender === "femme" ? 170 : 182);
  const [w, setW] = useState(p.gender === "femme" ? 58 : 76);
  const [pref, setPref] = useState<FitPref>("standard");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Calculs morphologiques & tension
  const fit = useMemo(() => computeFit(p.sizes, p.stretch, h, w, pref), [p, h, w, pref]);
  const activeSizeSpec = useMemo(() => {
    const targetSize = selectedSize || fit.size || p.sizes[0].size;
    return p.sizes.find((s) => s.size === targetSize) || p.sizes[0];
  }, [p, selectedSize, fit.size]);

  const tension = useMemo(
    () => analyzeTension(activeSizeSpec, p.stretch, h, w, pref),
    [activeSizeSpec, p.stretch, h, w, pref]
  );

  const startFn = useServerFn(startYoucamCloth);
  const pollFn = useServerFn(pollYoucamCloth);

    // Convertit n'importe quel chemin d'image en Data URL base64
  const toDataUrl = async (url: string): Promise<string> => {
    if (url.startsWith("data:")) return url;
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const run = async (modelImgUrl: string) => {
    const id = ++runId.current;
    setError(null);
    setResult(null);
    setProgress(5);

    try {
      setProgress(15);
      const [person, garment] = await Promise.all([
        toDataUrl(modelImgUrl),
        toDataUrl(p.image),
      ]);

      const res = await startFn({
        data: {
          person,
          garment,
          category: p.category,
        },
      });

      if (!res.ok || !res.taskId) {
        throw new Error(res.error || "Unable to start the YouCam task");
      }

      if (id !== runId.current) return;
      setProgress(25);

      const taskId = res.taskId;
      const t0 = Date.now();
      const interval = setInterval(async () => {
        if (id !== runId.current) {
          clearInterval(interval);
          return;
        }
        const elapsed = (Date.now() - t0) / 1000;
        setProgress(Math.min(95, Math.round(25 + elapsed * 2.5)));

        try {
          const poll = await pollFn({ data: { taskId } });
          if (poll.status === "success" && poll.url) {
            clearInterval(interval);
            setProgress(100);
            setResult(poll.url);
          } else if (poll.status === "error") {
            clearInterval(interval);
            setError(poll.error || "The YouCam engine encountered an error.");
          }
        } catch (e: any) {
          clearInterval(interval);
          setError(e?.message || "Unable to contact the YouCam API.");
        }
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "YouCam configuration error.");
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
    toast.success("Look image downloaded!");
  };

  const busy = !result && !error;
  const step = STEPS[Math.min(3, Math.floor(progress / 26))];

  return (
    <Overlay onClose={onClose}>
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        {/* Miroir YouCam avec curseur avant/après */}
        <div className="relative aspect-[3/4] select-none overflow-hidden bg-background">
          <img src={src} alt="Your model" className="absolute inset-0 h-full w-full object-cover" />
          
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
                aria-label="Before-and-after comparison slider" 
                className="absolute inset-x-0 bottom-4 mx-auto w-3/4 accent-primary z-10" 
              />
              <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[11px] backdrop-blur font-mono">Before</span>
              <span className="absolute right-14 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] text-primary-foreground font-mono font-medium shadow">IA YouCam</span>

              <button 
                onClick={downloadLook} 
                className="absolute bottom-12 right-3 z-10 rounded-full bg-background/80 p-2.5 text-foreground hover:bg-secondary border border-border backdrop-blur"
                title="Download image"
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
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">Live YouCam API call · 20–45 sec</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 grid place-items-center bg-background/85 p-6 text-center">
              <div>
                <AlertTriangle className="mx-auto h-7 w-7 text-destructive" />
                <p className="mt-2 text-sm text-foreground">YouCam rendering failed: {error}</p>
                <button onClick={() => run(src)} className="mt-3 rounded-md border border-border px-4 py-2 text-xs hover:bg-secondary">
                  Try rendering again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Moteur Biologique & Analyseur de Tension */}
        <div className="space-y-4 p-5 sm:p-6 overflow-y-auto max-h-[85vh]">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              OmniFit Biomechanical Engine
            </div>
            <h2 className="font-display text-2xl mt-0.5">{p.name}</h2>
            <p className="text-xs text-muted-foreground">{p.material} · Stretch {p.stretch === "faible" ? "Low" : p.stretch === "moyen" ? "Medium" : "High"} · €{p.price}</p>
          </div>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/50 py-3 text-xs hover:bg-primary/5 transition-colors font-medium">
            <Upload className="h-4 w-4 text-primary" />
            Try on with my own photo
          </button>
          {src !== defaultModel && (
            <button onClick={() => { setSrc(defaultModel); void run(defaultModel); }} className="w-full text-center text-xs text-muted-foreground underline">
              Return to default model
            </button>
          )}

          {/* Morphologie interactive */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono">Your Body Profile</span>
              <span className="text-[11px] text-muted-foreground">Estimated chest: <strong className="text-foreground">{fit.body.chest} cm</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-muted-foreground">
                Height <strong className="text-foreground">{h} cm</strong>
                <input type="range" min={150} max={205} value={h} onChange={(e) => setH(+e.target.value)} className="mt-1 w-full accent-primary" />
              </label>
              <label className="text-xs text-muted-foreground">
                Weight <strong className="text-foreground">{w} kg</strong>
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
                  {f === "ajustee" ? "Fitted" : f}
                </button>
              ))}
            </div>
          </div>
                {/* Size Selector & Tension Analysis */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono">Fit & Fabric Tension Test</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                tension.status === "optimal" ? "bg-success/15 text-success" : tension.status === "tight" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
              }`}>
                Return risk: {tension.returnRisk}%
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
                    <div className="text-[10px] text-muted-foreground">{s.stock > 0 ? `${s.stock} available` : "Out of stock"}</div>
                    {isRec && (
                      <span className="absolute -top-1.5 -right-1 rounded-full bg-primary px-1 text-[9px] text-primary-foreground font-mono">
                        Ideal
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
                  ? `Ideal for a ${pref}. The garment fits your body shape without excessive tension.`
                  : tension.status === "tight"
                  ? `The garment may feel too tight at the shoulders and pull across the chest.`
                  : `The fabric will drape more loosely than your preference.`}
              </p>
            </div>
          </div>

          {/* Bouton d'ajout to cart */}
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
            Add size {selectedSize || fit.size || "recommended"} to cart
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
            <h3 className="font-display text-lg">My Cart</h3>
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
              <span className="font-mono">Risk: {avgRisk}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Leaf className="h-3 w-3 text-success inline" />
              Size validated by the algorithm: ~{co2Saved} kg of transport CO₂ emissions avoided.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Your cart is empty.
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background/50">
                <img src={item.image} alt={item.name} className="h-16 w-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold truncate">{item.name}</h4>
                  <p className="text-[11px] text-muted-foreground">Size: <span className="font-mono text-primary font-bold">{item.size}</span></p>
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
            <span>Estimated total</span>
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
  const aov = 85;
  const baseReturnRate = 0.32;
  const omnifitReturnRate = 0.11;
  
  const savedReturns = Math.round(orders * (baseReturnRate - omnifitReturnRate));
  const logisticsSaved = savedReturns * 14.5;
  const co2SavedTonnes = ((savedReturns * 3.4) / 1000).toFixed(1);

  return (
    <Overlay onClose={onClose}>
      <div className="p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
            <TrendingDown className="h-4 w-4" />
            Merchant ROI Calculator
          </div>
          <h2 className="font-display text-2xl mt-1">OmniFit Financial Impact</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Profitability model for fashion e-commerce brands using biometric virtual try-on.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Monthly order volume</span>
            <span className="font-mono font-bold text-primary">{orders.toLocaleString()} orders/month</span>
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
            <div className="text-[11px] text-muted-foreground mt-1">Return rate</div>
          </div>
          <div className="rounded-xl border border-border p-3.5 bg-background">
            <div className="text-xl sm:text-2xl font-bold font-mono text-success">+{Math.round(logisticsSaved).toLocaleString()} €</div>
            <div className="text-[11px] text-muted-foreground mt-1">Logistics savings</div>
          </div>
          <div className="rounded-xl border border-border p-3.5 bg-background">
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">{co2SavedTonnes} t</div>
            <div className="text-[11px] text-muted-foreground mt-1">CO₂ emissions avoided</div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Why does this matter to brands?</p>
          <p>
            In online fashion, 70% of returns are caused by sizing uncertainty. By combining YouCam visual try-on with body-shape analysis before checkout, OmniFit helps eliminate multi-size ordering.
          </p>
        </div>

        <button onClick={onClose} className="w-full rounded-xl bg-secondary py-3 text-xs font-semibold text-foreground hover:bg-secondary/80">
          Close le simulateur
        </button>
      </div>
    </Overlay>
  );
}

// -------------------------------------------------------------
// OVERLAY COMPONENT (UNIFIED MODAL)
// -------------------------------------------------------------
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden my-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 rounded-full border border-border bg-background/80 p-2 text-muted-foreground hover:text-foreground backdrop-blur"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
