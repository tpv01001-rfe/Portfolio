import ButtonControl from "../../../shared/ui/controls/ButtonControl";
import SliderControl from "../../../shared/ui/controls/SliderControl";
import CheckboxControl from "../../../shared/ui/controls/CheckboxControl";
import { SelectControl } from "../../../shared/ui/controls/SelectControl";
import { Workspace } from "../../../shared/ui/workspace/Workspace";
import { ToolBar } from "../../../shared/ui/workspace/ToolBar";
import { SplitView } from "../../../shared/ui/workspace/SplitView";
import { Viewport } from "../../../shared/ui/workspace/Viewport";
import "./Odontograph.css";
import { createReferenceWheel, periodicSpacing } from "../model/patternGenerators";
import { applyToothPattern } from "../model/toothPattern";
import { quaternionFromAxisAngle } from "../../../shared/math/quaternion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Canvas3D, type Canvas3DFrame } from "../../../shared/graphics3d/Canvas3D";
import { createCamera3D } from "../../../shared/graphics3d/camera";
import { createOrbitController } from "../../../shared/graphics3d/orbitController";
import { Renderer3D } from "../../../shared/graphics3d/renderer3D";
import type { TriangleMesh } from "../../../shared/geometry/triangleMesh";
import { createWheelMesh } from "../geometry/createWheelMesh";
import {
  brassMaterial,
  createWheelContourPaths,
} from "../geometry/wheelAppearance";
import type { ContourPath3D } from "../../../shared/graphics3d/depthTestedContours";
import { familyProfiles, type FlankProfile } from "../geometry/wheelProfile";
import {
  TAU,
  copyPatternWheel,
  createDemoPatternWheel,
  lowerTeethInRange,
  type WheelFamily,
} from "../model/patternWheel";
import { WheelViewer2D } from "./WheelViewer2D";

interface WheelViewerProps {
  readonly title: string;
  readonly mesh: TriangleMesh;
  readonly contourPaths: readonly ContourPath3D[];
}

function WheelViewer({
  title,
  mesh,
  contourPaths,
}: WheelViewerProps) {
  const [renderer] = useState(() => new Renderer3D());
  const [camera] = useState(() => {
    const instance = createCamera3D();
    instance.distance = 24;
    instance.near = 0.1;
    const rotation = quaternionFromAxisAngle({ x: 1, y: 1, z: 0 }, Math.PI / 6);
    if (rotation) instance.rotation = rotation;
    return instance;
  });

  useEffect(() => () => renderer.dispose(), [renderer]);

  const handleCanvasReady = useCallback(
    (canvas: HTMLCanvasElement) => createOrbitController(canvas, camera, {
      minDistance: 15,
      maxDistance: 120,
      enableInertia: true,
    }),
    [camera],
  );

  const render = useCallback(
    (frame: Canvas3DFrame) => {
      renderer.render(frame, mesh, camera, {
        renderMode: "phong",
        profilingEnabled: false,
        lightingEnabled: true,
        specularEnabled: true,
        rasterizationMode: "bounding-box",
        surfaceMaterial: brassMaterial,
        contourPaths,
      });
    },
    [renderer, mesh, camera, contourPaths],
  );

  return (
    <Viewport title={title} footer={`${mesh.triangles.length.toLocaleString("sv-SE")} trianglar · Rotera / zooma`}>
      <Canvas3D onCanvasReady={handleCanvasReady} render={render} />
    </Viewport>
  );
}

