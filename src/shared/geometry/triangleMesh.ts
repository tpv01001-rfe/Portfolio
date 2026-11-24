import type { Vec3 } from "../math/vec3";

export type TriangleMesh = {
  vertices: Vec3[];
  normals: Vec3[];
  triangles: [number, number, number][];
};
