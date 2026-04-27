import { Controls } from "./components/Controls";
import CurveCanvas from "./components/CurveCanvas";
import { CurveLabPage } from "../../pages/CurveLabPage";


export function CurveLabModule() {
  return (
    <CurveLabPage
      canvas={<CurveCanvas />}
      controls={<Controls />}
    />
  );
}