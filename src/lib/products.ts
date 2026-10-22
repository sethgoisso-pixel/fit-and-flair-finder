import denim from "@/assets/denim.jpg";
import bomber from "@/assets/bomber.jpg";
import trench from "@/assets/trench.jpg";
import robe from "@/assets/robe.jpg";
import jupe from "@/assets/jupe.jpg";
import pantalon from "@/assets/pantalon.jpg";
import type { SizeSpec, Stretch } from "./fit";

export type Gender = "homme" | "femme";
export type Category = "upper_body" | "lower_body" | "full_body";
export type Product = { id: string; name: string; tag: string; price: number; image: string; stretch: Stretch; material: string; gender: Gender; category: Category; sizes: SizeSpec[] };

const std = (base: number, stock: number[]): SizeSpec[] =>
  ["S", "M", "L", "XL"].map((size, i) => ({ size, shoulders: 44 + i * 2, chest: base + i * 6, length: 66 + i * 2, stock: stock[i] ?? 0 }));

export const PRODUCTS: Product[] = [
  { id: "denim", name: "Veste Cyber-Tech Denim", tag: "Drop 07", price: 189, image: denim, stretch: "moyen", gender: "homme", category: "upper_body", material: "Denim selvedge, liserés réfléchissants",
    sizes: [
      { size: "S", shoulders: 44, chest: 100, length: 64, stock: 4 },
      { size: "M", shoulders: 46, chest: 106, length: 66, stock: 0 },
      { size: "L", shoulders: 48, chest: 112, length: 68, stock: 7 },
      { size: "XL", shoulders: 50, chest: 118, length: 70, stock: 2 },
    ] },
  { id: "bomber", name: "Bomber Minimaliste", tag: "Essentiel", price: 149, image: bomber, stretch: "faible", gender: "homme", category: "upper_body", material: "Nylon technique mat",
    sizes: [
      { size: "S", shoulders: 45, chest: 104, length: 63, stock: 6 },
      { size: "M", shoulders: 47, chest: 110, length: 65, stock: 9 },
      { size: "L", shoulders: 49, chest: 116, length: 67, stock: 0 },
      { size: "XL", shoulders: 51, chest: 122, length: 69, stock: 3 },
    ] },
  { id: "trench", name: "Trench Techwear", tag: "Lab Edition", price: 329, image: trench, stretch: "eleve", gender: "homme", category: "upper_body", material: "Gabardine déperlante 3 couches",
    sizes: [
      { size: "S", shoulders: 45, chest: 106, length: 112, stock: 0 },
      { size: "M", shoulders: 47, chest: 112, length: 115, stock: 3 },
      { size: "L", shoulders: 49, chest: 118, length: 118, stock: 0 },
      { size: "XL", shoulders: 51, chest: 124, length: 121, stock: 5 },
    ] },
  { id: "pantalon", name: "Cargo Techwear", tag: "Nouveau", price: 139, image: pantalon, stretch: "moyen", gender: "homme", category: "lower_body", material: "Ripstop déperlant, poches zippées", sizes: std(100, [3, 5, 0, 4]) },
  { id: "robe", name: "Robe Fourreau Noire", tag: "Soirée", price: 219, image: robe, stretch: "eleve", gender: "femme", category: "full_body", material: "Crêpe stretch fluide", sizes: std(92, [2, 0, 6, 3]) },
  { id: "jupe", name: "Jupe Plissée Sable", tag: "Essentiel", price: 119, image: jupe, stretch: "faible", gender: "femme", category: "lower_body", material: "Twill plissé permanent", sizes: std(94, [5, 4, 0, 2]) },
];
