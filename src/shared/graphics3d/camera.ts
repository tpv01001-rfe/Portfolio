
import type { Vec3 } from "../math/vec3";
import type { Mat4 } from "../math/mat4";
import type { Quaternion } from "../math/quaternion";

import {
  //identityMat4,
  multiplyMat4,
  translationMat4,
} from "../math/mat4";

import {
  identityQuaternion,
  quaternionToMat4,
} from "../math/quaternion";

export type Camera3D = {
  distance: number;
  target: Vec3;
  rotation: Quaternion;
  fov: number;
  near: number;
  far: number;
};

export type CameraMatrices = {
  view: Mat4;
  projection: Mat4;
  viewProjection: Mat4;
  model: Mat4;
  modelView: Mat4;
  modelViewProjection: Mat4;
};

export function createCamera3D(): Camera3D {
  return {
    distance: 350,
    target: { x: 0, y: 0, z: 0 },
    rotation: identityQuaternion(),
    fov: Math.PI / 3,
    near: 1,
    far: 1000,
  };
}

export function perspectiveMat4(
  fov: number,
  aspect: number,
  near: number,
  far: number
): Mat4 {
  if (
    !Number.isFinite(fov) ||
    !Number.isFinite(aspect) ||
    !Number.isFinite(near) ||
    !Number.isFinite(far) ||
    fov <= 0 ||
    fov >= Math.PI ||
    aspect <= 0 ||
    near <= 0 ||
    far <= near
  ) {
    throw new RangeError("Ogiltiga perspektivparametrar.");
  }

  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ];
}

export function getCameraMatrices(
  camera: Camera3D,
  aspect: number
): CameraMatrices {
  // Kameran står på positiva Z-axeln och tittar mot -Z.
  const view = translationMat4(
    -camera.target.x,
    -camera.target.y,
    -camera.distance - camera.target.z
  );

  // I första versionen roterar vi modellen.
  const model = quaternionToMat4(camera.rotation);

  const projection = perspectiveMat4(
    camera.fov,
    aspect,
    camera.near,
    camera.far
  );

  const viewProjection = multiplyMat4(
    projection,
    view
  );

  const modelView = multiplyMat4(view, model);

  const modelViewProjection = multiplyMat4(
    projection,
    modelView
  );

  return {
    view,
    projection,
    viewProjection,
    model,
    modelView,
    modelViewProjection,
  };
}
