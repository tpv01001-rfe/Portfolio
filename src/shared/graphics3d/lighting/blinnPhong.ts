
import type { Vec3 } from "../../math/vec3";

import {
  addVec3,
  subtractVec3,
  dotVec3,
  normalizeVec3,
  lengthSquaredVec3,
} from "../../math/vec3";

export type BlinnPhongMaterial = {
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
};

export type DirectionalLight = {
  // Riktningen från ytan mot ljuskällan.
  direction: Vec3;
  intensity: number;
};

/**
 * Beräknar Blinn–Phong-belysning vid en punkt.
 *
 * Alla vektorer förutsätts vara uttryckta
 * i samma koordinatsystem.
 *
 * Returnerar en ljusintensitet, inte en färg.
 */
export function calculateBlinnPhong(
  position: Vec3,
  normal: Vec3,
  cameraPosition: Vec3,
  light: DirectionalLight,
  material: BlinnPhongMaterial
): number {
  // Normalen och ljusriktningen måste
  // vara enhetsvektorer.
  const N = normalizeVec3(normal);
  const L = normalizeVec3(light.direction);

  // V pekar från ytpunkten mot kameran.
  const V = normalizeVec3(
    subtractVec3(cameraPosition, position)
  );

  // Grundbelysning som inte beror på vinklar.
  const ambient = material.ambient;

  // Lambert: ljuset är starkast när normalen
  // pekar direkt mot ljuskällan.
  const ndotl = Math.max(0, dotVec3(N, L));

  const diffuse =
    material.diffuse * ndotl * light.intensity;

  // Halfway-vektorn ligger mellan
  // ljusriktningen och betraktarriktningen.
  const lightPlusView = addVec3(L, V);

  let specular = 0;

  if (
    ndotl > 0 &&
    lengthSquaredVec3(lightPlusView) > 1e-20
  ) {
    const H = normalizeVec3(lightPlusView);

    // Högre shininess ger en mindre,
    // mer koncentrerad ljusreflex.
    specular =
      material.specular *
      Math.pow(
        Math.max(0, dotVec3(N, H)),
        material.shininess
      ) *
      light.intensity;
  }

  return ambient + diffuse + specular;
}
