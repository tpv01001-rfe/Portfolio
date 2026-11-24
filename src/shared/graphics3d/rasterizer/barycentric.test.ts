
import { describe, expect, it } from "vitest";

import {
  barycentricCoordinates,
  isInsideTriangle,
} from "./barycentric";

describe("Barycentric coordinates", () => {
  const a = { x: 0, y: 0 };
  const b = { x: 4, y: 0 };
  const c = { x: 0, y: 4 };

it("ger vikten 1 för respektive hörn", () => {
  const baryA = barycentricCoordinates(a, a, b, c);
  const baryB = barycentricCoordinates(b, a, b, c);
  const baryC = barycentricCoordinates(c, a, b, c);

  expect(baryA).not.toBeNull();
  expect(baryB).not.toBeNull();
  expect(baryC).not.toBeNull();

  expect(baryA!.alpha).toBeCloseTo(1);
  expect(baryA!.beta).toBeCloseTo(0);
  expect(baryA!.gamma).toBeCloseTo(0);

  expect(baryB!.alpha).toBeCloseTo(0);
  expect(baryB!.beta).toBeCloseTo(1);
  expect(baryB!.gamma).toBeCloseTo(0);

  expect(baryC!.alpha).toBeCloseTo(0);
  expect(baryC!.beta).toBeCloseTo(0);
  expect(baryC!.gamma).toBeCloseTo(1);
});

  it("ger tre lika vikter i triangelns tyngdpunkt", () => {
    const p = { x: 4 / 3, y: 4 / 3 };
    const bary = barycentricCoordinates(p, a, b, c);

    expect(bary).not.toBeNull();

    expect(bary!.alpha).toBeCloseTo(1 / 3);
    expect(bary!.beta).toBeCloseTo(1 / 3);
    expect(bary!.gamma).toBeCloseTo(1 / 3);
  });

  it("identifierar punkter inuti triangeln", () => {
    const bary = barycentricCoordinates(
      { x: 1, y: 1 }, a, b, c
    );

    expect(bary).not.toBeNull();
    expect(isInsideTriangle(bary!)).toBe(true);
  });

  it("identifierar punkter utanför triangeln", () => {
    const bary = barycentricCoordinates(
      { x: 3, y: 3 }, a, b, c
    );

    expect(bary).not.toBeNull();
    expect(isInsideTriangle(bary!)).toBe(false);
  });

  it("hanterar degenererade trianglar", () => {
    const result = barycentricCoordinates(
      { x: 1, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    );

    expect(result).toBeNull();
  });

  it("fungerar även med omvänd hörnordning", () => {
    const p = { x: 1, y: 1 };

    const bary = barycentricCoordinates(p, a, c, b);

    expect(bary).not.toBeNull();
    expect(isInsideTriangle(bary!)).toBe(true);
  });
});
