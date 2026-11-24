
import type { Vec2 } from "../../math/vec2";
import type { Vec3 } from "../../math/vec3";


import type { Barycentric } from "./barycentric";


import {
  setPixel,
  type ColorRGBA,
  type Framebuffer,
} from "./framebuffer";

import { normalizeVec3 } from "../../math/vec3";
import { interpolateBarycentricVec3 } from "../../math/interpolation";

import {
  perspectiveCorrectWeights,
} from "./perspectiveInterpolation";

import {
  calculatePreparedBlinnPhongColor,
  prepareBlinnPhongLighting,
  type SurfaceLight,
  type SurfaceMaterial,
  type LinearRGB,
} from "../lighting";


import {
  linearRGBToColorRGBA,
  linearRGBToColorRGBALUT,
} from "../color/colorSpace";

export type RasterVertex = {
  position: Vec2;
  depth: number;

  // Används av Gouraud.
  intensity?: number;

  // RGB-baserad Gouraud.
  linearColor?: LinearRGB;

  // Används av Phong.
  worldPosition?: Vec3;
  normal?: Vec3;

  // 1 / clip.w från perspektivprojektionen.
  inverseW?: number;
};


export type RasterProfile = {
  testedPixels: number;
  insidePixels: number;
  shadedPixels: number;
  depthRejectedPixels: number;
};

export function createRasterProfile(): RasterProfile {
  return {
    testedPixels: 0,
    insidePixels: 0,
    shadedPixels: 0,
    depthRejectedPixels: 0,
  };
}

export type RasterizationMode = "bounding-box" | "scanline";
function getTrianglePixelIterator(mode: RasterizationMode) {
  return mode === "scanline"
    ? forEachTrianglePixelScanline
    : forEachTrianglePixel;
}

/**
 * Besöker pixelcentrum inuti en triangel med
 * inkrementell beräkning av barycentriska koordinater.
 *
 * Kantfunktionerna är linjära i x och y.
 * Därför kan deras värden uppdateras med additioner
 * i stället för att beräknas från början för varje pixel.
 *
 * Algoritmen:
 * 1. Beräkna triangelns begränsningsrektangel.
 * 2. Beräkna orienterad area och kontrollera degenerering.
 * 3. Beräkna barycentriska vikter vid första pixelcentrum.
 * 4. Beräkna hur vikterna förändras per pixelsteg.
 * 5. Stega över pixelraderna med additioner.
 * 6. Interpolera djup och anropa callback för inre pixlar.
 */
function forEachTrianglePixel(
  framebuffer: Framebuffer,
  a: RasterVertex,
  b: RasterVertex,
  c: RasterVertex,

  callback: (
    x: number,
    y: number,
    depth: number,
    bary: Barycentric
  ) => void,
  profile?: RasterProfile
): void {
  const pa = a.position;
  const pb = b.position;
  const pc = c.position;

  const minX = Math.max(
    0,
    Math.floor(Math.min(pa.x, pb.x, pc.x))
  );

  const maxX = Math.min(
    framebuffer.width - 1,
    Math.ceil(Math.max(pa.x, pb.x, pc.x)) - 1
  );

  const minY = Math.max(
    0,
    Math.floor(Math.min(pa.y, pb.y, pc.y))
  );

  const maxY = Math.min(
    framebuffer.height - 1,
    Math.ceil(Math.max(pa.y, pb.y, pc.y)) - 1
  );

  if (minX > maxX || minY > maxY) {
    return;
  }

  // Orienterad dubbelarea för triangeln A-B-C.
  const area =
    (pb.x - pa.x) * (pc.y - pa.y) -
    (pb.y - pa.y) * (pc.x - pa.x);

  if (!Number.isFinite(area) || Math.abs(area) < 1e-12) {
    return;
  }

  const invArea = 1 / area;

  // Förändring av barycentriska vikter
  // när x respektive y ökar med en pixel.
  const alphaDx = (pb.y - pc.y) * invArea;
  const alphaDy = (pc.x - pb.x) * invArea;

  const betaDx = (pc.y - pa.y) * invArea;
  const betaDy = (pa.x - pc.x) * invArea;

  const gammaDx = (pa.y - pb.y) * invArea;
  const gammaDy = (pb.x - pa.x) * invArea;

  // Första pixelns centrum.
  const startX = minX + 0.5;
  const startY = minY + 0.5;

  // Barycentriska koordinater vid första pixelcentrum.
  let rowAlpha =
    ((pb.x - startX) * (pc.y - startY) -
      (pb.y - startY) * (pc.x - startX)) *
    invArea;

  let rowBeta =
    ((pc.x - startX) * (pa.y - startY) -
      (pc.y - startY) * (pa.x - startX)) *
    invArea;

  let rowGamma =
    ((pa.x - startX) * (pb.y - startY) -
      (pa.y - startY) * (pb.x - startX)) *
    invArea;

  for (let y = minY; y <= maxY; y++) {
    let alpha = rowAlpha;
    let beta = rowBeta;
    let gamma = rowGamma;

    for (let x = minX; x <= maxX; x++) {
      // Samma geometriska innanför-test som tidigare,
      // med liten tolerans för flyttalsavrundning.
      const epsilon = 1e-10;

      if (profile) profile.testedPixels++;

      if (
        alpha >= -epsilon &&
        beta >= -epsilon &&
        gamma >= -epsilon
      ) {
        const depth =
          alpha * a.depth +
          beta * b.depth +
          gamma * c.depth;

        if (profile) profile.insidePixels++;

        callback(x, y, depth, { alpha, beta, gamma });
      }

      // Nästa pixel åt höger.
      alpha += alphaDx;
      beta += betaDx;
      gamma += gammaDx;
    }

    // Nästa pixelrad.
    rowAlpha += alphaDy;
    rowBeta += betaDy;
    rowGamma += gammaDy;
  }
}



