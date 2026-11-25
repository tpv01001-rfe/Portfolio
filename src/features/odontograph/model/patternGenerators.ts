import { TAU, type PatternWheel } from "./patternWheel";
import { DEFAULT_REFERENCE_POSITION_COUNT } from "./toothPattern";
import { validateCount, type ToothPattern } from "./toothPositions";

export function repeatPattern(positionCount: number, unit: ToothPattern): ToothPattern {
    validateCount(positionCount);
    validateCount(unit.length);
    if (positionCount % unit.length !== 0) {
        throw new RangeError("Mönstrets period måste dela grunddelningen.");
    }
    return Array.from({ length: positionCount }, (_, i) => unit[i % unit.length]);
}

export function periodicSpacing(
    positionCount: number,
    topSpan: number,
    bottomSpan: number
): ToothPattern {
    validateCount(positionCount);
    validateCount(topSpan);
    validateCount(bottomSpan);
    const period = topSpan + bottomSpan;
    if (positionCount % period !== 0) {
        throw new RangeError("Topp och dal måste tillsammans dela grunddelningen.");
    }
    return Array.from({ length: positionCount }, (_, i) =>
        i % period < topSpan ? "lifted" : "writing"
    );
}

export function equalSpacing(positionCount: number, span: number): ToothPattern {
    return periodicSpacing(positionCount, span, span);
}

export function validEqualSpans(positionCount: number): readonly number[] {
    validateCount(positionCount);
    return Array.from({ length: Math.floor(positionCount / 2) }, (_, i) => i + 1)
        .filter(span => positionCount % (2 * span) === 0);
}

/** Råämne med individuella taggar, inte en sammanhängande topp. */
export function createReferenceWheel(
    source: PatternWheel,
    referencePositionCount = DEFAULT_REFERENCE_POSITION_COUNT
): PatternWheel {
    validateCount(referencePositionCount);
    return {
        ...source,
        positionCount: referencePositionCount,
        referencePositionCount,
        intervals: Array.from({ length: referencePositionCount }, (_, i) => ({
            id: `reference-${i}`,
            startAngle: TAU * i / referencePositionCount,
            endAngle: TAU * (i + 1) / referencePositionCount,
            state: "lifted" as const,
            separateStart: true
        }))
    };
}
