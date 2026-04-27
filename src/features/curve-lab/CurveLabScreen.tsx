//undviker prop drilling
//
import { CurveLabProvider } from "./context/CurveLabContext";
import { CurveLabPage } from "../../pages/CurveLabPage";
import CurveCanvas from "./components/CurveCanvas";
import { Controls } from "./components/Controls";

export function CurveLabScreen() {
  return (
    <CurveLabProvider>
      <CurveLabPage
        canvas={<CurveCanvas />}
        controls={<Controls />}
      />
    </CurveLabProvider>
  );
}