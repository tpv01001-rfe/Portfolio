import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import "./Nurbs.css";
import { Canvas3D, type Canvas3DFrame } from "../../../shared/graphics3d/Canvas3D";
import { createCamera3D } from "../../../shared/graphics3d/camera";
import { createOrbitController } from "../../../shared/graphics3d/orbitController";
import { Renderer3D, type RenderMode3D } from "../../../shared/graphics3d/renderer3D";
import type { RasterizationMode } from "../../../shared/graphics3d/rasterizer";
import { createRenderMetrics, type RenderMetrics } from "../../../shared/graphics3d/performance/renderMetrics";
import { createDemoSurface } from "./geometry/createDemoSurface";
import { tessellateNurbsSurface } from "../../../shared/geometry/nurbs/tessellateNurbsSurface";
import { useRasterBenchmark } from "./useRasterBenchmark";
import { RasterBenchmarkPanel } from "./RasterBenchmarkPanel";

export default function Nurbs() {
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
  const [renderer] = useState(() => new Renderer3D());
  useEffect(() => () => renderer.dispose(), [renderer]);
  // Kameran skapas en gång.
  // Controllern ändrar objektets egenskaper
  // utan att React behöver rendera om.
  const [camera] = useState(() => {
    const camera = createCamera3D();

    camera.distance = 200;

    return camera;
  });

  const [renderMode, setRenderMode] = useState<
    RenderMode3D
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


  const render = useCallback(({ ctx, size, deltaTime }: Canvas3DFrame) => {
    const frameStart = performance.now();
    const activeRasterizationMode = getActiveMode(rasterizationMode);
    const result = renderer.render(
      { ctx, size, deltaTime }, mesh, camera,
      { renderMode, profilingEnabled, lightingEnabled, specularEnabled,
        rasterizationMode: activeRasterizationMode },
    );
    // Wireframe räknas också in i prestandamätningen.
    const frameEnd = performance.now();
    const frameTimeMs = frameEnd - frameStart;
    recordFrame(frameTimeMs, result.rasterTimeMs);
    if (frameEnd - lastMetricsUpdateRef.current >= 250) {
      lastMetricsUpdateRef.current = frameEnd;
      setRenderMetrics(createRenderMetrics(
        frameTimeMs, mesh.triangles.length, result.width, result.height,
        result.rasterProfile, result.rasterTimeMs,
      ));
    }
  }, [renderer, camera, mesh, renderMode, profilingEnabled,
    lightingEnabled, specularEnabled, rasterizationMode, getActiveMode, recordFrame]);

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
