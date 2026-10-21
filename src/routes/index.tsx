import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Sparkles, X, Upload, KeyRound, TrendingDown, Ruler, Check, AlertTriangle, Shuffle } from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/products";
import { computeFit, type FitPref } from "@/lib/fit";
import { runYoucamCloth } from "@/lib/youcam.functions";
import modelImg from "@/assets/model.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OmniFit AI — Essayage virtuel & taille parfaite" },
      { name: "description", content: "Mode techwear avec essayage virtuel YouCam et moteur anti-retour OmniFit Analytics." },
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
  const [active, setActive] = useState<Product | null>(null);
  const [vto, setVto] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [b2b, setB2b] = useState(false);
  const [apiKey, setApiKey] = useState("");
  useEffect(() => setApiKey(localStorage.getItem("youcam_key") ?? ""), []);

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
            <button onClick={() => setKeyOpen(true)} aria-label="Clé API YouCam" className="rounded-full border border-border p-2 hover:bg-secondary"><KeyRound className="h-4 w-4" /></button>
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

      <main className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <article key={p.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}>
            <button onClick={() => setActive(p)} className="relative block w-full overflow-hidden rounded-lg bg-card">
              <img src={p.image} alt={p.name} width={768} height={1024} loading={i ? "lazy" : undefined} className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur">{p.tag}</span>
              {p.sizes.some((s) => s.stock === 0) && <span className="absolute right-3 top-3 rounded-full border border-destructive/50 bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase text-destructive backdrop-blur">Stock limité</span>}
            </button>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div><h2 className="font-display text-lg">{p.name}</h2><p className="font-mono text-xs uppercase text-muted-foreground">Stretch {p.stretch}</p></div>
              <p className="font-mono">{p.price} €</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setActive(p)} className="rounded-md border border-border py-2.5 text-sm hover:bg-secondary">Fiche & taille</button>
              <button onClick={() => setVto(p)} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"><Sparkles className="h-4 w-4" />Essayer virtuellement</button>
            </div>
          </article>
        ))}
      </main>

      <footer className="border-t border-border py-8 text-center font-mono text-xs text-muted-foreground">OmniFit AI — Hackathon YouCam Skin AI & eCommerce VTO</footer>

      {active && <ProductSheet p={active} onClose={() => setActive(null)} onAdd={add} onTry={() => { setVto(active); setActive(null); }} />}
      {vto && <VtoStudio p={vto} apiKey={apiKey} onClose={() => setVto(null)} onKey={() => setKeyOpen(true)} />}
      {keyOpen && <KeyModal value={apiKey} onClose={() => setKeyOpen(false)} onSave={(k) => { setApiKey(k); localStorage.setItem("youcam_key", k); setKeyOpen(false); toast(k ? "Clé YouCam enregistrée" : "Mode simulation activé"); }} />}
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

