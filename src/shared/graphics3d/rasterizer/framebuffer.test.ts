
import { describe, expect, it } from "vitest";

import {
  createFramebuffer,
  clearFramebuffer,
  setPixel,
} from "./framebuffer";

describe("Framebuffer", () => {
  const red = {
    r: 255, g: 0, b: 0, a: 255,
  };

  const blue = {
    r: 0, g: 0, b: 255, a: 255,
  };

  it("skapar buffertar med rätt storlek", () => {
    const fb = createFramebuffer(4, 3);

    expect(fb.color.length).toBe(4 * 3 * 4);
    expect(fb.depth.length).toBe(4 * 3);
  });

  it("avvisar ogiltiga dimensioner", () => {
    expect(() => createFramebuffer(0, 3)).toThrow();
    expect(() => createFramebuffer(4.5, 3)).toThrow();
    expect(() => createFramebuffer(-1, 3)).toThrow();
  });

  it("rensar färg- och djupbufferten", () => {
    const fb = createFramebuffer(2, 2);

    clearFramebuffer(fb, blue);

    expect(Array.from(fb.color.slice(0, 4)))
      .toEqual([0, 0, 255, 255]);

    expect(Array.from(fb.depth))
      .toEqual([
        Infinity, Infinity,
        Infinity, Infinity,
      ]);
  });

  it("skriver en pixel med giltigt djup", () => {
    const fb = createFramebuffer(2, 2);
    clearFramebuffer(fb);

    const written = setPixel(
      fb, 1, 0, 0.5, red
    );

    expect(written).toBe(true);
    expect(fb.depth[1]).toBeCloseTo(0.5);

    expect(Array.from(fb.color.slice(4, 8)))
      .toEqual([255, 0, 0, 255]);
  });

  it("låter närmare geometri skriva över", () => {
    const fb = createFramebuffer(2, 2);
    clearFramebuffer(fb);

    setPixel(fb, 0, 0, 0.8, blue);
    const written = setPixel(
      fb, 0, 0, 0.2, red
    );

    expect(written).toBe(true);
    expect(fb.depth[0]).toBeCloseTo(0.2);
    expect(Array.from(fb.color.slice(0, 4)))
      .toEqual([255, 0, 0, 255]);
  });

  it("låter inte geometri bakom skriva över", () => {
    const fb = createFramebuffer(2, 2);
    clearFramebuffer(fb);

    setPixel(fb, 0, 0, 0.2, red);
    const written = setPixel(
      fb, 0, 0, 0.8, blue
    );

    expect(written).toBe(false);
    expect(Array.from(fb.color.slice(0, 4)))
      .toEqual([255, 0, 0, 255]);
  });

  it("ignorerar pixlar utanför bildytan", () => {
    const fb = createFramebuffer(2, 2);
    clearFramebuffer(fb);

    expect(setPixel(fb, -1, 0, 0.5, red))
      .toBe(false);

    expect(setPixel(fb, 2, 0, 0.5, red))
      .toBe(false);

    expect(setPixel(fb, 0, 1.5, 0.5, red))
      .toBe(false);
  });

  it("ignorerar ogiltiga djupvärden", () => {
    const fb = createFramebuffer(2, 2);
    clearFramebuffer(fb);

    expect(setPixel(fb, 0, 0, NaN, red))
      .toBe(false);

    expect(setPixel(fb, 0, 0, -0.1, red))
      .toBe(false);

    expect(setPixel(fb, 0, 0, 1.1, red))
      .toBe(false);
  });
});
