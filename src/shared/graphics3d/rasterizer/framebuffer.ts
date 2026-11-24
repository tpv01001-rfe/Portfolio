
export type ColorRGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Framebuffer = {
  width: number;
  height: number;

  // Fyra bytes per pixel: R, G, B, A.
  color: Uint8ClampedArray;

  // Ett djupvärde per pixel.
  depth: Float32Array;
};

/**
 * Skapar en framebuffer.
 *
 * Buffertarna är oberoende av Canvas 2D
 * och kan därför testas separat.
 */
export function createFramebuffer(
  width: number,
  height: number
): Framebuffer {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    width * height > 0x7fffffff
  ) {
    throw new RangeError(
      "Framebuffer: ogiltiga dimensioner."
    );
  }

  const pixelCount = width * height;

  return {
    width,
    height,
    color: new Uint8ClampedArray(pixelCount * 4),
    depth: new Float32Array(pixelCount),
  };
}

/**
 * Rensar färg- och djupbufferten.
 *
 * Infinity betyder att ingen geometri
 * ännu har skrivits till pixeln.
 */
export function clearFramebuffer(
  framebuffer: Framebuffer,
  background: ColorRGBA = {
    r: 0,
    g: 0,
    b: 0,
    a: 255,
  }
): void {
  const { color, depth } = framebuffer;

  for (let i = 0; i < color.length; i += 4) {
    color[i] = background.r;
    color[i + 1] = background.g;
    color[i + 2] = background.b;
    color[i + 3] = background.a;
  }

  depth.fill(Infinity);
}

/**
 * Skriver en pixel om den ligger närmare
 * kameran än tidigare geometri.
 *
 * Returnerar true om pixeln skrevs.
 *
 * Djupvärden förutsätts vara normaliserade
 * till intervallet [0, 1].
 */
export function setPixel(
  framebuffer: Framebuffer,
  x: number,
  y: number,
  z: number,
  color: ColorRGBA
): boolean {
  const { width, height, depth } = framebuffer;

  // Pixelkoordinater måste vara heltal.
  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    y < 0 ||
    x >= width ||
    y >= height
  ) {
    return false;
  }

  // Djup utanför klippvolymen ignoreras.
  if (!Number.isFinite(z) || z < 0 || z > 1) {
    return false;
  }

  const index = y * width + x;

  // Mindre z betyder närmare kameran.
  if (z >= depth[index]) {
    return false;
  }

  depth[index] = z;

  const colorIndex = index * 4;

  framebuffer.color[colorIndex] = color.r;
  framebuffer.color[colorIndex + 1] = color.g;
  framebuffer.color[colorIndex + 2] = color.b;
  framebuffer.color[colorIndex + 3] = color.a;

  return true;
}