/**
 * Inkrementell scanline-rasterisering.
 *
 * För varje pixelrad:
 * 1. Bestäm var raden skär triangelns kanter.
 * 2. Undersök endast pixlar mellan skärningspunkterna.
 * 3. Uppdatera barycentriska vikter inkrementellt.
 *
 * Pixelcentrum ligger i (x + 0.5, y + 0.5).
 *
 * Detta är en första jämförelseimplementation.
 * Vi behåller ett barycentriskt innanförtest för att
 * kontrollera kantpixlar och numerisk avrundning.
 */

function forEachTrianglePixelScanline(
  framebuffer: Framebuffer,
  a: RasterVertex,
  b: RasterVertex,
  c: RasterVertex,
  callback: (
    x: number,
    y: number,
    depth: number,
    bary: Barycentric
  ) => void,
  profile?: RasterProfile
): void {
  const pa = a.position;
  const pb = b.position;
  const pc = c.position;

  const area =
    (pb.x - pa.x) * (pc.y - pa.y) -
    (pb.y - pa.y) * (pc.x - pa.x);

  if (!Number.isFinite(area) || Math.abs(area) < 1e-12) {
    return;
  }

  const invArea = 1 / area;
  const epsilon = 1e-10;

  // Barycentriska förändringar per steg åt höger.
  const alphaDx = (pb.y - pc.y) * invArea;
  const betaDx = (pc.y - pa.y) * invArea;
  const gammaDx = (pa.y - pb.y) * invArea;

  // Barycentriska förändringar per pixelrad nedåt.
  const alphaDy = (pc.x - pb.x) * invArea;
  const betaDy = (pa.x - pc.x) * invArea;
  const gammaDy = -alphaDy - betaDy;

  // Sortering ändrar bara kantföljningen.
  // Barycentriska vikter hör fortfarande till a, b, c.
  const vertices = [pa, pb, pc].sort(
    (p, q) => p.y - q.y
  );

  const top = vertices[0];
  const middle = vertices[1];
  const bottom = vertices[2];

  /**
   * Rasterisera ett vertikalt intervall.
   *
   * Kantpositionerna beräknas på första raden
   * och uppdateras därefter med en addition per rad.
   */
  const rasterizeSection = (
    yStart: number,
    yEnd: number,
    edgeA0: Vec2,
    edgeA1: Vec2,
    edgeB0: Vec2,
    edgeB1: Vec2
  ): void => {
    if (yStart > yEnd) return;

    const dyA = edgeA1.y - edgeA0.y;
    const dyB = edgeB1.y - edgeB0.y;

    if (dyA <= 0 || dyB <= 0) return;

    // Horisontell förflyttning per pixelrad.
    const stepA = (edgeA1.x - edgeA0.x) / dyA;
    const stepB = (edgeB1.x - edgeB0.x) / dyB;

    const firstScanY = yStart + 0.5;

    let edgeX_A =
      edgeA0.x + (firstScanY - edgeA0.y) * stepA;

    let edgeX_B =
      edgeB0.x + (firstScanY - edgeB0.y) * stepB;

    let rowAlpha = 0;
    let rowBeta = 0;
    let rowGamma = 0;

    // Föregående pixelrads startposition.
    let previousStartX = 0;
    let previousY = 0;

    let hasPreviousRow = false;

    for (let y = yStart; y <= yEnd; y++) {
      const left = Math.min(edgeX_A, edgeX_B);
      const right = Math.max(edgeX_A, edgeX_B);

      // Konservativt intervall: kantpixlar kontrolleras
      // med samma barycentriska test som tidigare.
      const startX = Math.max(
        0,
        Math.floor(left - 0.5)
      );

      const endX = Math.min(
        framebuffer.width - 1,
        Math.ceil(right - 0.5)
      );

      if (startX <= endX) {

        const px = startX + 0.5;
        const py = y + 0.5;

        if (!hasPreviousRow) {
          // Första raden: beräkna vikterna direkt.
          rowAlpha =
            ((pb.x - px) * (pc.y - py) -
              (pb.y - py) * (pc.x - px)) * invArea;

          rowBeta =
            ((pc.x - px) * (pa.y - py) -
              (pc.y - py) * (pa.x - px)) * invArea;

          rowGamma =
            ((pa.x - px) * (pb.y - py) -
              (pa.y - py) * (pb.x - px)) * invArea;

          hasPreviousRow = true;
        } else {
          /**
           * Flytta barycentriska startvärden till nästa rad.
           *
           * Ny rad innebär ett steg i Y-led.
           * Startpositionen kan dessutom ha flyttats i X-led.
           *
           * alpha(x + dx, y + 1)
           *   = alpha(x, y) + dx * alphaDx + alphaDy
           */
          const deltaX = startX - previousStartX;
          const deltaY = y - previousY;

          // Flytta vikterna från föregående rad till
          // den aktuella radens första pixelcentrum.
          rowAlpha += deltaX * alphaDx + deltaY * alphaDy;
          rowBeta += deltaX * betaDx + deltaY * betaDy;
          rowGamma += deltaX * gammaDx + deltaY * gammaDy;
        }

        previousStartX = startX;
        previousY = y;

        let alpha = rowAlpha;
        let beta = rowBeta;
        let gamma = rowGamma;

        for (let x = startX; x <= endX; x++) {
          if (profile) profile.testedPixels++;

          if (
            alpha >= -epsilon &&
            beta >= -epsilon &&
            gamma >= -epsilon
          ) {
            if (profile) profile.insidePixels++;

            const depth =
              alpha * a.depth +
              beta * b.depth +
              gamma * c.depth;

            callback(x, y, depth, {
              alpha,
              beta,
              gamma
            });
          }

          alpha += alphaDx;
          beta += betaDx;
          gamma += gammaDx;
        }
      }

      // Förutsäg nästa rads båda kantpositioner.
      edgeX_A += stepA;
      edgeX_B += stepB;
    }
  };

  // Pixelrader vars centrum ligger inom triangeln.
  const firstY = Math.max(
    0,
    Math.ceil(top.y - 0.5)
  );

  const lastY = Math.min(
    framebuffer.height - 1,
    Math.ceil(bottom.y - 0.5) - 1
  );

  // Övre delen: top -> middle.
  const upperEnd = Math.min(
    lastY,
    Math.ceil(middle.y - 0.5) - 1
  );

  rasterizeSection(
    firstY,
    upperEnd,
    top,
    bottom,
    top,
    middle
  );

  // Nedre delen: middle -> bottom.
  const lowerStart = Math.max(
    firstY,
    Math.ceil(middle.y - 0.5)
  );

  rasterizeSection(
    lowerStart,
    lastY,
    top,
    bottom,
    middle,
    bottom
  );
}


