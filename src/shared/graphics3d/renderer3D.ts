import type { Canvas3DFrame } from "./Canvas3D";
import type { Camera3D } from "./camera";
import { getCameraMatrices } from "./camera";
import { projectPoint3D } from "./projection";
import { transformVec4Mat4 } from "../math/mat4";
import { normalizeVec3 } from "../math/vec3";
import { transformNormal } from "./transformNormal";
import { calculateBlinnPhongColor, type SurfaceLight, type SurfaceMaterial } from "./lighting";
import {
  createFramebuffer, clearFramebuffer, rasterizeGouraudTriangle,
  rasterizePhongTriangle, createRasterProfile,
  type RasterVertex, type Framebuffer, type RasterizationMode,
} from "./rasterizer";
import type { TriangleMesh } from "../geometry/triangleMesh";
import {
  drawDepthTestedContours,
  type ContourPath3D,
} from "./depthTestedContours";

export type RenderMode3D = "wireframe" | "gouraud" | "phong";
export type Renderer3DOptions = {
  renderMode: RenderMode3D;
  profilingEnabled: boolean;
  lightingEnabled: boolean;
  specularEnabled: boolean;
  rasterizationMode: RasterizationMode;
  renderScale?: number;

  // Valfria inställningar. Andra projekt behåller sina standardvärden.
  surfaceMaterial?: SurfaceMaterial;
  contourPaths?: readonly ContourPath3D[];
};
export type Renderer3DResult = {
  rasterTimeMs: number;
  width: number;
  height: number;
  rasterProfile?: ReturnType<typeof createRasterProfile>;
};

/** React-oberoende CPU-renderare. En instans per 3D-visare. */
export class Renderer3D {
  private framebuffer: Framebuffer | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;

