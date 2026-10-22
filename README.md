# Fit And Flair Finder

Créer l'application e-commerce de mode OmniFit AI pour le hackathon YouCam API Skin AI & eCommerce VTO.

Design & UI/UX :
- Style sombre haut de gamme, minimaliste et percutant (esthétique Nike Lab / Zara Studio / luxury fashion tech).
- Typographie soignée, badges discrets, animations fluides, totalement responsive mobile et desktop.

Fonctionnalités clés :
1. Catalogue e-commerce :
- Fiches de vêtements tendance (ex: Veste Cyber-Tech Denim, Bomber Minimaliste, Trench Techwear) avec photos élégantes.
- Fiches techniques complètes pour chaque article : guide des tailles en cm (épaules, poitrine, longueur), coefficient d'élasticité (stretch faible/moyen/élevé) et inventaire par taille (avec certaines tailles volontairement en rupture de stock pour la démo).

2. Studio d'essayage virtuel YouCam (VTO) :
- Bouton "Essayer virtuellement" sur chaque produit.
- Mode Démo instantané ultra-fluide avec modèles prédéfinis et comparaison avant/après réaliste.
- Upload de photo utilisateur avec barre de progression de scan.
- Modal de configuration pour renseigner une clé API YouCam réelle (appel POST /s2s/v2.0/task/cloth), avec bascule transparente vers une simulation réaliste si aucune clé n'est fournie.

3. Calculateur Morphologique & Moteur "OmniFit Analytics" (Anti-Retour) :
- Formulaire morphologique rapide en 3 clics : Taille (cm), Poids (kg), Coupe souhaitée (Ajustée / Standard / Oversize).
- Algorithme transparent et explicable qui croise morphologie, tolérance de coupe du vêtement et stocks réels.
- Affichage du statut : PERFECT_MATCH (ex: "Taille M validée à 95%, risque de retour estimé < 2%"), SMART_ALTERNATIVE (ex: "Taille M épuisée, recommandation L oversize cohérente avec la coupe"), ou alerte de rupture.
- Comparatif visuel clair des mesures recommandées vs produit.

4. Expérience d'achat & Valeur B2B :
- Bouton d'action direct "Ajouter la taille recommandée au panier".
- Tiroir panier interactif fonctionnel.
- Petit onglet discret ou badge "B2B Merchant Impact" montrant les bénéfices pour la marque : taux de retour diminué de 38%, économies logistiques estimées.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fit-and-flair-finder.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b47f71b4-1041-4283-8b96-5e0a9d1fc3b7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
