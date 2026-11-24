
import { describe, expect, it } from "vitest";

import {
  createFramebuffer,
  clearFramebuffer,
} from "./framebuffer";

import {
  rasterizeTriangle,
  type RasterVertex,
} from "./rasterizeTriangle";

describe("Rasterize triangle", () => {
  const red = {
    r: 255, g: 0, b: 0, a: 255,
  };

  const blue = {
    r: 0, g: 0, b: 255, a: 255,
  };

  const a: RasterVertex = {
    position: { x: 1, y: 1 },
    depth: 0.5,
  };

  const b: RasterVertex = {
    position: { x: 7, y: 1 },
    depth: 0.5,
  };

  const c: RasterVertex = {
    position: { x: 1, y: 7 },
    depth: 0.5,
  };

  function getPixel(
    color: Uint8ClampedArray,
    width: number,
    x: number,
    y: number
  ): number[] {
    const index = (y * width + x) * 4;

    return Array.from(
      color.slice(index, index + 4)
    );
  }

  it("fyller pixlar inuti triangeln", () => {
    const fb = createFramebuffer(10, 10);
    clearFramebuffer(fb);

    rasterizeTriangle(fb, a, b, c, red);

    expect(getPixel(fb.color, 10, 2, 2))
      .toEqual([255, 0, 0, 255]);
  });

  it("lämnar pixlar utanför triangeln orörda", () => {
    const fb = createFramebuffer(10, 10);
    clearFramebuffer(fb);

    rasterizeTriangle(fb, a, b, c, red);

    expect(getPixel(fb.color, 10, 8, 8))
      .toEqual([0, 0, 0, 255]);
  });

  it("interpolerar djupvärden", () => {
    const fb = createFramebuffer(10, 10);
    clearFramebuffer(fb);

    rasterizeTriangle(
      fb,
      { ...a, depth: 0.2 },
      { ...b, depth: 0.8 },
      { ...c, depth: 0.8 },
      red
    );

    // Pixelcentrum (2.5, 2.5) ger:
    // alpha = 0.5, beta = 0.25, gamma = 0.25.
    //
    // Djup = 0.5*0.2 + 0.25*0.8 + 0.25*0.8
    //      = 0.5.
    expect(fb.depth[2 * 10 + 2])
      .toBeCloseTo(0.5);
  });

  it("låter närmare trianglar skymma längre bort", () => {
    const fb = createFramebuffer(10, 10);
    clearFramebuffer(fb);

    rasterizeTriangle(
      fb,
      { ...a, depth: 0.8 },
      { ...b, depth: 0.8 },
      { ...c, depth: 0.8 },
      blue
    );

    rasterizeTriangle(
      fb,
      { ...a, depth: 0.2 },
      { ...b, depth: 0.2 },
      { ...c, depth: 0.2 },
      red
    );

    expect(getPixel(fb.color, 10, 2, 2))
      .toEqual([255, 0, 0, 255]);
  });

  it("ignorerar trianglar helt utanför bildytan", () => {
    const fb = createFramebuffer(10, 10);
    clearFramebuffer(fb);

    rasterizeTriangle(
      fb,
      {
        position: { x: 20, y: 20 },
        depth: 0.5,
      },
      {
        position: { x: 30, y: 20 },
        depth: 0.5,
      },
      {
        position: { x: 20, y: 30 },
        depth: 0.5,
      },
      red
    );

    expect(Array.from(fb.depth).every(
      value => value === Infinity
    )).toBe(true);
  });
});
