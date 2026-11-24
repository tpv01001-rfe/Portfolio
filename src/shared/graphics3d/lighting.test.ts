
import { describe, expect, it } from "vitest";

import {
  calculateBlinnPhong,
  type BlinnPhongMaterial,
  type DirectionalLight,
} from "./lighting/blinnPhong";

import type { Vec3 } from "../math/vec3";

describe("Blinn–Phong lighting", () => {
  const position: Vec3 = { x: 0, y: 0, z: 0 };

  const cameraPosition: Vec3 = {
    x: 0,
    y: 0,
    z: 10,
  };

  const normal: Vec3 = { x: 0, y: 0, z: 1 };

  const light: DirectionalLight = {
    direction: { x: 0, y: 0, z: 1 },
    intensity: 1,
  };

  const material: BlinnPhongMaterial = {
    ambient: 0.1,
    diffuse: 0.7,
    specular: 0.2,
    shininess: 32,
  };

  it("beräknar endast ambient när övriga komponenter är noll", () => {
    const result = calculateBlinnPhong(
      position,
      normal,
      cameraPosition,
      light,
      {
        ambient: 0.25,
        diffuse: 0,
        specular: 0,
        shininess: 32,
      }
    );

    expect(result).toBeCloseTo(0.25);
  });

  it("ger maximal diffus belysning när normalen pekar mot ljuset", () => {
    const result = calculateBlinnPhong(
      position,
      normal,
      cameraPosition,
      light,
      {
        ambient: 0,
        diffuse: 0.7,
        specular: 0,
        shininess: 32,
      }
    );

    expect(result).toBeCloseTo(0.7);
  });

  it("ger ingen diffus belysning när ljuset kommer från sidan", () => {
    const result = calculateBlinnPhong(
      position,
      normal,
      cameraPosition,
      {
        direction: { x: 1, y: 0, z: 0 },
        intensity: 1,
      },
      {
        ambient: 0,
        diffuse: 0.7,
        specular: 0,
        shininess: 32,
      }
    );

    expect(result).toBeCloseTo(0);
  });

  it("ger ingen diffus eller spekulär belysning på baksidan", () => {
    const result = calculateBlinnPhong(
      position,
      normal,
      cameraPosition,
      {
        direction: { x: 0, y: 0, z: -1 },
        intensity: 1,
      },
      material
    );

    expect(result).toBeCloseTo(0.1);
  });

  it("ger maximal spekulär belysning när N och H sammanfaller", () => {
    const result = calculateBlinnPhong(
      position,
      normal,
      cameraPosition,
      light,
      {
        ambient: 0,
        diffuse: 0,
        specular: 0.8,
        shininess: 32,
      }
    );

    expect(result).toBeCloseTo(0.8);
  });

  it("ger en smalare reflex vid högre shininess", () => {
    const angledLight: DirectionalLight = {
      direction: { x: 1, y: 0, z: 1 },
      intensity: 1,
    };

    const lowShininess = calculateBlinnPhong(
      position,
      normal,
      cameraPosition,
      angledLight,
      {
        ambient: 0,
        diffuse: 0,
        specular: 1,
        shininess: 8,
      }
    );

    const highShininess = calculateBlinnPhong(
      position,
      normal,
      cameraPosition,
      angledLight,
      {
        ambient: 0,
        diffuse: 0,
        specular: 1,
        shininess: 64,
      }
    );

    expect(highShininess).toBeLessThan(
      lowShininess
    );

    expect(lowShininess).toBeGreaterThan(0);
  });

  it("hanterar motsatta ljus- och betraktarriktningar", () => {
    const result = calculateBlinnPhong(
      position,
      normal,
      { x: 0, y: 0, z: -10 },
      light,
      material
    );

    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeCloseTo(0.8);
  });
});
