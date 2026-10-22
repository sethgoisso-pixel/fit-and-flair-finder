import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Sparkles, X, Upload, TrendingDown, Check, AlertTriangle } from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/products";
import { computeFit, type FitPref } from "@/lib/fit";
import { startYoucamCloth, pollYoucamCloth } from "@/lib/youcam.functions";
import modelImg from "@/assets/model.jpg";
import modelFemme from "@/assets/model-femme.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OmniFit AI — Essayage virtuel & taille parfaite" },
      { name: "description", content: "Mode homme et femme avec essayage virtuel YouCam réel et taille recommandée automatiquement." },
      { property: "og:title", content: "OmniFit AI — Essayage virtuel & taille parfaite" },
      { property: "og:description", content: "Essayez virtuellement, recevez la bonne taille, réduisez les retours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type CartItem = { id: string; name: string; size: string; price: number; image: string; qty: number };

function Index() {
  const [filter, setFilter] = useState<"tous" | "femme" | "homme">("tous");
  const [vto, setVto] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [b2b, setB2b] = useState(false);

  const add = (p: Product, size: string) => {
    setCart((c) => {
      const f = c.find((i) => i.id === p.id && i.size === size);
      if (f) return c.map((i) => (i === f ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { id: p.id, name: p.name, size, price: p.price, image: p.image, qty: 1 }];
    });
    toast.success(`${p.name} — taille ${size} ajoutée`);
    setCartOpen(true);
  };
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="font-display text-xl tracking-tight">OMNIFIT<span className="text-primary">.AI</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setB2b(true)} className="hidden rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-1.5"><TrendingDown className="h-3.5 w-3.5 text-primary" />B2B Merchant Impact</button>
            <button onClick={() => setCartOpen(true)} aria-label="Panier" className="relative rounded-full border border-border p-2 hover:bg-secondary">
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">YouCam VTO × OmniFit Analytics</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-normal leading-[1.02] sm:text-7xl">Essayez. Ajustez.<br /><em className="text-muted-foreground">Ne retournez plus.</em></h1>
        <p className="mt-6 max-w-xl text-muted-foreground">Essayage virtuel par IA et moteur morphologique explicable qui croise votre silhouette, la tolérance de coupe et le stock réel.</p>
        <button onClick={() => setB2b(true)} className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:hidden"><TrendingDown className="h-3.5 w-3.5 text-primary" />B2B Impact</button>
      </section>

      <div className="mx-auto flex max-w-7xl gap-2 px-5 pb-6">
        {(["tous", "femme", "homme"] as const).map((g) => (
          <button key={g} onClick={() => setFilter(g)} className={`rounded-full border px-4 py-1.5 text-sm capitalize ${filter === g ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>{g}</button>
        ))}
      </div>
      <main className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.filter((p) => filter === "tous" || p.gender === filter).map((p, i) => (
          <article key={p.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}>
            <button onClick={() => setVto(p)} className="relative block w-full overflow-hidden rounded-lg bg-card">
              <img src={p.image} alt={p.name} width={768} height={1024} loading={i ? "lazy" : undefined} className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[11px] backdrop-blur">{p.tag}</span>
            </button>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div><h2 className="font-display text-lg">{p.name}</h2><p className="text-xs capitalize text-muted-foreground">{p.gender}</p></div>
              <p>{p.price} €</p>
            </div>
            <button onClick={() => setVto(p)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"><Sparkles className="h-4 w-4" />Essayer virtuellement</button>
          </article>
        ))}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">OmniFit AI — Hackathon YouCam Skin AI & eCommerce VTO</footer>

      {vto && <VtoStudio p={vto} onClose={() => setVto(null)} onAdd={add} />}
      {b2b && <B2BModal onClose={() => setB2b(false)} />}
      <CartDrawer open={cartOpen} items={cart} setItems={setCart} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function Overlay({ onClose, children, side }: { onClose: () => void; children: React.ReactNode; side?: boolean }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200" role="dialog">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className={side ? "relative ml-auto h-full w-full max-w-md animate-in slide-in-from-right duration-300 border-l border-border bg-card" : "relative m-auto max-h-[92vh] w-[calc(100%-1.5rem)] max-w-5xl overflow-y-auto animate-in zoom-in-95 duration-300 rounded-xl border border-border bg-card"}>
        <button onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 z-10 rounded-full bg-background/70 p-2 hover:bg-secondary"><X className="h-4 w-4" /></button>
        {children}
      </div>
    </div>
  );
}

async function toDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const blob = await (await fetch(url)).blob();
  return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob); });
}

const STEPS = ["Préparation de la photo", "Envoi à YouCam", "L'IA habille la silhouette", "Finalisation du rendu"];

function VtoStudio({ p, onClose, onAdd }: { p: Product; onClose: () => void; onAdd: (p: Product, s: string) => void }) {
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
      throw new Error("Délai dépassé");
    } catch (e) {
      if (id !== runId.current) return;
      setError(e instanceof Error ? e.message : "Erreur inconnue"); setProgress(0);
    }
  };
  useEffect(() => { void run(defaultModel); return () => { runId.current++; }; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [p.id]);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setSrc(r.result as string); void run(r.result as string); };
    r.readAsDataURL(f);
  };
  const busy = !result && !error;
  const step = STEPS[Math.min(3, Math.floor(progress / 26))];
  const statusText = fit.status === "PERFECT_MATCH" ? "Ajustement parfait" : fit.status === "SMART_ALTERNATIVE" ? `Taille ${fit.idealSize} épuisée, ${fit.size} vous ira bien` : "Votre taille est en rupture";

  return (
    <Overlay onClose={onClose}>
      <div className="grid md:grid-cols-[3fr_2fr]">
        <div className="relative aspect-[3/4] select-none overflow-hidden bg-background">
          <img src={src} alt="Votre photo" className="absolute inset-0 h-full w-full object-cover" />
          {result && <>
            <div className="absolute inset-0 animate-in fade-in duration-700" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
              <img src={result} alt={`Rendu YouCam — ${p.name}`} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-px bg-foreground" style={{ left: `${split}%` }} />
            <input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(+e.target.value)} aria-label="Comparer avant/après" className="absolute inset-x-0 bottom-4 mx-auto w-2/3 accent-primary" />
            <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2 py-1 text-[11px]">Avant</span>
            <span className="absolute right-14 top-3 rounded-full bg-primary px-2 py-1 text-[11px] text-primary-foreground">Après</span>
          </>}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-background/60">
              <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_20px_var(--primary)] transition-all duration-700" style={{ top: `${progress}%` }} />
              <div className="w-2/3 text-center">
                <p className="text-sm text-primary">{step}… {progress}%</p>
                <div className="mt-2 h-1 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
                <p className="mt-2 text-xs text-muted-foreground">Rendu IA réel · 20 à 60 s</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center">
              <div><AlertTriangle className="mx-auto h-6 w-6 text-destructive" /><p className="mt-2 text-sm">L'essayage a échoué : {error}</p>
                <button onClick={() => run(src)} className="mt-3 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">Réessayer</button></div>
            </div>
          )}
        </div>
        <div className="space-y-5 p-6">
          <div>
            <p className="text-xs text-primary">Essayage virtuel YouCam</p>
            <h2 className="font-display text-2xl">{p.name}</h2>
            <p className="text-sm text-muted-foreground">{p.material} · {p.price} €</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-primary/60 py-4 text-sm hover:bg-secondary"><Upload className="h-4 w-4" />Essayer sur ma propre photo</button>
          {src !== defaultModel && <button onClick={() => { setSrc(defaultModel); void run(defaultModel); }} className="w-full text-xs text-muted-foreground underline">Revenir au mannequin</button>}

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm">Votre taille recommandée</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs text-muted-foreground">Taille <span className="text-foreground">{h} cm</span><input type="range" min={150} max={205} value={h} onChange={(e) => setH(+e.target.value)} className="mt-1 w-full accent-primary" /></label>
              <label className="text-xs text-muted-foreground">Poids <span className="text-foreground">{w} kg</span><input type="range" min={40} max={130} value={w} onChange={(e) => setW(+e.target.value)} className="mt-1 w-full accent-primary" /></label>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["ajustee", "standard", "oversize"] as FitPref[]).map((f) => (
                <button key={f} onClick={() => setPref(f)} className={`rounded-md border py-1.5 text-xs capitalize ${pref === f ? "border-primary bg-primary/10" : "border-border text-muted-foreground"}`}>{f === "ajustee" ? "Ajustée" : f}</button>
              ))}
            </div>
            <p className={`mt-3 flex items-center gap-2 text-sm ${fit.status === "PERFECT_MATCH" ? "text-success" : fit.status === "SMART_ALTERNATIVE" ? "text-warning" : "text-destructive"}`}>
              {fit.status === "PERFECT_MATCH" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {fit.size ? <><span className="font-display text-2xl text-foreground">{fit.size}</span>{statusText}</> : statusText}
            </p>
          </div>
          <button disabled={!fit.size} onClick={() => fit.size && onAdd(p, fit.size)} className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40">{fit.size ? `Ajouter ma taille ${fit.size} au panier` : "Indisponible"}</button>
        </div>
      </div>
    </Overlay>
  );
}

function B2BModal({ onClose }: { onClose: () => void }) {
  const stats = [["−38%", "Taux de retour"], ["€4,20", "Économie logistique / commande"], ["+22%", "Conversion après essayage"], ["€126k", "Économies annuelles estimées*"]];
  return (
    <Overlay onClose={onClose}>
      <div className="max-w-2xl p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary">B2B Merchant Impact</p>
        <h2 className="mt-1 font-display text-3xl">Moins de retours, plus de marge.</h2>
        <div className="mt-6 grid grid-cols-2 gap-3">{stats.map(([v, l]) => (
          <div key={l} className="rounded-lg border border-border p-4"><p className="font-display text-3xl text-primary">{v}</p><p className="mt-1 text-xs text-muted-foreground">{l}</p></div>
        ))}</div>
        <p className="mt-4 font-mono text-[10px] text-muted-foreground">*Projection pour 30 000 commandes/an, chiffres de démonstration.</p>
      </div>
    </Overlay>
  );
}

function CartDrawer({ open, items, setItems, onClose }: { open: boolean; items: CartItem[]; setItems: (f: (c: CartItem[]) => CartItem[]) => void; onClose: () => void }) {
  if (!open) return null;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const qty = (i: CartItem, d: number) => setItems((c) => c.map((x) => (x === i ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));
  return (
    <Overlay onClose={onClose} side>
      <div className="flex h-full flex-col p-6">
        <h2 className="font-display text-2xl">Panier</h2>
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {items.length === 0 && <p className="text-sm text-muted-foreground">Votre panier est vide.</p>}
          {items.map((i) => (
            <div key={i.id + i.size} className="flex gap-3">
              <img src={i.image} alt={i.name} className="h-24 w-18 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm">{i.name}</p>
                <p className="font-mono text-xs text-muted-foreground">Taille {i.size} · {i.price} €</p>
                <div className="mt-2 inline-flex items-center rounded-md border border-border font-mono text-xs">
                  <button onClick={() => qty(i, -1)} className="px-2.5 py-1">−</button><span className="px-2">{i.qty}</span><button onClick={() => qty(i, 1)} className="px-2.5 py-1">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex justify-between font-mono"><span>Total</span><span>{total} €</span></div>
          <button disabled={!items.length} onClick={() => { toast.success("Commande simulée — merci !"); setItems(() => []); onClose(); }} className="mt-4 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40">Commander</button>
        </div>
      </div>
    </Overlay>
  );
}
