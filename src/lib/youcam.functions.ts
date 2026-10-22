import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://yce-api-01.perfectcorp.com/s2s/v2.0/task/cloth";

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!m || !m[1] || !m[2]) throw new Error("Format d'image invalide");
  const mime = m[1];
  const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  const ext = mime.split("/")[1] ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const up = await supabaseAdmin.storage.from("vto").upload(path, bytes, { contentType: mime });
  if (up.error) throw new Error("Upload impossible");
  const signed = await supabaseAdmin.storage.from("vto").createSignedUrl(path, 3600);
  if (signed.error || !signed.data) throw new Error("URL signée impossible");
  return signed.data.signedUrl;
}

function key() {
  const k = process.env["YOUCAM_API_KEY"];
  if (!k) throw new Error("Clé YouCam absente");
  return k;
}

export const startYoucamCloth = createServerFn({ method: "POST" })
  .inputValidator(z.object({ person: z.string().max(11_000_000), garment: z.string().max(11_000_000) }))
  .handler(async ({ data }) => {
    try {
      const [src, ref] = await Promise.all([uploadDataUrl(data.person), uploadDataUrl(data.garment)]);
      const res = await fetch(API, {
        method: "POST",
        headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ src_file_url: src, ref_file_url: ref, garment_category: "upper_body" }),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { task_id?: string } };
      if (!res.ok || !json.data?.task_id) {
        console.error("YouCam create failed", res.status, JSON.stringify(json).slice(0, 500));
        return { ok: false as const, error: `YouCam a refusé la requête (${res.status})` };
      }
      return { ok: true as const, taskId: json.data.task_id };
    } catch (e) {
      console.error("YouCam create error", e);
      return { ok: false as const, error: e instanceof Error ? e.message : "Erreur réseau" };
    }
  });

export const pollYoucamCloth = createServerFn({ method: "POST" })
  .inputValidator(z.object({ taskId: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`${API}/${encodeURIComponent(data.taskId)}`, { headers: { Authorization: `Bearer ${key()}` } });
      const json = (await res.json().catch(() => ({}))) as { data?: { task_status?: string; results?: { url?: string } | { url?: string }[]; error?: string } };
      const status = (json.data?.task_status ?? "").toLowerCase();
      const r = json.data?.results;
      const url = Array.isArray(r) ? r[0]?.url : r?.url;
      if (status === "success" && url) return { status: "success" as const, url };
      if (status === "error" || status === "failed" || !res.ok) {
        console.error("YouCam poll failed", res.status, JSON.stringify(json).slice(0, 500));
        return { status: "error" as const, error: json.data?.error ?? `Statut ${res.status}` };
      }
      return { status: "running" as const };
    } catch (e) {
      return { status: "error" as const, error: e instanceof Error ? e.message : "Erreur réseau" };
    }
  });
