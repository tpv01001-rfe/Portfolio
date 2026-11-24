import type { TriangleMesh } from "../../../shared/geometry/triangleMesh";
import type { PatternWheel } from "../model/patternWheel";
import { createWheelContour } from "./wheelContour";
import type { FlankProfile } from "./wheelProfile";
import type { Point2, Point3 } from "../../../shared/math/point";
import { orientation2D } from "../../../shared/math/vec2";

export interface WheelMeshOptions {
  readonly boreDiameterMm?: number;
  readonly segmentsPerRevolution?: number;
  readonly profile?: FlankProfile;
}

function same(a: Point2, b: Point2): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < 1e-8;
}

function inTriangle(p: Point2, a: Point2, b: Point2, c: Point2): boolean {
  return orientation2D(a, b, p) >= -1e-10 &&
    orientation2D(b, c, p) >= -1e-10 &&
    orientation2D(c, a, p) >= -1e-10;
}

/**
 * Triangulera en enkel polygon med öronklippning. Dubblerade bryggpunkter
 * får förekomma: de används när centrumhålet kopplas till ytterkonturen.
 */
function triangulate(points: readonly Point2[]): [number, number, number][] {
  const remaining = points.map((_, index) => index);
  const triangles: [number, number, number][] = [];
  let attempts = 0;

  while (remaining.length > 3) {
    let found = false;

    for (let i = 0; i < remaining.length; i++) {
      const ia = remaining[(i - 1 + remaining.length) % remaining.length];
      const ib = remaining[i];
      const ic = remaining[(i + 1) % remaining.length];
      const a = points[ia];
      const b = points[ib];
      const c = points[ic];

      if (orientation2D(a, b, c) <= 1e-10) {
        continue;
      }

      const contains = remaining.some((index) => {
        if (index === ia || index === ib || index === ic) {
          return false;
        }

        const p = points[index];

        if (same(p, a) || same(p, b) || same(p, c)) {
          return false;
        }

        return inTriangle(p, a, b, c);
      });

      if (!contains) {
        triangles.push([ia, ib, ic]);
        remaining.splice(i, 1);
        found = true;
        break;
      }
    }

    if (!found || ++attempts > points.length * 2) {
      throw new Error("Trianguleringen misslyckades. Konturen kan vara för kraftigt svept.");
    }
  }

  triangles.push([remaining[0], remaining[1], remaining[2]]);
  return triangles;
}

/**
 * Koppla ett cirkulärt centrumhål till ytterpolygonen med en brygga.
 * Bryggan går från hålets högra punkt längs +X till närmaste ytterkant.
 * Resultatet är en polygon som kan trianguleras utan att fylla hålet.
 */
function bridgeHole(outer: readonly Point2[], radius: number, segments: number): Point2[] {
  const holePoint: Point2 = { x: radius, y: 0 };
  let edgeIndex = -1;
  let hitX = Infinity;

  for (let i = 0; i < outer.length; i++) {
    const a = outer[i];
    const b = outer[(i + 1) % outer.length];

    if ((a.y <= 0 && b.y > 0) || (b.y <= 0 && a.y > 0)) {
      const t = -a.y / (b.y - a.y);
      const x = a.x + t * (b.x - a.x);

      if (x > radius && x < hitX) {
        hitX = x;
        edgeIndex = i;
      }
    }
  }

  if (edgeIndex < 0) {
    throw new Error("Centrumhålet ligger utanför den fria hjulkonturen.");
  }

  const bridgePoint: Point2 = { x: hitX, y: 0 };
  const result: Point2[] = [];

  for (let i = 0; i < outer.length; i++) {
    result.push(outer[i]);

    if (i === edgeIndex) {
      result.push(bridgePoint, holePoint);

      // Hålets punkter går medurs, motsatt ytterkonturens orientering.
      for (let j = 1; j < segments; j++) {
        const angle = -2 * Math.PI * j / segments;
        result.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
      }

      result.push(holePoint, bridgePoint);
    }
  }

  return result;
}

/**
 * Extruderar den fria konturen till ett slutet triangelnät med centrumhål.
 * Till skillnad från den gamla radiella metoden kan spetsar svepa bakåt.
 * Drivhålet modelleras ännu inte.
 */
export function createWheelMesh(
  wheel: PatternWheel,
  options: WheelMeshOptions = {},
): TriangleMesh {
  const boreDiameterMm = options.boreDiameterMm ?? 3;
  const segments = options.segmentsPerRevolution ?? 384;

  if (
    !Number.isFinite(boreDiameterMm) ||
    boreDiameterMm <= 0 ||
    boreDiameterMm >= wheel.rootDiameterMm
  ) {
    throw new RangeError("Centrumhålets diameter måste ligga mellan noll och rotdiametern.");
  }

  const contour = createWheelContour(wheel, {
    profile: options.profile,
    segmentsPerRevolution: segments,
  });
  const holeSegments = Math.max(32, Math.ceil(segments / 4));
  const face = bridgeHole(contour.points, boreDiameterMm / 2, holeSegments);
  const faceTriangles = triangulate(face);
  const mesh: TriangleMesh = { vertices: [], normals: [], triangles: [] };
  const halfThickness = wheel.thicknessMm / 2;

  const addVertex = (point: Point3, normal: Point3): number => {
    const index = mesh.vertices.length;
    mesh.vertices.push(point);
    mesh.normals.push(normal);
    return index;
  };

  const addQuad = (
    a: Point3,
    b: Point3,
    c: Point3,
    d: Point3,
    normal: Point3,
  ): void => {
    const i0 = addVertex(a, normal);
    const i1 = addVertex(b, normal);
    const i2 = addVertex(c, normal);
    const i3 = addVertex(d, normal);
    mesh.triangles.push([i0, i1, i2], [i0, i2, i3]);
  };

  // Framsidan har moturs orientering; baksidan får omvänd ordning.
  for (const [ia, ib, ic] of faceTriangles) {
    const a = face[ia];
    const b = face[ib];
    const c = face[ic];
    const top = [a, b, c].map((p) => addVertex({ ...p, z: halfThickness }, { x: 0, y: 0, z: 1 }));
    const bottom = [a, b, c].map((p) => addVertex({ ...p, z: -halfThickness }, { x: 0, y: 0, z: -1 }));
    mesh.triangles.push([top[0], top[1], top[2]], [bottom[2], bottom[1], bottom[0]]);
  }

  const addWall = (points: readonly Point2[], isHole: boolean): void => {
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy);

      if (length < 1e-9) {
        continue;
      }

      const normal = { x: dy / length, y: -dx / length, z: 0 };
      const bottomA = { ...a, z: -halfThickness };
      const bottomB = { ...b, z: -halfThickness };
      const topA = { ...a, z: halfThickness };
      const topB = { ...b, z: halfThickness };

      if (isHole) {
        addQuad(bottomB, bottomA, topA, topB, { x: -normal.x, y: -normal.y, z: 0 });
      } else {
        addQuad(bottomA, bottomB, topB, topA, normal);
      }
    }
  };

  addWall(contour.points, false);
  const hole = Array.from({ length: holeSegments }, (_, i) => {
    const angle = 2 * Math.PI * i / holeSegments;
    return { x: boreDiameterMm / 2 * Math.cos(angle), y: boreDiameterMm / 2 * Math.sin(angle) };
  });
  addWall(hole, true);

  return mesh;
}
