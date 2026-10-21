import { describe, it, expect } from "vitest";
import { computeFit } from "./fit";
import { PRODUCTS } from "./products";

const denim = PRODUCTS[0]!.sizes;

describe("computeFit", () => {
  it("validates an in-stock ideal size as PERFECT_MATCH", () => {
    const r = computeFit(PRODUCTS[1]!.sizes, "faible", 182, 80, "standard");
    expect(r.status).toBe("PERFECT_MATCH");
    expect(r.size).toBe("M");
  });
  it("recommends an in-stock neighbour when ideal size is sold out", () => {
    const r = computeFit(denim, "moyen", 178, 72, "standard");
    expect(r.idealSize).toBe("M");
    expect(r.status).toBe("SMART_ALTERNATIVE");
    expect(r.size).not.toBe("M");
  });
  it("flags out of stock when nothing fits", () => {
    const sizes = denim.map((s) => ({ ...s, stock: s.size === "XL" ? 1 : 0 }));
    const r = computeFit(sizes, "faible", 165, 55, "ajustee");
    expect(r.status).toBe("OUT_OF_STOCK");
    expect(r.size).toBeNull();
  });
});
