
/**
 * Hittar det knotintervall som innehåller u.
 *
 * count = antal kontrollpunkter.
 * degree = B-spline-grad.
 *
 * Returnerar ett index mellan degree
 * och count - 1.
 */
export function findKnotSpan(
  count: number,
  degree: number,
  u: number,
  knots: readonly number[]
): number {
  const n = count - 1;

  const start = knots[degree];
  const end = knots[count];

  if (u < start || u > end) {
    throw new RangeError(
      `Parameter ${u} ligger utanför [${start}, ${end}].`
    );
  }

  // Sista punkten tillhör sista spannet.
  if (u === end) return n;

  let low = degree;
  let high = count;
  let mid = Math.floor((low + high) / 2);

  while (u < knots[mid] || u >= knots[mid + 1]) {
    if (u < knots[mid]) {
      high = mid;
    } else {
      low = mid;
    }

    mid = Math.floor((low + high) / 2);
  }

  return mid;
}

/**
 * Beräknar de degree + 1 aktiva
 * B-spline-basisfunktionerna vid u.
 *
 * values[k] motsvarar kontrollpunkten
 * med index span - degree + k.
 */
export function basisFunctions(
  span: number,
  u: number,
  degree: number,
  knots: readonly number[]
): number[] {
  const values = new Array<number>(
    degree + 1
  ).fill(0);

  const left = new Array<number>(
    degree + 1
  ).fill(0);

  const right = new Array<number>(
    degree + 1
  ).fill(0);

  values[0] = 1;

  for (let j = 1; j <= degree; j++) {
    left[j] = u - knots[span + 1 - j];
    right[j] = knots[span + j] - u;

    let saved = 0;

    for (let r = 0; r < j; r++) {
      const denominator =
        right[r + 1] + left[j - r];

      const temp =
        denominator === 0
          ? 0
          : values[r] / denominator;

      values[r] =
        saved + right[r + 1] * temp;

      saved = left[j - r] * temp;
    }

    values[j] = saved;
  }

  return values;
}




/**
 * Beräknar förstaderivatorna för de aktiva
 * B-spline-basisfunktionerna.
 *
 * Använder Cox–de Boors derivataformel.
 *
 * Resultatet har degree + 1 element,
 * i samma ordning som basisFunctions().
 */
export function basisFunctionDerivatives(
  span: number,
  u: number,
  degree: number,
  knots: readonly number[]
): number[] {
  // En konstant basisfunktion har
  // derivatan noll.
  if (degree === 0) {
    return [0];
  }

  // Derivatan för grad p kan uttryckas
  // med basisfunktioner av grad p - 1.
  const lower = basisFunctions(
    span,
    u,
    degree - 1,
    knots
  );

  const derivatives = new Array<number>(
    degree + 1
  ).fill(0);

  for (let a = 0; a <= degree; a++) {
    // Globalt index för aktuell basisfunktion.
    const i = span - degree + a;

    const leftDenominator =
      knots[i + degree] - knots[i];

    const rightDenominator =
      knots[i + degree + 1] - knots[i + 1];

    // Första termen i derivataformeln.
    const left =
      a > 0 && leftDenominator !== 0
        ? degree * lower[a - 1] /
          leftDenominator
        : 0;

    // Andra termen i derivataformeln.
    const right =
      a < degree && rightDenominator !== 0
        ? degree * lower[a] /
          rightDenominator
        : 0;

    derivatives[a] = left - right;
  }

  return derivatives;
}
