# OmniFit AI — Virtual Try-On & Biomechanical Sizing Engine

> **Submitted to the YouCam API Skin AI & eCommerce VTO Hackathon (Perfect Corp.)**
> Stopping fashion's 38% return rate by merging YouCam's AI Cloth VTO with a real-time biomechanical tension engine and merchant ROI intelligence.

**Live Demo**: https://omnifit-ai.lovable.app

---

## Problem

Online fashion faces a multi-billion-dollar reverse logistics crisis:

- Over **38% of apparel bought online is returned**, mostly because of sizing uncertainty.
- Shoppers practice **"bracket shopping"**: they order S, M and L, then return two.
- Most virtual try-on tools are visual stickers: they show the garment, but cannot tell whether the fabric pulls at the shoulders or squeezes the chest.

## Solution

OmniFit turns virtual try-on into an actionable, low-risk purchase decision.

1. **Photorealistic VTO powered by YouCam AI Cloth v2**
   - Live server-side integration with the YouCam `task/cloth` API (async task + polling).
   - Before/after comparison slider and HD look download.
   - Works on curated women's and men's models or on the shopper's own photo.

2. **Real-time biomechanical tension engine**
   - 3-click body profile: height (cm), weight (kg), fit preference (Fitted / Regular / Oversized).
   - Computes body measurements, target ease and fabric stretch tolerance per size.
   - Live return-risk score: low for an optimal drape, high under fabric tension.

3. **B2B merchant ROI calculator**
   - Models the return-rate drop from 32% to 11%.
   - Logistics savings (EUR 14.50 per avoided return) and CO2 prevented (3.4 kg per avoided parcel).

4. **Frictionless checkout**
   - One-click "Add recommended size to cart".
   - Cart with OmniFit Fit Guarantee and CO2 impact.

## Tech Stack

- **AI Virtual Try-On**: Perfect Corp. YouCam AI Cloth v2 API
- **Framework**: TanStack Start (React 19, server functions)
- **Styling**: Tailwind CSS v4, Lucide icons
- **Backend**: Lovable Cloud (server functions keep YouCam credentials private, image storage)
- **Language**: TypeScript

## Local Development

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun dev
```
Then open http://localhost:8080.

## Limitations
The fit engine is a heuristic model built from simple textile ease rules; its risk scores are estimates, not validated return rates. The merchant figures (return-rate drop, EUR 14.50 per avoided return, 3.4 kg CO2 per parcel) are editable assumptions that illustrate the ROI, not measured results. Try-on quality depends on the photo and the YouCam API. Built with AI-assisted tools (Lovable, Claude); I tested the results and corrected issues myself.

## Author

- **Seth Goisso**
- Built for the YouCam API Skin AI & eCommerce VTO Hackathon on Devpost, powered by Perfect Corp. YouCam APIs.
- Built with [Lovable](https://lovable.dev).
