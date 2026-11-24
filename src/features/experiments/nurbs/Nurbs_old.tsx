
import { useCallback, useMemo, useState, useRef } from "react";
import "./Nurbs.css";

import { Canvas3D, type Canvas3DFrame } from
  "../../../shared/graphics3d/Canvas3D";

import {
  createCamera3D,
  getCameraMatrices,
} from "../../../shared/graphics3d/camera";

import { projectPoint3D } from
  "../../../shared/graphics3d/projection";

import { createOrbitController } from
  "../../../shared/graphics3d/orbitController";

import { createDemoSurface } from
  "./geometry/createDemoSurface";

import { tessellateNurbsSurface } from
  "./geometry/tessellateNurbsSurface";

import { transformVec4Mat4 } from
  "../../../shared/math/mat4";

import { normalizeVec3 } from
  "../../../shared/math/vec3";

import { transformNormal } from
  "../../../shared/graphics3d/transformNormal";

//lighting/index.ts
import {
  calculateBlinnPhongColor,
  type SurfaceLight,
  type SurfaceMaterial
} from "../../../shared/graphics3d/lighting";

import {
  createFramebuffer,
  clearFramebuffer,
  rasterizeGouraudTriangle,
  rasterizePhongTriangle,
  createRasterProfile,
  type RasterVertex,
  type Framebuffer,
  type RasterizationMode,
} from "../../../shared/graphics3d/rasterizer";

import {
  createRenderMetrics,
  type RenderMetrics,
} from "../../../shared/graphics3d/performance/renderMetrics";

import { useRasterBenchmark } from "./useRasterBenchmark";
import { RasterBenchmarkPanel } from "./RasterBenchmarkPanel";

const RENDER_SCALE = 1;

