import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const runYoucamCloth = createServerFn({ method: "POST" })
  .inputValidator(z.object({ apiKey: z.string().min(8).max(500), srcUrl: z.string().max(2_000_000), refUrl: z.string().max(2_000_000) }))
  .handler(async ({ data }) => {
    try {
      const res = await fetch("https://yce-api-01.perfectcorp.com/s2s/v2.0/task/cloth", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ src_file_url: data.srcUrl, ref_file_url: data.refUrl, garment_category: "upper_body" }),
      });
      const text = await res.text();
      return { ok: res.ok, status: res.status, body: text.slice(0, 2000) };
    } catch (e) {
      return { ok: false, status: 0, body: e instanceof Error ? e.message : "network error" };
    }
  });