export default function Odontograph() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [original] = useState(() => createReferenceWheel(createDemoPatternWheel()));
  const [lowerHalf, setLowerHalf] = useState(false);
  const [mode, setMode] = useState<"reference" | "periodic">("reference");
  const [positionCount, setPositionCount] = useState(36);
  const [topSpan, setTopSpan] = useState(2);
  const [bottomSpan, setBottomSpan] = useState(1);
  const [family, setFamily] = useState<WheelFamily>("richter");
  type EditableProfile = FlankProfile & {
    readonly firstFlankCurvatureMm: number;
    readonly secondFlankCurvatureMm: number;
  };

  // Familjens gemensamma kurvatur används som startvärde för båda flankerna.
  const createEditableProfile = (nextFamily: WheelFamily): EditableProfile => ({
    ...familyProfiles[nextFamily],
    firstFlankCurvatureMm: familyProfiles[nextFamily].flankCurvatureMm,
    secondFlankCurvatureMm: familyProfiles[nextFamily].flankCurvatureMm,
  });

  const [profile, setProfile] = useState<EditableProfile>(() => createEditableProfile("richter"));

  const styledOriginal = useMemo(() => ({
    ...original,
    family,
    toothGeometry: {
      tipOffsetMm: profile.tipOffsetMm,
      tipWidthMm: profile.tipWidthMm,
      flankCurvatureMm: profile.flankCurvatureMm,
      firstFlankCurvatureMm: profile.firstFlankCurvatureMm,
      secondFlankCurvatureMm: profile.secondFlankCurvatureMm,
    },
  }), [original, family, profile]);

  const modified = useMemo(() => {
    const copy = copyPatternWheel(
      styledOriginal,
      `${family}-demo-modified`,
      `${family} – modifierat demonstrationshjul`,
    );

    return copy;
  }, [styledOriginal, family]);

  // Samma konstruktion används av båda vyerna.
  const construction = useMemo(() => {
    try {
      let wheel = mode === "reference" ? modified : applyToothPattern(
        modified, periodicSpacing(positionCount, topSpan, bottomSpan), 36
      );
      if (lowerHalf) wheel = lowerTeethInRange(wheel, Math.PI, TAU);
      return { wheel, error: null };
    } catch (error) {
      return {
        wheel: null,
        error: error instanceof Error ? error.message : "Okänt konstruktionsfel",
      };
    }
  }, [modified, mode, positionCount, topSpan, bottomSpan, lowerHalf]);

  // Ett trianguleringsfel får inte hindra 2D-vyn.
  const meshes = useMemo(() => {
    if (!construction.wheel) {
      return { modified: null, modifiedContours: null, error: null };
    }
    try {
      return {
        modified: createWheelMesh(construction.wheel),
        modifiedContours: createWheelContourPaths(construction.wheel),
        error: null,
      };
    } catch (error) {
      return {
        modified: null,
        modifiedContours: null,
        error: error instanceof Error ? error.message : "Okänt geometrifel",
      };
    }
  }, [construction]);

  const updateProfile = (key: "tipOffsetMm" | "tipWidthMm" | "firstFlankCurvatureMm" | "secondFlankCurvatureMm", value: number) => {
    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));
  };


  const changeFamily = (nextFamily: WheelFamily) => {
    setFamily(nextFamily);
    setProfile(createEditableProfile(nextFamily));
  };

  const tools = [
    { id: "construction", label: "Konstruktion", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#202e3b"/><circle cx="15" cy="12" r="2" fill="#202e3b"/><circle cx="8" cy="18" r="2" fill="#202e3b"/></svg> },
    { id: "profile", label: "Taggens form", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 19 Q8 2 12 7 T21 19"/><circle cx="3" cy="19" r="1.5"/><circle cx="21" cy="19" r="1.5"/></svg> },
  ];

  return (
    <div className="odontograph-workspace">
      <h2>Odontograf – fria taggkonturer</h2>
      <div className="odontograph-settings">
        <SelectControl<WheelFamily>
          label="Taggprofil"
          value={family}
          options={[
            { value: "richter", label: "Richter – symmetrisk" },
            { value: "haff", label: "Haff – rundad" },
            { value: "riefler", label: "Riefler – bakåtlutad, moturs" },
            { value: "custom", label: "Custom" },
          ]}
          onChange={changeFamily}
        />
        <CheckboxControl
          label="Sänk upphöjda partier på halva hjulet"
          checked={lowerHalf}
          onChange={setLowerHalf}
        />
      </div>

      <Workspace
        toolbar={<ToolBar tools={tools} activeTool={activeTool} onToolChange={setActiveTool} />}
        panel={activeTool && (
          <div className="odontograph-tool">
            <header>
              <strong>{activeTool === "construction" ? "Konstruktion" : "Taggens form"}</strong>
              <ButtonControl variant="ghost" aria-label="Stäng verktyg" onClick={() => setActiveTool(null)}>×</ButtonControl>
            </header>
            {activeTool === "construction" ? (
              <div className="odontograph-tool__content">

                <div style={{ display: "grid", gap: 12 }}>
                  <ButtonControl variant="toggle" active={mode === "reference"} onClick={() => { setMode("reference"); setLowerHalf(false); }}>
                    Referenshjul – 36 taggar
                  </ButtonControl>
                  <ButtonControl variant="toggle" active={mode === "periodic"} onClick={() => { setMode("periodic"); setLowerHalf(false); }}>
                    Periodic spacing
                  </ButtonControl>
                </div>
                {mode === "periodic" && (
                  <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    {([
                      ["Grundpositioner", positionCount, setPositionCount],
                      ["Topp", topSpan, setTopSpan],
                      ["Dal", bottomSpan, setBottomSpan],
                    ] as const).map(([label, value, setter]) => (
                      <SliderControl
                        key={label}
                        label={label}
                        value={value}
                        min={1}
                        max={label === "Grundpositioner" ? 120 : 36}
                        step={1}
                        onChange={setter}
                      />
                    ))}
                    <ButtonControl onClick={() => setBottomSpan(topSpan)}>Equal spacing</ButtonControl>
                    <p>Referens: 36 · Toppvinkel: {(360 * topSpan / positionCount).toFixed(2)}°</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="odontograph-tool__content">

                <div style={{ display: "grid", gap: 12 }}>
                  <SliderControl
                    formatValue={(value) => `${value.toFixed(2)} mm`}
                    label="Spetsförskjutning"
                    value={profile.tipOffsetMm}
                    min={-3}
                    max={3}
                    step={0.01}
                    onChange={(value) => updateProfile("tipOffsetMm", value)}
                  />
                  <SliderControl
                    formatValue={(value) => `${value.toFixed(2)} mm`}
                    label="Spetsbredd"
                    value={profile.tipWidthMm}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(value) => updateProfile("tipWidthMm", value)}
                  />
                  <SliderControl
                    formatValue={(value) => `${value.toFixed(2)} mm`}
                    label="Första flankens kurvatur"
                    value={profile.firstFlankCurvatureMm}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onChange={(value) => updateProfile("firstFlankCurvatureMm", value)}
                  />
                  <SliderControl
                    formatValue={(value) => `${value.toFixed(2)} mm`}
                    label="Andra flankens kurvatur"
                    value={profile.secondFlankCurvatureMm}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onChange={(value) => updateProfile("secondFlankCurvatureMm", value)}
                  />
                  <ButtonControl onClick={() => setProfile(createEditableProfile(family))}>
                    Återställ profil
                  </ButtonControl>
                </div>
              </div>
            )}
          </div>
        )}
      >
        <SplitView initialRatio={0.55}
          first={meshes.modified && meshes.modifiedContours ? (
            <WheelViewer title="3D · Perspektiv" mesh={meshes.modified} contourPaths={meshes.modifiedContours} />
          ) : <Viewport title="3D · Perspektiv"><p className="odontograph-empty">Ingen giltig 3D-modell.</p></Viewport>}
          second={construction.wheel ? (
            <WheelViewer2D wheel={construction.wheel} title="2D · Konstruktion" />
          ) : <Viewport title="2D · Konstruktion"><p className="odontograph-empty">Ingen giltig konstruktion.</p></Viewport>}
        />
      </Workspace>
      {construction.error && (
        <p role="alert" style={{ color: "#ffb6a8" }}>
          Konstruktionen är ogiltig: {construction.error}
        </p>
      )}

      {meshes.error && (
        <p role="alert" style={{ color: "#ffb6a8" }}>
          3D-modellen kan inte genereras: {meshes.error}
        </p>
      )}

      <p className="odontograph-note">Båda vyerna visar den aktuella konstruktionen. Förinställningarna är illustrativa, inte uppmätta historiska profiler.</p>
    </div>
  );
}