export default function Nurbs() {

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const framebufferRef = useRef<Framebuffer | null>(null); //äteranvändning
  //Mäter prestanda och renderingshastighet.
  const [renderMetrics, setRenderMetrics] =
    useState<RenderMetrics | null>(null);
  const [profilingEnabled, setProfilingEnabled] = useState(false);
  const [lightingEnabled, setLightingEnabled] = useState(true);
  const [specularEnabled, setSpecularEnabled] = useState(true);
const [rasterizationMode, setRasterizationMode] =
  useState<RasterizationMode>("bounding-box");

  const { running, results, start, getActiveMode, recordFrame } = useRasterBenchmark();

  const lastMetricsUpdateRef = useRef(0);
  // Kameran skapas en gång.
  // Controllern ändrar objektets egenskaper
  // utan att React behöver rendera om.
  const [camera] = useState(() => {
    const camera = createCamera3D();

    camera.distance = 200;

    return camera;
  });

  const [renderMode, setRenderMode] = useState<
    "wireframe" | "gouraud" | "phong"
  >("wireframe");

  // NURBS-ytan och triangelnätet är oberoende
  // av kamerans rotation, zoom och panorering.
  //
  // Därför beräknar vi geometrin bara en gång.
  const mesh = useMemo(() => {
    const surface = createDemoSurface();

    return tessellateNurbsSurface(
      surface,
      24,
      24
    );
  }, []);

  const handleCanvasReady = useCallback(
    (canvas: HTMLCanvasElement) =>
      createOrbitController(canvas, camera, {
        enableInertia: true,
        rotationDamping: 7,
        panDamping: 9,
        minDistance: 100,
        maxDistance: 1500,
      }),
    [camera]
  );


  const render = useCallback(
    ({ ctx, size }: Canvas3DFrame) => {

      // Prestandamätning: starttid.
      const renderStart = performance.now();

      const activeRasterizationMode = getActiveMode(rasterizationMode);

      const viewport = renderMode === "wireframe"
        ? size
        : {
          width: Math.max(
            1,
            Math.round(ctx.canvas.width * RENDER_SCALE)
          ),
          height: Math.max(
            1,
            Math.round(ctx.canvas.height * RENDER_SCALE)
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

        return;
      }

      const framebufferWidth = Math.round(viewport.width);
      const framebufferHeight = Math.round(viewport.height);

      let framebuffer = framebufferRef.current;

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

        framebufferRef.current = framebuffer;
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
      const surfaceMaterial: SurfaceMaterial = {
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

      const rasterTimeMs = performance.now() - rasterStart;


      /**
       * Renderar den färdiga framebufferbilden till den synliga canvasen.
       *
       * Vår CPU-rasteriserare arbetar med en reducerad upplösning
       * (RENDER_SCALE) för att minska antalet pixlar som behöver beräknas.
       * Resultatet finns i framebuffer.color som en RGBA-pixelbuffer.
       *
       * Algoritmen:
       *
       * 1. Skapa en separat, osynlig canvas första gången funktionen körs.
       *    Den återanvänds mellan bildrutorna via offscreenCanvasRef.
       *
       * 2. Anpassa den osynliga canvasens dimensioner till framebuffer.
       *    Storleken ändras endast vid behov, eftersom en storleksändring
       *    även återställer canvasens ritkontext.
       *
       * 3. Kopiera framebuffer.color till ett ImageData-objekt och skriv
       *    pixelinformationen till den osynliga canvasen med putImageData().
       *
       * 4. Rita den osynliga canvasen på den synliga canvasen med drawImage().
       *    Till skillnad från putImageData() kan drawImage() skala bilden.
       *    Därmed fyller den lågupplösta renderingen hela visningsytan.
       *
       * 5. Återställ den synliga canvasens tidigare ritinställningar.
       *
       * Transformationen återställs till identitetsmatrisen före drawImage()
       * eftersom Canvas3D normalt använder devicePixelRatio för skalning.
       * Utan detta skulle bilden riskera att skalas en extra gång.
       *
       * Resultat:
       * Samma visuella storlek som vid full upplösning, men med betydligt
       * färre pixelberäkningar i Gouraud- och Phong-renderingen.
       *
       * Observera att detta är en vanlig HTMLCanvasElement som används
       * som mellanbuffert, inte webbläsarens OffscreenCanvas-API.
       */

      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current =
          document.createElement("canvas");
      }

      const offscreenCanvas = offscreenCanvasRef.current;

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


      // Prestandamätning: beräkna renderingshastighet och antal trianglar.
      const frameEnd = performance.now();
      const frameTimeMs = frameEnd - renderStart;

      recordFrame(frameTimeMs, rasterTimeMs);

      if (frameEnd - lastMetricsUpdateRef.current >= 250) {
        lastMetricsUpdateRef.current = frameEnd;


        setRenderMetrics(
  createRenderMetrics(
    frameTimeMs,
    mesh.triangles.length,
    framebuffer.width,
    framebuffer.height,
    rasterProfile,
    rasterTimeMs
  )
);

      }



    },
    [camera, mesh, renderMode, profilingEnabled, lightingEnabled, specularEnabled, rasterizationMode, getActiveMode, recordFrame]
  );


  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 450,
        background: "#101820",
        borderRadius: 12,
        overflow: "auto",
      }}
    >

      <div style={{ display: "flex", gap: 8, padding: 12 }}>
        <button
          type="button"
          onClick={() => setRenderMode("wireframe")}
          aria-pressed={renderMode === "wireframe"}
        >
          Wireframe
        </button>

        <button
          type="button"
          onClick={() => setRenderMode("gouraud")}
          aria-pressed={renderMode === "gouraud"}
        >
          Gouraud
        </button>

        <button
          type="button"
          onClick={() => setRenderMode("phong")}
          aria-pressed={renderMode === "phong"}
        >
          Phong
        </button>
      </div>


      <div className="nurbs-canvas-container">
        <Canvas3D
          onCanvasReady={handleCanvasReady}
          render={render}
        />
      </div>

      <section className="nurbs-performance-section" aria-label="Renderingsprestanda">
        {renderMetrics && (
          <div className="render-performance-hud">
            <strong>Render Performance</strong>
            <div className="nurbs-performance-controls">
              <button type="button" className="raster-profile-toggle"
                onClick={() => setRasterizationMode(current =>
                  current === "bounding-box" ? "scanline" : "bounding-box"
                )}>
                Rasterisering: {rasterizationMode}
              </button>
              {renderMode === "phong" && (
                <>
                  <button type="button" className="raster-profile-toggle"
                    onClick={() => setProfilingEnabled(previous => !previous)}>
                    Rasterprofil: {profilingEnabled ? "På" : "Av"}
                  </button>
                  <button type="button" className="raster-profile-toggle"
                    onClick={() => setLightingEnabled(previous => !previous)}
                    aria-pressed={lightingEnabled}>
                    Phong-belysning: {lightingEnabled ? "På" : "Av"}
                  </button>
                  {lightingEnabled && (
                    <button type="button" className="raster-profile-toggle"
                      onClick={() => setSpecularEnabled(previous => !previous)}
                      aria-pressed={specularEnabled}>
                      Spekulär belysning: {specularEnabled ? "På" : "Av"}
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="nurbs-metrics-grid">
              <div>Total rendering: {renderMetrics.frameTimeMs.toFixed(2)} ms</div>
              <div>Rasterisering: {renderMetrics.rasterTimeMs.toFixed(2)} ms</div>
              <div>Övrig rendering: {(renderMetrics.frameTimeMs - renderMetrics.rasterTimeMs).toFixed(2)} ms</div>
              <div>Teoretisk FPS: {renderMetrics.fps.toFixed(1)}</div>
              <div>Trianglar: {renderMetrics.triangleCount}</div>
              <div>Upplösning: {renderMetrics.width} × {renderMetrics.height}</div>
            </div>
            {renderMode === "phong" && renderMetrics.rasterProfile && (
              <div className="raster-profile">
                <div className="raster-profile-title">Rasterprofil</div>
                <div>Testade pixlar: {renderMetrics.rasterProfile.testedPixels.toLocaleString("sv-SE")}</div>
                <div>Inuti trianglar: {renderMetrics.rasterProfile.insidePixels.toLocaleString("sv-SE")}</div>
                <div>Djupförkastade: {renderMetrics.rasterProfile.depthRejectedPixels.toLocaleString("sv-SE")}</div>
                <div>Ljusberäknade: {renderMetrics.rasterProfile.shadedPixels.toLocaleString("sv-SE")}</div>
                <div>Täckningsgrad: {renderMetrics.rasterProfile.testedPixels > 0
                  ? (100 * renderMetrics.rasterProfile.insidePixels / renderMetrics.rasterProfile.testedPixels).toFixed(1)
                  : "0.0"}%</div>
              </div>
            )}
          </div>
        )}

        {renderMode === "phong" && (
          <div className="nurbs-benchmark-panels">
            <RasterBenchmarkPanel
              running={running}
              results={results}
              onStart={start}
            />
          </div>
        )}
      </section>
    </div>
  );
}