/**
 * Rasteriserar en triangel med en enda färg.
 *
 * Skärmkoordinaterna är uttryckta i pixlar.
 * Pixeln (x, y) har sitt centrum i
 * (x + 0.5, y + 0.5).
 *
 * Djupbufferten avgör vilka pixlar
 * som faktiskt blir synliga.
 */
export function rasterizeTriangle(
  framebuffer: Framebuffer,
  a: RasterVertex,
  b: RasterVertex,
  c: RasterVertex,
  color: ColorRGBA,
  rasterizationMode: RasterizationMode = "bounding-box"
): void {


  getTrianglePixelIterator(rasterizationMode)(
    framebuffer,
    a,
    b,
    c,
    (x, y, depth) => {
      setPixel(framebuffer, x, y, depth, color);
    }
  );
}


/**
 * Rasteriserar en triangel med Gouraud shading.
 *
 * Ljusintensiteten beräknas i hörnen
 * och interpoleras sedan över triangeln.
 */

export function rasterizeGouraudTriangle(
  framebuffer: Framebuffer,
  a: RasterVertex,
  b: RasterVertex,
  c: RasterVertex,
  rasterizationMode: RasterizationMode = "bounding-box"
): void {
  if (
    !a.linearColor ||
    !b.linearColor ||
    !c.linearColor
  ) {
    throw new Error(
      "RGB-Gouraud kräver linearColor i alla hörn."
    );
  }

  const ca = a.linearColor;
  const cb = b.linearColor;
  const cc = c.linearColor;

  getTrianglePixelIterator(rasterizationMode)(
    framebuffer,
    a,
    b,
    c,
    (x, y, depth, bary) => {
      const index = y * framebuffer.width + x;

      // Undvik onödig interpolation för dolda pixlar.
      if (
        !Number.isFinite(depth) ||
        depth < 0 ||
        depth > 1 ||
        depth >= framebuffer.depth[index]
      ) {
        return;
      }

      const weights = perspectiveCorrectWeights(
        bary,
        a.inverseW ?? 1,
        b.inverseW ?? 1,
        c.inverseW ?? 1
      );

      if (!weights) return;

      const { alpha, beta, gamma } = weights;

      // Interpolera i linjär RGB.
      const linearColor: LinearRGB = {
        r:
          alpha * ca.r +
          beta * cb.r +
          gamma * cc.r,

        g:
          alpha * ca.g +
          beta * cb.g +
          gamma * cc.g,

        b:
          alpha * ca.b +
          beta * cb.b +
          gamma * cc.b,
      };

      const pixelColor = linearRGBToColorRGBA(
        linearColor
      );

      setPixel(
        framebuffer,
        x,
        y,
        depth,
        pixelColor
      );
    }
  );
}