  render(
    { ctx, size }: Canvas3DFrame,
    mesh: TriangleMesh,
    camera: Camera3D,
    options: Renderer3DOptions,
  ): Renderer3DResult {
    const { renderMode, profilingEnabled, lightingEnabled, specularEnabled,
      rasterizationMode } = options;
    const renderScale = options.renderScale ?? 1;
    const activeRasterizationMode = rasterizationMode;
      const viewport = renderMode === "wireframe"
        ? size
        : {
          width: Math.max(
            1,
            Math.round(ctx.canvas.width * renderScale)
          ),
          height: Math.max(
            1,
            Math.round(ctx.canvas.height * renderScale)
          ),
        };

      const matrices = getCameraMatrices(
        camera,
        viewport.width / viewport.height
      );

      const projected = mesh.vertices.map(point =>
        projectPoint3D(
          point,
          matrices.modelViewProjection,
          viewport
        )
      );

      if (renderMode === "wireframe") {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#55c8e8";

        for (const [a, b, c] of mesh.triangles) {
          const p0 = projected[a];
          const p1 = projected[b];
          const p2 = projected[c];

          if (!p0 || !p1 || !p2) continue;

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();
          ctx.stroke();
        }

        return { rasterTimeMs: 0, width: size.width, height: size.height };
      }

      const framebufferWidth = Math.round(viewport.width);
      const framebufferHeight = Math.round(viewport.height);

      let framebuffer = this.framebuffer;

      // Skapa en ny framebuffer endast om den saknas
      // eller om renderingsupplösningen har ändrats.
      if (
        !framebuffer ||
        framebuffer.width !== framebufferWidth ||
        framebuffer.height !== framebufferHeight
      ) {
        framebuffer = createFramebuffer(
          framebufferWidth,
          framebufferHeight
        );

        this.framebuffer = framebuffer;
      }

      const rasterProfile =
  renderMode === "phong" && profilingEnabled
    ? createRasterProfile()
    : undefined;

      // Återställ färg- och djupbufferten inför nästa bildruta.
      clearFramebuffer(framebuffer, {
        r: 16,
        g: 24,
        b: 32,
        a: 255,
      });

      const cameraPosition = {
        x: 0,
        y: 0,
        z: camera.distance,
      };

      //Gouraud shading: beräkna belysning en gång per hörn.
      const light = {
        direction: normalizeVec3({
          x: 0.5,
          y: 0.8,
          z: 1,
        }),
        intensity: 1,
      };

      //Gouraud shading
      const material = {
        ambient: 0.18,
        diffuse: 0.75,
        specular: 0.35,
        shininess: 32,
      };

      //Phong shading
      const surfaceLight: SurfaceLight = {
        direction: light.direction,
        color: {
          r: light.intensity,
          g: light.intensity,
          b: light.intensity,
        },
        ambientColor: {
          r: 1,
          g: 1,
          b: 1,
        },
      };

      //Phong shading
      const defaultSurfaceMaterial: SurfaceMaterial = {
        // Linjär RGB, ungefär motsvarande
        // den tidigare grundfärgen #37A5CD.
        color: {
          r: 0.0382,
          g: 0.3763,
          b: 0.6105,
        },
        specularColor: {
          r: 1,
          g: 1,
          b: 1,
        },
        ambient: material.ambient,
        diffuse: material.diffuse,
        //specular: material.specular,
        specular: specularEnabled ? material.specular : 0,
        shininess: material.shininess,
      };


      const surfaceMaterial =
        options.surfaceMaterial ?? defaultSurfaceMaterial;

      const rasterVertices: (RasterVertex | null)[] =
        mesh.vertices.map((point, index) => {
          const projectedPoint = projected[index];

          if (!projectedPoint) return null;

          const transformed = transformVec4Mat4(
            matrices.model,
            { ...point, w: 1 }
          );

          const worldPosition = {
            x: transformed.x,
            y: transformed.y,
            z: transformed.z,
          };

          const worldNormal = transformNormal(
            mesh.normals[index],
            matrices.model
          );

          // Beräkna RGB-belysning endast i Gouraud-läget.
          const linearColor =
            renderMode === "gouraud"
              ? calculateBlinnPhongColor({
                position: worldPosition,
                normal: worldNormal,
                cameraPosition,
                light: surfaceLight,
                material: surfaceMaterial,
              })
              : undefined;

          return {
            position: {
              x: projectedPoint.x,
              y: projectedPoint.y,
            },
            depth: (projectedPoint.depth + 1) / 2,
            inverseW: projectedPoint.inverseW,
            worldPosition,
            normal: worldNormal,
            linearColor,
          };
        });

      const rasterStart = performance.now();

      // Rita trianglarna.
      for (const [a, b, c] of mesh.triangles) {
        const v0 = rasterVertices[a];
        const v1 = rasterVertices[b];
        const v2 = rasterVertices[c];

        if (!v0 || !v1 || !v2) continue;

        if (renderMode === "phong") {
          rasterizePhongTriangle(
            framebuffer,
            v0,
            v1,
            v2,
            cameraPosition,
            surfaceLight,
            surfaceMaterial,
            255,
            rasterProfile,
            lightingEnabled,
            activeRasterizationMode
          );
        } else {
          rasterizeGouraudTriangle(
            framebuffer,
            v0,
            v1,
            v2
          );
        }
      }

      // Rita endast konturens kanter, med samma djupbuffert
      // som Phong-trianglarna. Dolda kanter förblir dolda.
      if (options.contourPaths?.length) {
        // Filtrera bort konturer på hjulsidor som är vända
        // bort från kameran innan djupbufferttestet.
        const visiblePaths = options.contourPaths.filter((path) => {
          if (!path.faceNormal || !path.facePoint) {
            return true;
          }

          const normal = transformNormal(
            path.faceNormal,
            matrices.model
          );

          const point = transformVec4Mat4(
            matrices.model,
            { ...path.facePoint, w: 1 }
          );

          const facing =
            normal.x * (cameraPosition.x - point.x) +
            normal.y * (cameraPosition.y - point.y) +
            normal.z * (cameraPosition.z - point.z);

          return facing > 0;
        });

        drawDepthTestedContours(
          framebuffer,
          visiblePaths,
          matrices.modelViewProjection,
          viewport
        );
      }

      const rasterTimeMs = performance.now() - rasterStart;



      if (!this.offscreenCanvas) {
        this.offscreenCanvas =
          document.createElement("canvas");
      }

      const offscreenCanvas = this.offscreenCanvas;

      if (
        offscreenCanvas.width !== framebuffer.width ||
        offscreenCanvas.height !== framebuffer.height
      ) {
        offscreenCanvas.width = framebuffer.width;
        offscreenCanvas.height = framebuffer.height;
      }

      const offscreenCtx = offscreenCanvas.getContext("2d");

      if (offscreenCtx) {
        const imageData = offscreenCtx.createImageData(
          framebuffer.width,
          framebuffer.height
        );

        imageData.data.set(framebuffer.color);
        offscreenCtx.putImageData(imageData, 0, 0);

        // Rita upp den mindre bilden över hela synliga canvasen.
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = true;

        ctx.drawImage(
          offscreenCanvas,
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height
        );

        ctx.restore();
      }


      return {
        rasterTimeMs,
        width: framebuffer.width,
        height: framebuffer.height,
        rasterProfile,
      };
  }

  dispose(): void {
    this.framebuffer = null;
    this.offscreenCanvas = null;
  }
}
