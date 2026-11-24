
import { type Vec3, crossVec3, lengthVec3, normalizeVec3 } from
    "../../math/vec3";

import type { NurbsSurface } from
    "./nurbsSurface";

import {
    findKnotSpan,
    basisFunctions,
    basisFunctionDerivatives,
} from "./bsplineBasis";

export type NurbsSurfaceDerivatives = {
    position: Vec3;
    du: Vec3;
    dv: Vec3;
    normal: Vec3;
};

/**
 * Beräknar position, partialderivator och normal
 * för en punkt på en NURBS-yta.
 *
 * Alla storheter beräknas med samma uppsättning
 * aktiva kontrollpunkter.
 */
export function evaluateNurbsDerivatives(
    surface: NurbsSurface,
    u: number,
    v: number
): NurbsSurfaceDerivatives {
    const {
        degreeU,
        degreeV,
        knotsU,
        knotsV,
        controlPoints,
    } = surface;

    const countU = controlPoints.length;
    const countV = controlPoints[0].length;

    const spanU = findKnotSpan(
        countU, degreeU, u, knotsU
    );

    const spanV = findKnotSpan(
        countV, degreeV, v, knotsV
    );

    // Basisfunktioner och deras derivator.
    const Nu = basisFunctions(
        spanU, u, degreeU, knotsU
    );

    const Nv = basisFunctions(
        spanV, v, degreeV, knotsV
    );

    const dNu = basisFunctionDerivatives(
        spanU, u, degreeU, knotsU
    );

    const dNv = basisFunctionDerivatives(
        spanV, v, degreeV, knotsV
    );

    // A och W i den rationella NURBS-formeln.
    let ax = 0, ay = 0, az = 0;
    let w = 0;

    // Derivatorna av A.
    let aux = 0, auy = 0, auz = 0;
    let avx = 0, avy = 0, avz = 0;

    // Derivatorna av viktsumman W.
    let wu = 0;
    let wv = 0;

    for (let a = 0; a <= degreeU; a++) {
        const i = spanU - degreeU + a;

        for (let b = 0; b <= degreeV; b++) {
            const j = spanV - degreeV + b;

            const cp = controlPoints[i][j];

            // Vanlig rationell vikt.
            const factor =
                Nu[a] * Nv[b] * cp.weight;

            // Vikt deriverad i u-riktningen.
            const factorU =
                dNu[a] * Nv[b] * cp.weight;

            // Vikt deriverad i v-riktningen.
            const factorV =
                Nu[a] * dNv[b] * cp.weight;

            ax += factor * cp.position.x;
            ay += factor * cp.position.y;
            az += factor * cp.position.z;
            w += factor;

            aux += factorU * cp.position.x;
            auy += factorU * cp.position.y;
            auz += factorU * cp.position.z;
            wu += factorU;

            avx += factorV * cp.position.x;
            avy += factorV * cp.position.y;
            avz += factorV * cp.position.z;
            wv += factorV;
        }
    }

    if (Math.abs(w) < 1e-12) {
        throw new Error(
            "NURBS-derivator: ogiltig viktsumma."
        );
    }

    // Ytans position S = A / W.
    const position: Vec3 = {
        x: ax / w,
        y: ay / w,
        z: az / w,
    };

    // Kvotregeln:
    //
    // S_u = (A_u - S * W_u) / W
    // S_v = (A_v - S * W_v) / W

    const du: Vec3 = {
        x: (aux - position.x * wu) / w,
        y: (auy - position.y * wu) / w,
        z: (auz - position.z * wu) / w,
    };

    const dv: Vec3 = {
        x: (avx - position.x * wv) / w,
        y: (avy - position.y * wv) / w,
        z: (avz - position.z * wv) / w,
    };


    // Tangentvektorernas kryssprodukt ger
    // en vektor vinkelrät mot ytans tangentplan.
    const n = crossVec3(du, dv);

    //const length = Math.hypot(n.x, n.y, n.z);

    // En mycket liten kryssprodukt betyder att
    // tangentvektorerna är parallella eller nästan
    // parallella. Då är normalen inte tillförlitlig.
    if (lengthVec3(n) < 1e-12) {
        throw new Error(
            "NURBS-derivator: degenererad normal."
        );
    }

    // Normalisera till längden 1.
    const normal = normalizeVec3(n);

    return { position, du, dv, normal };
}
