/** Datamodell för odontografens mönsterhjul, utan beroenden till React eller rendering. */
export type WheelFamily = "richter" | "haff" | "riefler" | "custom";
export type PenState = "writing" | "lifted";

/** Vinkelintervall i radianer: [startAngle, endAngle), inom ett helt varv. */
export interface PatternInterval {
  readonly id: string;
  /** Separat tagg vid denna intervallgräns. */
  readonly separateStart?: boolean;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly state: PenState;
}

/** Äldre profilinställningar; värdena är inte historiskt uppmätta. */
export interface ToothStyle {
  readonly transitionFraction: number;
  readonly transitionShape: "linear" | "smooth";
}

/** Taggens geometriska parametrar i millimeter, oberoende av skrivmönstret. */
export interface ToothGeometry {
  readonly tipOffsetMm: number;
  readonly tipWidthMm: number;
  readonly flankCurvatureMm: number;
  /** Valfri separat kurvatur för flanken från första roten till spetsen. */
  readonly firstFlankCurvatureMm?: number;
  /** Valfri separat kurvatur för flanken från spetsen till andra roten. */
  readonly secondFlankCurvatureMm?: number;
}

export interface PatternWheel {
  /** Unik identifierare för det redigerbara hjulet. */
  readonly id?: string;
  readonly name?: string;
  /** Identifierare för det hjul som kopian skapades från. */
  readonly sourceWheelId?: string;
  readonly family: WheelFamily;
  /** Historiskt mönsternummer, om det är känt. */
  readonly patternNumber: number | null;
  readonly outerDiameterMm: number;
  readonly rootDiameterMm: number;
  readonly thicknessMm: number;
  /** Koaxiellt drivhjul; används för att omvandla papperssträcka till vinkel. */
  readonly driveDiameterMm: number;
  /** Grunddelning för diskreta mönster; utelämnas för fria intervall. */
  readonly positionCount?: number;
  /** Oberoende geometrisk referens; standard 36 för diskreta hjul. */
  readonly referencePositionCount?: number;
  readonly intervals: readonly PatternInterval[];
  readonly toothStyle: ToothStyle;
  readonly toothGeometry?: ToothGeometry;
}

export const TAU = 2 * Math.PI;

/** Schematiskt demonstrationshjul, inte en rekonstruktion av ett historiskt hjul. */
export function createDemoPatternWheel(): PatternWheel {
  return {
    id: "richter-demo",
    name: "Richter – demonstrationshjul",
    family: "richter",
    patternNumber: null,
    outerDiameterMm: 15,
    rootDiameterMm: 13.5, // preliminärt mått som behöver kontrolleras mot ett verkligt hjul
    thicknessMm: 1,
    driveDiameterMm: 17, // preliminärt
    toothStyle: {
      transitionFraction: 0.12,
      transitionShape: "smooth",
    },
    intervals: [
      {
        id: "a",
        startAngle: 0,
        endAngle: TAU * 0.12,
        state: "writing",
      },
      {
        id: "b",
        startAngle: TAU * 0.12,
        endAngle: TAU * 0.22,
        state: "lifted",
      },
      {
        id: "c",
        startAngle: TAU * 0.22,
        endAngle: TAU * 0.48,
        state: "writing",
      },
      {
        id: "d",
        startAngle: TAU * 0.48,
        endAngle: TAU * 0.62,
        state: "lifted",
      },
      {
        id: "e",
        startAngle: TAU * 0.62,
        endAngle: TAU * 0.73,
        state: "writing",
      },
      {
        id: "f",
        startAngle: TAU * 0.73,
        endAngle: TAU,
        state: "lifted",
      },
    ],
  };
}

