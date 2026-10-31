# OmniFit AI — Virtual Try-On & Biomechanical Sizing Engine

> **Submitted to the YouCam API Skin AI & eCommerce VTO Hackathon (Perfect Corp.)**
> Fewer sizing returns by pairing YouCam's AI Cloth virtual try-on with a transparent fit-risk engine and a merchant ROI calculator.

**Live demo:** https://omnifit-ai.lovable.app

---

## Problem

Online fashion has a costly returns problem, and sizing uncertainty is a major cause:

- A widely cited industry estimate puts apparel returns bought online at around **38%**.
- Shoppers practice **"bracket shopping"**: they order S, M and L, then return two.
- Most virtual try-on tools are visual stickers: they show the garment but cannot say whether the fabric will pull at the shoulders or squeeze the chest.

## Solution

OmniFit turns virtual try-on into a purchase decision.

1. **Photorealistic try-on with YouCam AI Cloth**
   - Server-side integration with the YouCam `task/cloth` API (create a task, then poll until it succeeds).
   - Before/after comparison slider and download of the result.
   - Works with curated model photos or with the shopper's own photo.
2. **Fit-risk engine (heuristic)**
   - Three inputs: height (cm), weight (kg), fit preference (Fitted / Regular / Oversized).
   - Estimates chest, shoulders and length from height and weight, adds a target ease (4, 8 or 14 cm) and compares them with each size's garment measurements and the fabric stretch tolerance (2, 4 or 6 cm).
   - Returns one of three outcomes: perfect match, smart alternative (an in-stock neighbouring size) or out of stock, with a confidence value, a return-risk score and a plain-language explanation.
3. **Merchant ROI calculator**
   - Illustrates the effect of a lower return rate on logistics cost and CO2.
   - The figures are editable assumptions (see Limitations), not measurements.
4. **Simple checkout flow**
   - "Add recommended size to cart", with the fit guarantee and CO2 impact shown in the cart.

## How the try-on works

```
Browser ──(photo + garment as data URLs)──▶ server function startYoucamCloth
        ◀────────────── taskId ───────────────  │
                                                 ├─ stores both images in a private Supabase bucket ("vto")
                                                 ├─ creates 1-hour signed URLs
                                                 └─ POST https://yce-api-01.perfectcorp.com/s2s/v2.0/task/cloth
Browser ──(taskId, polling)──▶ server function pollYoucamCloth ──▶ GET .../task/cloth/{taskId}
        ◀────── status: running | success (result URL) | error ──────
```

The YouCam key is read only on the server. It never reaches the browser.

## Tech stack

- **Virtual try-on:** Perfect Corp. YouCam AI Cloth API
- **Framework:** TanStack Start (React 19, server functions)
- **Styling:** Tailwind CSS v4, Lucide icons
- **Backend:** Lovable Cloud (Supabase): server functions and private image storage
- **Language:** TypeScript
- **Tests:** Vitest

## Run it yourself

Requirements: [Bun](https://bun.sh) (or Node 22+), a Supabase project, and a YouCam API key.

```sh
git clone https://github.com/sethgoisso-pixel/fit-and-flair-finder
cd fit-and-flair-finder
bun install
```

1. In your Supabase project, create a **private storage bucket named `vto`**.
2. Create a `.env.local` file in the project root (never commit it) with:

| Variable | Used for | Where |
|---|---|---|
| `YOUCAM_API_KEY` | YouCam API authentication | server only |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Supabase client | server |
| `SUPABASE_SERVICE_ROLE_KEY` | Uploading images to the `vto` bucket | server only, secret |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase client | browser (public values) |

3. Start the app and run the tests:

```sh
bun dev        # then open http://localhost:8080
bun run test   # unit tests for the fit engine and routing
```

On Lovable Cloud, the same values are project secrets. The repository's `.env` file contains only public Supabase values.

## Data handling

- Only the photos the shopper chooses to upload are sent, together with a garment image.
- Images are stored in a **private** bucket under random file names and reached through **signed links that expire after 1 hour**.
- **This prototype does not delete uploaded images automatically.** Before any production use I would add a retention policy and a deletion job, plus explicit consent text.
- No personal data other than the photo and the height/weight values typed in the profile.

## Limitations

- The fit engine is a **heuristic** built from simple textile ease rules. The body estimate from height and weight is deliberately crude. Its risk scores are estimates, not validated return rates.
- The merchant figures (return-rate drop, EUR 14.50 per avoided return, 3.4 kg CO2 per avoided parcel) are **editable assumptions** that illustrate the ROI, not measured results.
- Try-on quality depends on the photo and on the YouCam API. Results can take a few seconds to a few tens of seconds.
- The demo catalog is small and hand-made.

## Author

- **Seth Goisso**
- Built for the YouCam API Skin AI & eCommerce VTO Hackathon on Devpost, powered by Perfect Corp. YouCam APIs.
- Built with [Lovable](https://lovable.dev), with AI-assisted development (Lovable, Claude). I tested the results and corrected issues myself.

## License

MIT, see [LICENSE](./LICENSE).