/**
 * Rasteriserar en triangel med Phong shading.
 *
 * Normal och världsposition interpoleras
 * perspektivkorrekt för varje pixel.
 *
 * Blinn–Phong-belysningen beräknas därefter
 * individuellt för varje pixel.
 */

export function rasterizePhongTriangle(
  framebuffer: Framebuffer,
  a: RasterVertex,
  b: RasterVertex,
  c: RasterVertex,
  cameraPosition: Vec3,
  light: SurfaceLight,
  material: SurfaceMaterial,
  alpha = 255,
  profile?: RasterProfile,
  enableLighting = true,
  rasterizationMode: RasterizationMode = "bounding-box"
): void {
  if (
    !a.worldPosition || !b.worldPosition || !c.worldPosition ||
    !a.normal || !b.normal || !c.normal ||
    a.inverseW === undefined || b.inverseW === undefined ||
    c.inverseW === undefined
  ) {
    throw new Error("Phong shading kräver position, normal och inverseW i alla hörn.");
  }

  const pa = a.worldPosition;
  const pb = b.worldPosition;
  const pc = c.worldPosition;
  const na = a.normal;
  const nb = b.normal;
  const nc = c.normal;
  const wa = a.inverseW;
  const wb = b.inverseW;
  const wc = c.inverseW;

  // Förbered material- och ljusvärden en gång per triangel.
  const prepared = enableLighting
    ? prepareBlinnPhongLighting(light, material)
    : undefined;

  getTrianglePixelIterator(rasterizationMode)(
    framebuffer, a, b, c,
    (x, y, depth, bary) => {
      const index = y * framebuffer.width + x;
      if (
        !Number.isFinite(depth) || depth < 0 || depth > 1 ||
        depth >= framebuffer.depth[index]
      ) {
        if (profile) profile.depthRejectedPixels++;
        return;
      }

      let linearColor: LinearRGB = {
        r: 0.0382, g: 0.3763, b: 0.6105,
      };

      if (prepared) {
        const weights = perspectiveCorrectWeights(bary, wa, wb, wc);
        if (!weights) return;

        const worldPosition = interpolateBarycentricVec3(pa, pb, pc, weights);
        const normal = normalizeVec3(
          interpolateBarycentricVec3(na, nb, nc, weights)
        );
        linearColor = calculatePreparedBlinnPhongColor(
          worldPosition, normal, cameraPosition, prepared
        );
      }

      if (profile) profile.shadedPixels++;
      setPixel(
        framebuffer, x, y, depth,
        linearRGBToColorRGBALUT(linearColor, alpha)
      );
    },
    profile
  );
}