export function validatePatternWheel(wheel: PatternWheel): string[] {
  const errors: string[] = [];
  const positive = (value: number) => Number.isFinite(value) && value > 0;

  if (!positive(wheel.outerDiameterMm)) {
    errors.push("outerDiameterMm must be positive");
  }

  if (
    !positive(wheel.rootDiameterMm) ||
    wheel.rootDiameterMm >= wheel.outerDiameterMm
  ) {
    errors.push("rootDiameterMm must be positive and smaller than outerDiameterMm");
  }

  if (!positive(wheel.thicknessMm)) {
    errors.push("thicknessMm must be positive");
  }

  if (!positive(wheel.driveDiameterMm)) {
    errors.push("driveDiameterMm must be positive");
  }

  if (
    !Number.isFinite(wheel.toothStyle.transitionFraction) ||
    wheel.toothStyle.transitionFraction < 0 ||
    wheel.toothStyle.transitionFraction > 0.5
  ) {
    errors.push("transitionFraction must be between 0 and 0.5");
  }

  if (wheel.intervals.length === 0) {
    errors.push("At least one interval is required");
  }

  const epsilon = 1e-9;
  let expectedStart = 0;
  const ids = new Set<string>();

  for (const interval of wheel.intervals) {
    if (ids.has(interval.id)) {
      errors.push(`Duplicate interval id: ${interval.id}`);
    }

    ids.add(interval.id);

    if (
      !Number.isFinite(interval.startAngle) ||
      !Number.isFinite(interval.endAngle) ||
      interval.endAngle <= interval.startAngle
    ) {
      errors.push(`Invalid angular bounds for ${interval.id}`);
    }

    if (Math.abs(interval.startAngle - expectedStart) > epsilon) {
      errors.push(`Gap or overlap before ${interval.id}`);
    }

    if (interval.state !== "writing" && interval.state !== "lifted") {
      errors.push(`Invalid pen state for ${interval.id}`);
    }

    expectedStart = interval.endAngle;
  }

  if (Math.abs(expectedStart - TAU) > epsilon) {
    errors.push("Intervals must cover exactly one revolution");
  }

  return errors;
}

/** Förutsätter gemensam rotation och att drivhjulet rullar utan att slira. */
export function paperDistanceToAngle(
  distanceMm: number,
  driveDiameterMm: number,
): number {
  if (
    !Number.isFinite(distanceMm) ||
    distanceMm < 0 ||
    !Number.isFinite(driveDiameterMm) ||
    driveDiameterMm <= 0
  ) {
    throw new RangeError("Distance must be nonnegative and drive diameter positive");
  }

  return TAU * distanceMm / (Math.PI * driveDiameterMm);
}

export function angleToPaperDistance(
  angle: number,
  driveDiameterMm: number,
): number {
  if (
    !Number.isFinite(angle) ||
    !Number.isFinite(driveDiameterMm) ||
    driveDiameterMm <= 0
  ) {
    throw new RangeError("Angle must be finite and drive diameter positive");
  }

  return angle / TAU * Math.PI * driveDiameterMm;
}

/** Symboliskt skrivmönster; en avslutande lucka skiljer upprepade varv åt. */
export function morseIntervals(
  text: string,
  driveDiameterMm: number,
  unitMm: number,
): PatternInterval[] {
  const alphabet: Record<string, string> = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
  };

  if (!Number.isFinite(unitMm) || unitMm <= 0) {
    throw new RangeError("unitMm must be positive");
  }

  const chars = text.toUpperCase().trim().split("");

  if (!chars.length || chars.some(ch => ch !== " " && !alphabet[ch])) {
    throw new Error("Only A-Z and spaces are supported");
  }

  const runs: { state: PenState; units: number }[] = [];

  const append = (state: PenState, units: number) => {
    const last = runs[runs.length - 1];

    if (last?.state === state) {
      last.units += units;
    } else {
      runs.push({ state, units });
    }
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (ch === " ") {
      continue;
    }

    const code = alphabet[ch];

    for (let j = 0; j < code.length; j++) {
      append("writing", code[j] === "." ? 1 : 3);

      if (j < code.length - 1) {
        append("lifted", 1);
      }
    }

    if (i < chars.length - 1) {
      append("lifted", chars[i + 1] === " " ? 7 : 3);
    }
  }

  // Separera sista och första tecknet när hjulet upprepar mönstret.
  append("lifted", 7);

  const totalUnits = runs.reduce((sum, run) => sum + run.units, 0);
  const circumferenceMm = Math.PI * driveDiameterMm;

  if (totalUnits * unitMm > circumferenceMm + 1e-9) {
    throw new RangeError("Pattern exceeds one drive-wheel revolution; reduce unitMm");
  }

  const result: PatternInterval[] = [];
  let angle = 0;

  runs.forEach((run, i) => {
    const endAngle = angle + paperDistanceToAngle(
      run.units * unitMm,
      driveDiameterMm,
    );

    result.push({
      id: `morse-${i}`,
      startAngle: angle,
      endAngle,
      state: run.state,
    });

    angle = endAngle;
  });

  // Fyll återstående omkrets med lyft penna och förläng sista luckan.
  const last = result[result.length - 1];

  result[result.length - 1] = {
    ...last,
    endAngle: TAU,
  };

  return result;
}

