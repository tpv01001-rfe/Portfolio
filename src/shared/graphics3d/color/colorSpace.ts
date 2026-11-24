
import type { ColorRGBA } from "../rasterizer/framebuffer";
import type { LinearRGB } from "../lighting/blinnPhongColor";

/**
 * Omvandlar en linjär färgkomponent till sRGB.
 * Resultatet ligger i intervallet [0, 1].
 */
export function linearToSRGB(value: number): number {
  const linear = Math.max(0, Math.min(1, value));

  if (linear <= 0.0031308) {
    return 12.92 * linear;
  }

  return 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
}

/**
 * Omvandlar linjär RGB till 8-bitars sRGB.
 */
export function linearRGBToColorRGBA(
  color: LinearRGB,
  alpha = 255
): ColorRGBA {
  return {
    r: Math.round(linearToSRGB(color.r) * 255),
    g: Math.round(linearToSRGB(color.g) * 255),
    b: Math.round(linearToSRGB(color.b) * 255),
    a: alpha,
  };
}


// 65 536 förberäknade sRGB-bytevärden för linjär RGB i [0, 1].
// LUT-varianten är approximativ (kvantisering till 16 bitar).
const SRGB_LUT_SIZE = 65536;
const srgbByteLUT = new Uint8Array(SRGB_LUT_SIZE);
for (let i = 0; i < SRGB_LUT_SIZE; i++) {
  srgbByteLUT[i] = Math.round(linearToSRGB(i / (SRGB_LUT_SIZE - 1)) * 255);
}

function linearToSRGBByteLUT(value: number): number {
  // Math.max/min ger samma klampning som originalet för normala ändliga värden.
  const linear = Math.max(0, Math.min(1, value));
  // För NaN återges originalets Math.round(NaN), inte en tyst tabelluppslagning.
  if (Number.isNaN(linear)) return NaN;
  return srgbByteLUT[Math.round(linear * (SRGB_LUT_SIZE - 1))];
}

/** Snabb, approximativ linjär RGB -> 8-bitars sRGB via LUT. */
export function linearRGBToColorRGBALUT(color: LinearRGB, alpha = 255): ColorRGBA {
  return {
    r: linearToSRGBByteLUT(color.r),
    g: linearToSRGBByteLUT(color.g),
    b: linearToSRGBByteLUT(color.b),
    a: alpha,
  };
}