function ProductSheet({ p, onClose, onAdd, onTry }: { p: Product; onClose: () => void; onAdd: (p: Product, s: string) => void; onTry: () => void }) {
  const [h, setH] = useState(178);
  const [w, setW] = useState(72);
  const [pref, setPref] = useState<FitPref>("standard");
  const fit = useMemo(() => computeFit(p.sizes, p.stretch, h, w, pref), [p, h, w, pref]);
  const rec = p.sizes.find((s) => s.size === fit.size);
  const statusStyle = fit.status === "PERFECT_MATCH" ? "border-success/50 text-success" : fit.status === "SMART_ALTERNATIVE" ? "border-warning/50 text-warning" : "border-destructive/50 text-destructive";

  return (
    <Overlay onClose={onClose}>
      <div className="grid md:grid-cols-[2fr_3fr]">
        <img src={p.image} alt={p.name} width={768} height={1024} className="aspect-[3/4] w-full object-cover md:h-full" />
        <div className="space-y-6 p-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary">{p.tag}</p>
            <h2 className="font-display text-3xl">{p.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.material}</p>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground"><Ruler className="h-3.5 w-3.5" />Guide des tailles (cm) · stretch {p.stretch}</h3>
            <table className="w-full font-mono text-xs">
              <thead className="text-muted-foreground"><tr className="border-b border-border"><th className="py-1.5 text-left">Taille</th><th>Épaules</th><th>Poitrine</th><th>Longueur</th><th className="text-right">Stock</th></tr></thead>
              <tbody>{p.sizes.map((s) => (
                <tr key={s.size} className={`border-b border-border/50 text-center ${s.size === fit.size ? "bg-primary/10" : ""}`}>
                  <td className="py-1.5 text-left">{s.size}</td><td>{s.shoulders}</td><td>{s.chest}</td><td>{s.length}</td>
                  <td className={`text-right ${s.stock ? "" : "text-destructive"}`}>{s.stock ? `${s.stock} pcs` : "Rupture"}</td>
                </tr>))}</tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">OmniFit Analytics · calculateur morphologique</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs text-muted-foreground">Taille: <span className="font-mono text-foreground">{h} cm</span><input type="range" min={150} max={205} value={h} onChange={(e) => setH(+e.target.value)} className="mt-1 w-full accent-primary" /></label>
              <label className="text-xs text-muted-foreground">Poids: <span className="font-mono text-foreground">{w} kg</span><input type="range" min={45} max={130} value={w} onChange={(e) => setW(+e.target.value)} className="mt-1 w-full accent-primary" /></label>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["ajustee", "standard", "oversize"] as FitPref[]).map((f) => (
                <button key={f} onClick={() => setPref(f)} className={`rounded-md border py-2 text-xs capitalize ${pref === f ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>{f === "ajustee" ? "Ajustée" : f}</button>
              ))}
            </div>

            <div key={fit.status + fit.size} className={`mt-4 animate-in fade-in rounded-md border p-3 ${statusStyle}`}>
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">{fit.status === "PERFECT_MATCH" ? <Check className="h-4 w-4" /> : fit.status === "SMART_ALTERNATIVE" ? <Shuffle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{fit.status}</p>
              <p className="mt-1 text-sm text-foreground">
                {fit.status === "PERFECT_MATCH" && `Taille ${fit.size} validée à ${fit.confidence}%, risque de retour estimé < ${fit.returnRisk}%`}
                {fit.status === "SMART_ALTERNATIVE" && `Taille ${fit.idealSize} épuisée, recommandation ${fit.size} ${pref === "oversize" || fit.size! > fit.idealSize ? "plus ample" : ""} cohérente avec la coupe (${fit.confidence}%, risque ${fit.returnRisk}%)`}
                {fit.status === "OUT_OF_STOCK" && `Taille idéale ${fit.idealSize} en rupture, aucune alternative fiable. Alerte de réassort recommandée.`}
              </p>
              <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-muted-foreground">{fit.explanation.map((e) => <li key={e}>→ {e}</li>)}</ul>
            </div>

            {rec && (
              <div className="mt-4 space-y-2">
                {[["Poitrine", fit.target.chest, rec.chest, 130], ["Épaules", Math.round(fit.target.shoulders), rec.shoulders, 60]].map(([l, t, v, max]) => (
                  <div key={l as string} className="font-mono text-[11px]">
                    <div className="flex justify-between text-muted-foreground"><span>{l}</span><span>cible {t} · produit {v} cm</span></div>
                    <div className="relative mt-1 h-1.5 rounded-full bg-secondary">
                      <div className="absolute h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((v as number) / (max as number)) * 100}%` }} />
                      <div className="absolute -top-1 h-3.5 w-0.5 bg-foreground transition-all duration-500" style={{ left: `${((t as number) / (max as number)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button disabled={!fit.size} onClick={() => fit.size && onAdd(p, fit.size)} className="rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-40">{fit.size ? `Ajouter la taille ${fit.size} au panier` : "Indisponible"}</button>
            <button onClick={onTry} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border py-3 text-sm hover:bg-secondary"><Sparkles className="h-4 w-4" />Essayer virtuellement</button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function VtoStudio({ p, apiKey, onClose, onKey }: { p: Product; apiKey: string; onClose: () => void; onKey: () => void }) {
  const [src, setSrc] = useState<string>(modelImg);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [split, setSplit] = useState(50);
  const [mode, setMode] = useState<"demo" | "api">("demo");
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (image: string, fast: boolean) => {
    setDone(false); setProgress(0);
    let apiOk = false;
    const apiCall = apiKey ? runYoucamCloth({ data: { apiKey, srcUrl: image.startsWith("data:") ? image : location.origin + image, refUrl: location.origin + p.image } }).then((r) => { apiOk = r.ok; if (!r.ok) toast(`YouCam API (${r.status}) indisponible — bascule en simulation`); }).catch(() => toast("YouCam API injoignable — simulation")) : Promise.resolve();
    const steps = fast ? 12 : 30;
    for (let i = 1; i <= steps; i++) { await new Promise((r) => setTimeout(r, fast ? 40 : 70)); setProgress(Math.round((i / steps) * 100)); }
    await apiCall;
    setMode(apiOk ? "api" : "demo");
    setDone(true);
  };
  useEffect(() => { run(modelImg, true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [p.id]);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setSrc(r.result as string); run(r.result as string, false); };
    r.readAsDataURL(f);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="grid md:grid-cols-[3fr_2fr]">
        <div className="relative aspect-[3/4] select-none overflow-hidden bg-background">
          <img src={src} alt="Avant" className="absolute inset-0 h-full w-full object-cover" />
          {done && (
            <div className="absolute inset-0 animate-in fade-in duration-500" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
              <img src={src} alt="Après" className="absolute inset-0 h-full w-full object-cover" />
              <img src={p.image} alt="" className="absolute left-1/2 top-[13%] w-[62%] -translate-x-1/2 mix-blend-lighten" style={{ maskImage: "radial-gradient(ellipse 55% 50% at 50% 45%, black 60%, transparent 100%)" }} />
            </div>
          )}
          {done && <>
            <div className="pointer-events-none absolute inset-y-0 w-px bg-foreground" style={{ left: `${split}%` }} />
            <input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(+e.target.value)} aria-label="Comparer avant/après" className="absolute inset-x-0 bottom-4 mx-auto w-2/3 accent-primary" />
            <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2 py-1 font-mono text-[10px] uppercase">Avant</span>
            <span className="absolute right-14 top-3 rounded-full bg-primary px-2 py-1 font-mono text-[10px] uppercase text-primary-foreground">Après</span>
          </>}
          {!done && (
            <div className="absolute inset-0 grid place-items-center bg-background/60">
              <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_20px_var(--primary)]" style={{ top: `${progress}%` }} />
              <div className="w-2/3 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-primary">Scan morphologique {progress}%</p>
                <div className="mt-2 h-1 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-5 p-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-primary">Studio VTO YouCam</p>
            <h2 className="font-display text-2xl">{p.name}</h2>
            <p className="mt-2 inline-flex rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase text-muted-foreground">{mode === "api" ? "YouCam API · live" : apiKey ? "Clé fournie · simulation de secours" : "Mode démo · simulation"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Modèle prédéfini</p>
            <button onClick={() => { setSrc(modelImg); run(modelImg, true); }} className={`overflow-hidden rounded-md border-2 ${src === modelImg ? "border-primary" : "border-border"}`}><img src={modelImg} alt="Modèle" className="h-24 w-18 object-cover" /></button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-4 text-sm hover:bg-secondary"><Upload className="h-4 w-4" />Importer ma photo</button>
          <button onClick={onKey} className="flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 text-xs text-muted-foreground hover:text-foreground"><KeyRound className="h-3.5 w-3.5" />Configurer la clé API YouCam</button>
          <p className="font-mono text-[10px] text-muted-foreground">Faites glisser le curseur pour comparer avant / après.</p>
        </div>
      </div>
    </Overlay>
  );
}

function KeyModal({ value, onClose, onSave }: { value: string; onClose: () => void; onSave: (k: string) => void }) {
  const [k, setK] = useState(value);
  return (
    <Overlay onClose={onClose}>
      <div className="max-w-md space-y-4 p-6">
        <h2 className="font-display text-2xl">Clé API YouCam</h2>
        <p className="text-sm text-muted-foreground">Utilisée pour appeler <code className="font-mono text-xs text-foreground">POST /s2s/v2.0/task/cloth</code>. Sans clé, une simulation réaliste prend le relais automatiquement. La clé reste stockée dans votre navigateur.</p>
        <input type="password" value={k} onChange={(e) => setK(e.target.value)} placeholder="sk-youcam-..." className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-primary" />
        <div className="flex gap-2">
          <button onClick={() => onSave(k.trim())} className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground">Enregistrer</button>
          <button onClick={() => onSave("")} className="flex-1 rounded-md border border-border py-2.5 text-sm">Mode simulation</button>
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
