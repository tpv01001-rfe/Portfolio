import type { Point2 } from "../../../shared/math/point";

import { subtractVec2, lengthVec2, orientation2D } from "../../../shared/math/vec2";
import { sampleQuadraticBezier2 } from "../../../shared/geometry/bezierSampling";
import { TAU, type PatternWheel, validatePatternWheel } from "../model/patternWheel";
import { DEFAULT_REFERENCE_POSITION_COUNT } from "../model/toothPattern";
import { familyProfiles, type FlankProfile } from "./wheelProfile";

export interface WheelContour {
  /** Sluten i geometrisk mening; första punkten upprepas inte sist. */
  readonly points: readonly Point2[];
}

export interface ContourOptions {
  readonly profile?: FlankProfile;
  readonly segmentsPerRevolution?: number;
}

const EPSILON = 1e-8;

function polar(radius: number, angle: number): Point2 {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}


function intersects(a: Point2, b: Point2, c: Point2, d: Point2): boolean {
  const ab1 = orientation2D(a, b, c);
  const ab2 = orientation2D(a, b, d);
  const cd1 = orientation2D(c, d, a);
  const cd2 = orientation2D(c, d, b);
  return ab1 * ab2 < -EPSILON && cd1 * cd2 < -EPSILON;
}

function area(points: readonly Point2[]): number {
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }

  return sum / 2;
}

/**
 * Skapar en fri polygonkontur. Taggspetsen placeras i ett lokalt system
 * med radiell och tangentiell axel och kan ligga utanför sitt vinkelintervall.
 *
 * Flankerna kan samplas från kvadratiska Bézierkurvor. Spetsen är rak.
 * Den hanterar ännu inte individuellt redigerade taggar.
 */
