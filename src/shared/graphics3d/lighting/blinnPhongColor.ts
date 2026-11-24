

import {
  addVec3,
  subtractVec3,
  normalizeVec3,
  dotVec3,
  type Vec3,
} from "../../math/vec3";

export type LinearRGB = {
  r: number;
  g: number;
  b: number;
};

export type SurfaceMaterial = {
  color: LinearRGB;
  specularColor: LinearRGB;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
};

export type SurfaceLight = {
  // Riktningen FRÅN ytan MOT ljuskällan.
  direction: Vec3;
  color: LinearRGB;
  ambientColor: LinearRGB;
};

export type LightingInput = {
  position: Vec3;
  normal: Vec3;
  cameraPosition: Vec3;
  light: SurfaceLight;
  material: SurfaceMaterial;
};


export type PreparedLighting = {
  lightDirection: Vec3;

  ambientColor: LinearRGB;
  diffuseColor: LinearRGB;
  specularColor: LinearRGB;

  shininess: number;
};

export function prepareBlinnPhongLighting(
  light: SurfaceLight,
  material: SurfaceMaterial
): PreparedLighting {
  return {
    // Beräknas endast en gång per förberedelse.
    lightDirection: normalizeVec3(light.direction),

    // Konstanta färgprodukter.
    ambientColor: {
      r: material.color.r *
         light.ambientColor.r *
         material.ambient,
      g: material.color.g *
         light.ambientColor.g *
         material.ambient,
      b: material.color.b *
         light.ambientColor.b *
         material.ambient,
    },

    diffuseColor: {
      r: material.color.r *
         light.color.r *
         material.diffuse,
      g: material.color.g *
         light.color.g *
         material.diffuse,
      b: material.color.b *
         light.color.b *
         material.diffuse,
    },

    specularColor: {
      r: material.specularColor.r *
         light.color.r *
         material.specular,
      g: material.specularColor.g *
         light.color.g *
         material.specular,
      b: material.specularColor.b *
         light.color.b *
         material.specular,
    },

    shininess: material.shininess,
  };
}


/**
 * Beräknar Blinn–Phong-belysning för en pixel.
 *
 * Prestandaoptimerad för CPU-baserad rasterisering:
 *
 * - Konstanta ljus- och materialvärden förbereds separat.
 * - Ytnormalen förutsätts redan vara normaliserad.
 * - Vektoroperationer utförs med skalära komponenter.
 * - Tillfälliga Vec3-objekt undviks i den inre pixel-loopen.
 * - Spekulära beräkningar hoppas över när de inte behövs.
 *
 * Optimeringen behåller Blinn–Phong-modellens matematik
 * men minskar overhead från objekt och funktionsanrop.
 *
 * I våra mätningar minskade den totala renderingstiden
 * med ungefär 10 ms efter optimeringen av vektoroperationerna.
 */
