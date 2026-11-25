import { TAU, type PatternInterval, type PatternWheel, type PenState } from "./patternWheel";
import { validateCount, type ToothPattern } from "./toothPositions";

export interface ToothRun {
    readonly start: number;
    readonly count: number;
    readonly state: PenState;
}

// Börja vid ett tillståndsbyte så att ett parti över noll inte delas.
export function getCircularRuns(pattern: ToothPattern): readonly ToothRun[] {
    const n = pattern.length;
    validateCount(n);
    const start = pattern.findIndex((state, i) => state !== pattern[(i + n - 1) % n]);
    if (start < 0) {
        return [{ start: 0, count: n, state: pattern[0] }];
    }
    const runs: ToothRun[] = [];
    for (let i = 0; i < n; i++) {
        const index = (start + i) % n;
        const state = pattern[index];
        const previous = runs[runs.length - 1];
        if (previous?.state === state) {
            runs[runs.length - 1] = { ...previous, count: previous.count + 1 };
        } else {
            runs.push({ start: index, count: 1, state });
        }
    }
    return runs;
}

// Det befintliga intervallformatet kräver täckning från 0 till TAU.
export function toPatternIntervals(pattern: ToothPattern): PatternInterval[] {
    const n = pattern.length;
    validateCount(n);
    const intervals: PatternInterval[] = [];
    for (let start = 0; start < n;) {
        let end = start + 1;
        while (end < n && pattern[end] === pattern[start]) {
            end++;
        }
        intervals.push({
            id: `position-${start}`,
            startAngle: TAU * start / n,
            endAngle: TAU * end / n,
            state: pattern[start]
        });
        start = end;
    }
    return intervals;
}

export const DEFAULT_REFERENCE_POSITION_COUNT = 36;

export function validateToothGeometry(
    pattern: ToothPattern,
    referencePositionCount = DEFAULT_REFERENCE_POSITION_COUNT
): void {
    validateCount(referencePositionCount);

    for (const run of getCircularRuns(pattern)) {
        if (
            run.state === "lifted" &&
            run.count < pattern.length / referencePositionCount - 1e-10
        ) {
            throw new RangeError("Toppintervallet är mindre än referenstaggen.");
        }
    }
}

export function applyToothPattern(
    wheel: PatternWheel,
    pattern: ToothPattern,
    referencePositionCount = wheel.referencePositionCount ?? DEFAULT_REFERENCE_POSITION_COUNT
): PatternWheel {
    validateToothGeometry(pattern, referencePositionCount);

    return {
        ...wheel,
        positionCount: pattern.length,
        referencePositionCount,
        intervals: toPatternIntervals(pattern)
    };
}