export function createWheelContour(
  wheel: PatternWheel,
  options: ContourOptions = {},
): WheelContour {
  const errors = validatePatternWheel(wheel);

  if (errors.length > 0) {
    throw new Error(`Ogiltigt hjul: ${errors.join("; ")}`);
  }

  const profile = options.profile ?? {
    ...familyProfiles[wheel.family],
    ...wheel.toothGeometry,
  };
  // Separata värden överstyr den gemensamma kurvaturen när de finns.
  const firstFlankCurvatureMm = wheel.toothGeometry?.firstFlankCurvatureMm ?? profile.flankCurvatureMm;
  const secondFlankCurvatureMm = wheel.toothGeometry?.secondFlankCurvatureMm ?? profile.flankCurvatureMm;
  const resolution = options.segmentsPerRevolution ?? 384;

  if (!Number.isInteger(resolution) || resolution < 24 || resolution > 4096) {
    throw new RangeError("Upplösningen måste vara ett heltal mellan 24 och 4096.");
  }

  if (
    !Number.isFinite(profile.tipOffsetMm) ||
    !Number.isFinite(profile.tipWidthMm) ||
    !Number.isFinite(profile.flankCurvatureMm) ||
    profile.tipWidthMm < 0 ||
    profile.flankCurvatureMm < 0 ||
    !Number.isFinite(firstFlankCurvatureMm) || firstFlankCurvatureMm < 0 ||
    !Number.isFinite(secondFlankCurvatureMm) || secondFlankCurvatureMm < 0
  ) {
    throw new RangeError("Ogiltiga parametrar för taggprofilen.");
  }

  const root = wheel.rootDiameterMm / 2;
  const outer = wheel.outerDiameterMm / 2;
  const points: Point2[] = [];

  const append = (p: Point2): void => {
    const previous = points[points.length - 1];

    if (!previous || Math.hypot(p.x - previous.x, p.y - previous.y) > EPSILON) {
      points.push(p);
    }
  };

  // Återförena ett upphöjt parti som delats vid varvets nollpunkt.
  const intervals = [...wheel.intervals];
  const first = intervals[0];
  const last = intervals[intervals.length - 1];
  if ((wheel.positionCount !== undefined || wheel.referencePositionCount !== undefined) && intervals.length > 1 &&
      first.state === "lifted" && last.state === "lifted" && !first.separateStart) {
    intervals.shift();
    intervals.pop();
    intervals.push({ ...last, endAngle: first.endAngle + TAU });
  }
  const referenceCount = wheel.referencePositionCount ??
    (wheel.positionCount !== undefined ? DEFAULT_REFERENCE_POSITION_COUNT : undefined);

  if (wheel.positionCount !== undefined &&
      (!Number.isSafeInteger(wheel.positionCount) || wheel.positionCount <= 0)) {
    throw new RangeError("Ogiltig konstruktionsdelning.");
  }
  if (referenceCount !== undefined &&
      (!Number.isSafeInteger(referenceCount) || referenceCount <= 0)) {
    throw new RangeError("Ogiltig referensdelning.");
  }
  const pitch = referenceCount === undefined ? undefined : TAU / referenceCount;

  for (const interval of intervals) {
    const span = interval.endAngle - interval.startAngle;

    if (interval.state === "writing" || (pitch !== undefined && span >= TAU - EPSILON)) {
      const count = Math.max(2, Math.ceil(resolution * span / TAU));

      for (let i = 0; i < count; i++) {
        append(polar(interval.state === "writing" ? root : outer, interval.startAngle + span * i / count));
      }

      continue;
    }

    // En flank byggs från en grundposition, inte hela det breda partiet.
    if (pitch !== undefined && span < pitch - EPSILON) {
      throw new RangeError("Toppintervallet är mindre än referenstaggen.");
    }
    const unitSpan = pitch === undefined ? span : pitch;
    const extension = span - unitSpan;
    const centerAngle = interval.startAngle + unitSpan / 2;
    const radial = polar(1, centerAngle);
    const tangent = { x: -radial.y, y: radial.x };
    const baseStart = polar(root, interval.startAngle);
    const baseEnd = polar(root, interval.endAngle);
    const tipCenter = {
      x: outer * radial.x + profile.tipOffsetMm * tangent.x,
      y: outer * radial.y + profile.tipOffsetMm * tangent.y,
    };

    // Spetsens bredd mäts längs tangenten, oberoende av dess förskjutning.
    const halfWidth = profile.tipWidthMm / 2;
    const tipStart = {
      x: tipCenter.x - halfWidth * tangent.x,
      y: tipCenter.y - halfWidth * tangent.y,
    };
    const tipEnd = {
      x: tipCenter.x + halfWidth * tangent.x,
      y: tipCenter.y + halfWidth * tangent.y,
    };

    // Rotera den avslutande spetsänden kring centrum utan att skala flanken.
    const rotatedTipEnd = {
      x: tipEnd.x * Math.cos(extension) - tipEnd.y * Math.sin(extension),
      y: tipEnd.x * Math.sin(extension) + tipEnd.y * Math.cos(extension),
    };

    append(baseStart);

    // En kvadratisk Bézierkurva används bara när kurvaturen är skild från noll.
    // Kontrollpunkten flyttas vinkelrätt mot flanken, inte längs den.
    // Positiv kurvatur böjer flanken utåt från hjulets centrum.
    const appendFlank = (start: Point2, end: Point2, curvatureMm: number): void => {
      const direction = subtractVec2(end, start);
      const length = lengthVec2(direction);

      if (length < EPSILON || curvatureMm === 0) {
        append(end);
        return;
      }

      const midpoint = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
      };
      const normal = {
        x: -direction.y / length,
        y: direction.x / length,
      };

      // Välj den av de två normalriktningarna som pekar bort från centrum.
      const orientation = normal.x * midpoint.x + normal.y * midpoint.y >= 0 ? 1 : -1;
      const control = {
        x: midpoint.x + orientation * curvatureMm * normal.x,
        y: midpoint.y + orientation * curvatureMm * normal.y,
      };

      // Samplingens första punkt är redan tillagd i konturen.
      for (const point of sampleQuadraticBezier2(start, control, end, 12).slice(1)) {
        append(point);
      }
    };

    appendFlank(baseStart, tipStart, firstFlankCurvatureMm);
    append(tipEnd);
    if (extension > EPSILON) {
      // Förläng den ursprungliga spetsen med en båge genom dess slutpunkt.
      const radius = Math.hypot(tipEnd.x, tipEnd.y);
      const angle = Math.atan2(tipEnd.y, tipEnd.x);
      const count = Math.max(1, Math.ceil(resolution * extension / TAU));
      for (let i = 1; i < count; i++) {
        append(polar(radius, angle + extension * i / count));
      }
      append(rotatedTipEnd);
    }
    appendFlank(rotatedTipEnd, baseEnd, secondFlankCurvatureMm);
  }

  // Lägg till sista punkten på rotcirkeln när sista intervallet är nedsänkt.
  // Vid varvslutet sammanfaller den med startpunkten och ska inte dupliceras.
  if (points.length > 1 && Math.hypot(
    points[0].x - points[points.length - 1].x,
    points[0].y - points[points.length - 1].y,
  ) < EPSILON) {
    points.pop();
  }

  if (points.length < 3 || area(points) <= EPSILON) {
    throw new Error("Konturen saknar giltig moturs orientering.");
  }

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) {
        continue;
      }

      const c = points[j];
      const d = points[(j + 1) % points.length];

      if (intersects(a, b, c, d)) {
        throw new Error("Taggarnas kontur korsar sig. Minska spetsförskjutningen eller spetsbredden.");
      }
    }
  }

  return { points };
}
