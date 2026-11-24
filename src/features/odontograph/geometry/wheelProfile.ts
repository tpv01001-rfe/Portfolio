import {
  TAU,
  type PatternWheel,
  type WheelFamily,
} from "../model/patternWheel";

export type RotationDirection = "ccw" | "cw";

/**
 * Profilparametrar i hjulets lokala XY-plan.
 * Positiv tangentiell förskjutning följer ökande vinkel (moturs).
 * Måtten är illustrativa och inte historiskt uppmätta.
 */
export interface FlankProfile {
  readonly leadingFraction: number;
  readonly trailingFraction: number;
  readonly shape: "linear" | "smooth";
  readonly rotationDirection: RotationDirection;
  readonly tipOffsetMm: number;
  readonly tipWidthMm: number;
  readonly flankCurvatureMm: number;
}

export const familyProfiles: Record<WheelFamily, FlankProfile> = {
  richter: {
    leadingFraction: 0.22,
    trailingFraction: 0.22,
    shape: "linear",
    rotationDirection: "ccw",
    tipOffsetMm: 0,
    tipWidthMm: 0.35,
    flankCurvatureMm: 0,
  },
  haff: {
    leadingFraction: 0.32,
    trailingFraction: 0.32,
    shape: "smooth",
    rotationDirection: "ccw",
    tipOffsetMm: 0,
    tipWidthMm: 0.45,
    flankCurvatureMm: 0.12,
  },
  riefler: {
    leadingFraction: 0.34,
    trailingFraction: 0.08,
    shape: "linear",
    rotationDirection: "ccw",
    tipOffsetMm: -0.81,
    tipWidthMm: 0.03,
    flankCurvatureMm: 0,
  },
  custom: {
    leadingFraction: 0.20,
    trailingFraction: 0.20,
    shape: "linear",
    rotationDirection: "ccw",
    tipOffsetMm: 0,
    tipWidthMm: 0.25,
    flankCurvatureMm: 0,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function transition(value: number, shape: FlankProfile["shape"]): number {
  const t = clamp(value, 0, 1);
  return shape === "smooth" ? t * t * (3 - 2 * t) : t;
}

/**
 * Äldre radiell kamprofil: varje lyft intervall motsvarar ett upphöjt område.
 * Spetsen förskjuts här endast inom intervallet; detta är den gamla begränsningen.
 * Förskjutningen begränsas för att inte passera intervallgränserna.
 * Spetsrundningen är approximativ, inte en exakt cirkelbåge.
 */
export function wheelRadiusAtAngle(
  wheel: PatternWheel,
  angle: number,
  profile: FlankProfile = familyProfiles[wheel.family],
): number {
  const normalized = ((angle % TAU) + TAU) % TAU;
  const intervals = wheel.intervals;
  const intervalIndex = intervals.findIndex(
    (interval) => normalized >= interval.startAngle && normalized < interval.endAngle,
  );
  const index = intervalIndex >= 0 ? intervalIndex : intervals.length - 1;
  const interval = intervals[index];
  const rootRadius = wheel.rootDiameterMm / 2;
  const outerRadius = wheel.outerDiameterMm / 2;

  if (interval.state === "writing") {
    return rootRadius;
  }

  const previous = intervals[(index - 1 + intervals.length) % intervals.length];
  const next = intervals[(index + 1) % intervals.length];
  const span = interval.endAngle - interval.startAngle;
  const local = (normalized - interval.startAngle) / span;
  const meanRadius = (rootRadius + outerRadius) / 2;
  const arcLength = span * meanRadius;

  if (
    !Number.isFinite(profile.tipOffsetMm) ||
    !Number.isFinite(profile.tipWidthMm) ||
    !Number.isFinite(profile.flankCurvatureMm) ||
    profile.tipWidthMm < 0 ||
    profile.flankCurvatureMm < 0 ||
    !Number.isFinite(profile.leadingFraction) ||
    !Number.isFinite(profile.trailingFraction) ||
    profile.leadingFraction < 0 ||
    profile.trailingFraction < 0
  ) {
    throw new RangeError("Invalid tooth profile parameters");
  }

  const leading = profile.rotationDirection === "ccw"
    ? profile.leadingFraction
    : profile.trailingFraction;
  const trailing = profile.rotationDirection === "ccw"
    ? profile.trailingFraction
    : profile.leadingFraction;

  const hasRise = previous.state === "writing";
  const hasFall = next.state === "writing";
  const rise = hasRise ? leading : 0;
  const fall = hasFall ? trailing : 0;

  if (rise + fall > 1) {
    throw new RangeError("Flank fractions must sum to at most one");
  }

  // En symmetrisk tagg har spetsen i mitten. Förskjutningen flyttar den
  // mot en tidigare eller senare vinkel, men aldrig utanför intervallet.
  const tipWidthFraction = clamp(profile.tipWidthMm / arcLength, 0, 0.95);
  const offsetFraction = profile.tipOffsetMm / arcLength;
  const center = clamp(
    0.5 + offsetFraction,
    tipWidthFraction / 2 + 0.001,
    1 - tipWidthFraction / 2 - 0.001,
  );
  const leftTip = center - tipWidthFraction / 2;
  const rightTip = center + tipWidthFraction / 2;

  // För en upphöjd del med nedsänkta grannar ligger roten vid
  // båda intervallgränserna. Övriga gränser behåller ytterradien.
  const startHeight = hasRise ? 0 : 1;
  const endHeight = hasFall ? 0 : 1;
  const smoothing = clamp(
    profile.flankCurvatureMm / Math.max(outerRadius - rootRadius, 1e-9),
    0,
    1,
  );
  const shape = smoothing > 0.01 ? "smooth" : profile.shape;

  let height = 1;

  if (local < leftTip && hasRise) {
    height = startHeight + (1 - startHeight) * transition(local / Math.max(leftTip, 1e-9), shape);
  } else if (local > rightTip && hasFall) {
    height = endHeight + (1 - endHeight) * transition((1 - local) / Math.max(1 - rightTip, 1e-9), shape);
  }

  return rootRadius + height * (outerRadius - rootRadius);
}
