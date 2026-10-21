import denim from "@/assets/denim.jpg";
import bomber from "@/assets/bomber.jpg";
import trench from "@/assets/trench.jpg";
import type { SizeSpec, Stretch } from "./fit";

export type Product = { id: string; name: string; tag: string; price: number; image: string; stretch: Stretch; material: string; sizes: SizeSpec[] };

export const PRODUCTS: Product[] = [
  { id: "denim", name: "Veste Cyber-Tech Denim", tag: "Drop 07", price: 189, image: denim, stretch: "moyen", material: "Denim selvedge 98% coton, 2% élasthanne, liserés réfléchissants",
    sizes: [
      { size: "S", shoulders: 44, chest: 100, length: 64, stock: 4 },
      { size: "M", shoulders: 46, chest: 106, length: 66, stock: 0 },
      { size: "L", shoulders: 48, chest: 112, length: 68, stock: 7 },
      { size: "XL", shoulders: 50, chest: 118, length: 70, stock: 2 },
    ] },
  { id: "bomber", name: "Bomber Minimaliste", tag: "Essentiel", price: 149, image: bomber, stretch: "faible", material: "Nylon technique mat, doublure satin recyclé",
    sizes: [
      { size: "S", shoulders: 45, chest: 104, length: 63, stock: 6 },
      { size: "M", shoulders: 47, chest: 110, length: 65, stock: 9 },
      { size: "L", shoulders: 49, chest: 116, length: 67, stock: 0 },
      { size: "XL", shoulders: 51, chest: 122, length: 69, stock: 3 },
    ] },
  { id: "trench", name: "Trench Techwear", tag: "Lab Edition", price: 329, image: trench, stretch: "eleve", material: "Gabardine déperlante 3 couches, sangles modulables",
    sizes: [
      { size: "S", shoulders: 45, chest: 106, length: 112, stock: 0 },
      { size: "M", shoulders: 47, chest: 112, length: 115, stock: 3 },
      { size: "L", shoulders: 49, chest: 118, length: 118, stock: 0 },
      { size: "XL", shoulders: 51, chest: 124, length: 121, stock: 5 },
    ] },
];
