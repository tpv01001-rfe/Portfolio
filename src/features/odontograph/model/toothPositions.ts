import type { PenState } from "./patternWheel";

export type ToothPattern = readonly PenState[];

export function validateCount(count: number): void {
    if (!Number.isSafeInteger(count) || count <= 0) {
        throw new RangeError("Antalet positioner måste vara ett positivt heltal.");
    }
}

export function wrapIndex(index: number, count: number): number {
    validateCount(count);
    if (!Number.isSafeInteger(index)) {
        throw new RangeError("Index måste vara ett heltal.");
    }
    return ((index % count) + count) % count;
}

export function createToothPattern(
    count = 36,
    state: PenState = "lifted"
): ToothPattern {
    validateCount(count);
    return Array.from({ length: count }, () => state);
}

export function setPositionRange(
    pattern: ToothPattern,
    start: number,
    count: number,
    state: PenState
): ToothPattern {
    validateCount(pattern.length);
    if (!Number.isSafeInteger(count) || count < 0 || count > pattern.length) {
        throw new RangeError("Ogiltig intervallängd.");
    }
    const first = wrapIndex(start, pattern.length);
    return pattern.map((value, index) =>
        wrapIndex(index - first, pattern.length) < count ? state : value
    );
}

export function setPosition(
    pattern: ToothPattern,
    index: number,
    state: PenState
): ToothPattern {
    return setPositionRange(pattern, index, 1, state);
}

export function rotatePattern(pattern: ToothPattern, steps: number): ToothPattern {
    const shift = wrapIndex(steps, pattern.length);
    return pattern.map((_, index) =>
        pattern[wrapIndex(index - shift, pattern.length)]
    );
}

export function invertPattern(pattern: ToothPattern): ToothPattern {
    return pattern.map(state => state === "lifted" ? "writing" : "lifted");
}