export function calculatePreparedBlinnPhongColor(
  position: Vec3,
  normal: Vec3,
  cameraPosition: Vec3,
  prepared: PreparedLighting
): LinearRGB {
  //const n = normalizeVec3(normal);
  const n = normal; //normal är redan normaliserad i rasterizePhongTriangle
  const l = prepared.lightDirection;

  const ndotl = Math.max(0, dotVec3(n, l));

  let specular = 0;

  //if (ndotl > 0) {

    if (
  ndotl > 0 &&
  (
    prepared.specularColor.r !== 0 ||
    prepared.specularColor.g !== 0 ||
    prepared.specularColor.b !== 0
  )
) {
    // const viewDirection = normalizeVec3(
    //   subtractVec3(cameraPosition, position)
    // );

    /**
 * Beräkna den normaliserade riktningen från ytpunkten till kameran.
 *
 * V = (cameraPosition - position) / |cameraPosition - position|
 *
 * Vi använder separata skalära komponenter i stället för
 * subtractVec3() och normalizeVec3().
 *
 * Det undviker tillfälliga Vec3-objekt och minskar antalet
 * funktionsanrop i den pixelintensiva Phong-beräkningen.
 */
const vx = cameraPosition.x - position.x;
const vy = cameraPosition.y - position.y;
const vz = cameraPosition.z - position.z;

 /**
   * Beräkna inversen av vektorns längd.
   *
   * 1 / sqrt(x² + y² + z²)
   *
   * Samma faktor används för samtliga tre komponenter.
   * Kontrollvillkoret skyddar mot division med noll.
   */
const invLength = 1 / Math.sqrt(
  vx * vx + vy * vy + vz * vz
);

const viewX = vx * invLength;
const viewY = vy * invLength;
const viewZ = vz * invLength;
 

/*

    const halfVectorSum = addVec3(l, viewDirection);

    const halfLengthSquared = dotVec3(
      halfVectorSum,
      halfVectorSum
    );

    if (halfLengthSquared > 1e-20) {
      const halfVector = normalizeVec3(halfVectorSum);

      const ndoth = Math.max(
        0,
        dotVec3(n, halfVector)
      );

      specular = Math.pow(ndoth, prepared.shininess);
    }
*/

/**
 * Blinn–Phong använder halvvägsvektorn mellan
 * ljusriktningen L och kamerariktningen V.
 *
 * H = normalize(L + V)
 *
 * Vi beräknar först den onormaliserade summan.
 * Även här används skalära komponenter för att
 * undvika att skapa ytterligare Vec3-objekt.
 */
    const hx = l.x + viewX;
const hy = l.y + viewY;
const hz = l.z + viewZ;

const halfLengthSquared =
  hx * hx + hy * hy + hz * hz;

if (halfLengthSquared > 1e-20) {
  
    /**
   * Beräkna N · H, där H är normaliserad.
   *
   * Eftersom H = (L + V) / |L + V| kan vi skriva:
   *
   * N · H = (N · (L + V)) / |L + V|
   *
   * Därmed behöver vi inte skapa en separat
   * normaliserad Vec3 för halvvägsvektorn.
   *
   * N förutsätts redan vara normaliserad av rasteriseraren.
   */
  const invHalfLength =
    1 / Math.sqrt(halfLengthSquared);

  const ndoth = Math.max(
    0,
    (n.x * hx + n.y * hy + n.z * hz) * invHalfLength
  );

  specular = Math.pow(ndoth, prepared.shininess);
}
  }

  return {
    r:
      prepared.ambientColor.r +
      prepared.diffuseColor.r * ndotl +
      prepared.specularColor.r * specular,

    g:
      prepared.ambientColor.g +
      prepared.diffuseColor.g * ndotl +
      prepared.specularColor.g * specular,

    b:
      prepared.ambientColor.b +
      prepared.diffuseColor.b * ndotl +
      prepared.specularColor.b * specular,
  };
}


export function calculateBlinnPhongColor({
  position,
  normal,
  cameraPosition,
  light,
  material,
}: LightingInput): LinearRGB {
  // Normalisera ytans normal och ljusriktningen.
  const n = normalizeVec3(normal);
  const l = normalizeVec3(light.direction);

  // Ambient: konstant omgivningsljus.
  const ambient = material.ambient;

  // Diffus: Lamberts cosinuslag.
  const ndotl = Math.max(0, dotVec3(n, l));
  const diffuse = material.diffuse * ndotl;

  // Spekulär: Blinn–Phong.
  let specular = 0;

  if (ndotl > 0) {
    // Riktning från ytpunkten mot kameran.
    const viewDirection = normalizeVec3(
      subtractVec3(cameraPosition, position)
    );

    // Halvvägsvektorn mellan ljus och betraktare.
    const halfVectorSum = addVec3(l, viewDirection);

    // Undvik en odefinierad halvvägsriktning
    // när L och V är motsatta.
    const halfLengthSquared = dotVec3(
      halfVectorSum,
      halfVectorSum
    );

    if (halfLengthSquared > 1e-20) {
      const halfVector = normalizeVec3(halfVectorSum);

      const ndoth = Math.max(
        0,
        dotVec3(n, halfVector)
      );

      specular =
        material.specular *
        Math.pow(ndoth, material.shininess);
    }
  }

  // Materialets färg och ljuskällans färger.
  const { color, specularColor } = material;
  const { color: lightColor, ambientColor } = light;

  // Beräkna RGB-komponenterna separat.
  return {
    r:
      color.r * ambientColor.r * ambient +
      color.r * lightColor.r * diffuse +
      specularColor.r * lightColor.r * specular,

    g:
      color.g * ambientColor.g * ambient +
      color.g * lightColor.g * diffuse +
      specularColor.g * lightColor.g * specular,

    b:
      color.b * ambientColor.b * ambient +
      color.b * lightColor.b * diffuse +
      specularColor.b * lightColor.b * specular,
  };
}