/** Sampla en enkel radiell profil; används inte för den nya fria konturen. */
export function sampleWheelRadius(wheel: PatternWheel, angle: number): number {
  const normalized = ((angle % TAU) + TAU) % TAU;

  const interval = wheel.intervals.find(
    i => normalized >= i.startAngle && normalized < i.endAngle,
  ) ?? wheel.intervals[wheel.intervals.length - 1];

  return (
    interval.state === "lifted"
      ? wheel.outerDiameterMm
      : wheel.rootDiameterMm
  ) / 2;
}

/**
 * Skapa en självständig redigerbar kopia av ett befintligt hjul.
 * Originalhjulet och dess intervall lämnas oförändrade.
 */
export function copyPatternWheel(
  source: PatternWheel,
  id: string,
  name: string,
): PatternWheel {
  if (!id.trim() || !name.trim()) {
    throw new Error("Wheel id and name must not be empty");
  }

  return {
    ...source,
    id,
    name,
    sourceWheelId: source.id,
    intervals: source.intervals.map((interval) => ({ ...interval })),
    toothStyle: { ...source.toothStyle },
    toothGeometry: source.toothGeometry ? { ...source.toothGeometry } : undefined,
  };
}

/**
 * Ändra pennans tillstånd inom ett vinkelområde (radianer).
 * Vinklarna måste ligga inom ett varv och startvinkeln före slutvinkeln.
 * Delar berörda intervall och slår ihop angränsande intervall med samma tillstånd.
 * Detta ändrar skrivmönstret, inte taggens geometriska flankform.
 */
export function setPenStateInRange(
  wheel: PatternWheel,
  startAngle: number,
  endAngle: number,
  state: PenState,
): PatternWheel {
  const epsilon = 1e-9;

  if (
    !Number.isFinite(startAngle) ||
    !Number.isFinite(endAngle) ||
    startAngle < 0 ||
    endAngle > TAU ||
    endAngle - startAngle <= epsilon ||
    (state !== "writing" && state !== "lifted")
  ) {
    throw new RangeError("Invalid angular range or pen state");
  }

  const errors = validatePatternWheel(wheel);

  if (errors.length > 0) {
    throw new Error(`Invalid wheel: ${errors.join("; ")}`);
  }

  const boundaries = [0, TAU, startAngle, endAngle];

  for (const interval of wheel.intervals) {
    boundaries.push(interval.startAngle, interval.endAngle);
  }

  boundaries.sort((a, b) => a - b);

  const uniqueBoundaries = boundaries.filter(
    (value, index) => index === 0 || value - boundaries[index - 1] > epsilon,
  );

  const intervals: PatternInterval[] = [];

  for (let index = 0; index < uniqueBoundaries.length - 1; index++) {
    const start = uniqueBoundaries[index];
    const end = uniqueBoundaries[index + 1];
    const midpoint = (start + end) / 2;
    const original = wheel.intervals.find(
      (interval) => midpoint >= interval.startAngle && midpoint < interval.endAngle,
    );

    if (!original) {
      throw new Error("Wheel intervals do not cover the selected range");
    }

    const selected = midpoint >= startAngle && midpoint < endAngle;
    const nextState = selected ? state : original.state;
    const previous = intervals[intervals.length - 1];

    const separateStart = nextState === "lifted" &&
      original.separateStart === true &&
      Math.abs(start - original.startAngle) < epsilon;

    if (previous?.state === nextState && !separateStart) {
      intervals[intervals.length - 1] = {
        ...previous,
        endAngle: end,
      };
    } else {
      intervals.push({
        id: `segment-${intervals.length}-${start.toFixed(9)}`,
        startAngle: start,
        endAngle: end,
        state: nextState,
        separateStart,
      });
    }
  }

  return {
    ...wheel,
    intervals,
  };
}

/** Sänk upphöjda partier till tandroten så att pennan skriver. */
export function lowerTeethInRange(
  wheel: PatternWheel,
  startAngle: number,
  endAngle: number,
): PatternWheel {
  return setPenStateInRange(wheel, startAngle, endAngle, "writing");
}

/** Höj ett område så att pennan lyfts från papperet. */
export function raiseTeethInRange(
  wheel: PatternWheel,
  startAngle: number,
  endAngle: number,
): PatternWheel {
  return setPenStateInRange(wheel, startAngle, endAngle, "lifted");
}
