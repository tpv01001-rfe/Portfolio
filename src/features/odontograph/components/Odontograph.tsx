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
    instance.distance = 32;
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
    <section style={{ minWidth: 0, flex: "1 1 300px" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>{title}</h3>
      <div style={{ height: 340, background: "#101820", borderRadius: 10, overflow: "hidden" }}>
        <Canvas3D onCanvasReady={handleCanvasReady} render={render} />
      </div>
      <p style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>
        {mesh.triangles.length.toLocaleString("sv-SE")} trianglar · Dra för att rotera, scrolla för att zooma
      </p>
    </section>
  );
}

// interface ProfileSliderProps {
//   readonly id: string;
//   readonly label: string;
//   readonly value: number;
//   readonly min: number;
//   readonly max: number;
//   readonly step: number;
//   readonly onChange: (value: number) => void;
// }

// function ProfileSlider({
//   id,
//   label,
//   value,
//   min,
//   max,
//   step,
//   onChange,
// }: ProfileSliderProps) {
//   return (
//     <label htmlFor={id} style={{ display: "grid", gap: 5, minWidth: 195 }}>
//       <span>{label}: <strong>{value.toFixed(2)} mm</strong></span>
//       <input
//         id={id}
//         type="range"
//         min={min}
//         max={max}
//         step={step}
//         value={value}
//         onChange={(event) => onChange(Number(event.target.value))}
//       />
//     </label>
//   );
// }

export default function Odontograph() {
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

  // Ogiltiga extrema former ska visas som ett fel, inte krascha hela sidan.
  const meshes = useMemo(() => {
    try {
      let wheel = mode === "reference" ? modified : applyToothPattern(
        modified, periodicSpacing(positionCount, topSpan, bottomSpan), 36
      );
      if (lowerHalf) wheel = lowerTeethInRange(wheel, Math.PI, TAU);
      return {
        modified: createWheelMesh(wheel),
        modifiedContours: createWheelContourPaths(wheel),
        error: null as string | null,
      };
    } catch (error) {
      return {
        modified: null,
        modifiedContours: null,
        error: error instanceof Error ? error.message : "Okänt geometrifel",
      };
    }
  }, [modified, mode, positionCount, topSpan, bottomSpan, lowerHalf]);

  // const updateProfile = (key: "tipOffsetMm" | "tipWidthMm" | "firstFlankCurvatureMm" | "secondFlankCurvatureMm", value: number) => {
  //   setProfile((previous) => ({
  //     ...previous,
  //     [key]: value,
  //   }));
  // };

  const changeFamily = (nextFamily: WheelFamily) => {
    setFamily(nextFamily);
    setProfile(createEditableProfile(nextFamily));
  };

  return (
    <div style={{ padding: 20, color: "#e4edf3", background: "#111923", minHeight: "100%" }}>
      <h2 style={{ marginTop: 0 }}>Odontografen – fria taggkonturer</h2>
      <p style={{ maxWidth: 820, opacity: 0.8 }}>
        Undersök mönsterhjulets geometri och finjustera taggarnas tangentiella
        förskjutning, spetsbredd och rundning i 2D och 3D.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <label htmlFor="wheel-family">Taggprofil</label>
        <select
          id="wheel-family"
          value={family}
          onChange={(event) => changeFamily(event.target.value as WheelFamily)}
        >
          <option value="richter">Richter – symmetrisk</option>
          <option value="haff">Haff – rundad</option>
          <option value="riefler">Riefler – bakåtlutad, moturs</option>
          <option value="custom">Custom</option>
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={lowerHalf}
            onChange={(event) => setLowerHalf(event.target.checked)}
          />
          Sänk upphöjda partier på halva hjulet
        </label>
      </div>

      <section style={{ border: "1px solid #394553", padding: 16, borderRadius: 10, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Konstruktionsverktyg</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <button type="button" onClick={() => { setMode("reference"); setLowerHalf(false); }}>
            Referenshjul – 36 taggar
          </button>
          <button type="button" onClick={() => { setMode("periodic"); setLowerHalf(false); }}>
            Periodic spacing
          </button>
        </div>
        {mode === "periodic" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
            {([
              ["Grundpositioner", positionCount, setPositionCount],
              ["Topp", topSpan, setTopSpan],
              ["Dal", bottomSpan, setBottomSpan],
            ] as const).map(([label, value, setter]) => (
              <label key={label} style={{ display: "grid", gap: 6 }}>
                {label}: {value}
                <input type="range" min={1} max={label === "Grundpositioner" ? 120 : 36}
                  step={1} value={value} onChange={event => setter(Number(event.target.value))} />
              </label>
            ))}
            <button type="button" onClick={() => setBottomSpan(topSpan)}>Equal spacing</button>
            <p>Referens: 36 · Toppvinkel: {(360 * topSpan / positionCount).toFixed(2)}°</p>
          </div>
        )}
      </section>

      {/* <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 22 }}>
        <ProfileSlider
          id="tip-offset"
          label="Spetsförskjutning"
          value={profile.tipOffsetMm}
          min={-3}
          max={3}
          step={0.01}
          onChange={(value) => updateProfile("tipOffsetMm", value)}
        />
        <ProfileSlider
          id="tip-width"
          label="Spetsbredd"
          value={profile.tipWidthMm}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => updateProfile("tipWidthMm", value)}
        />
        <ProfileSlider
          id="first-flank-curvature"
          label="Första flankens kurvatur"
          value={profile.firstFlankCurvatureMm}
          min={0}
          max={0.5}
          step={0.01}
          onChange={(value) => updateProfile("firstFlankCurvatureMm", value)}
        />
        <ProfileSlider
          id="second-flank-curvature"
          label="Andra flankens kurvatur"
          value={profile.secondFlankCurvatureMm}
          min={0}
          max={0.5}
          step={0.01}
          onChange={(value) => updateProfile("secondFlankCurvatureMm", value)}
        />
        <button type="button" onClick={() => setProfile(createEditableProfile(family))}>
          Återställ profil
        </button>
      </div> */}

      {meshes.error && (
        <p role="alert" style={{ color: "#ffb6a8" }}>
          Konturen kan inte genereras: {meshes.error}
        </p>
      )}

      {meshes.modified && meshes.modifiedContours && (
        <div style={{ display: "flex", minWidth: 0 }}>
          <WheelViewer
            title="Modifierad kopia"
            mesh={meshes.modified}
            contourPaths={meshes.modifiedContours}
          />
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <WheelViewer2D wheel={styledOriginal} title="2D-profil – originalmönster" />
      </div>

      <p style={{ maxWidth: 820, opacity: 0.7, fontSize: 13 }}>
        Reglagen påverkar taggformen i båda vyerna. 2D-vyn visar originalmönstret,
        medan 3D-vyn visar den modifierade kopian.
        Förinställningarna är illustrativa, inte uppmätta historiska profiler.
      </p>
    </div>
  );
}
