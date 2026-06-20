import { useState } from "react";
import { pieDatasets } from "../pie/pieDatasets";
import DatasetPicker from "../components/DatasetPicker";
import { chartPalettes } from "../common/palettes";


export default function PieChartLab() {

  const [selectedDatasetId, setSelectedDatasetId] = useState(
    pieDatasets[0]?.id ?? ""
  );

  // const activeDataset =
  //   pieDatasets.find((dataset) => dataset.id === selectedDatasetId) ??
  //   pieDatasets[0];

  const [selectedPaletteId, setSelectedPaletteId] = useState("default");


  return (
    <>
      <div className="charts-lab-toolbar">
        <div className="charts-lab-toolbar__left">
          <DatasetPicker
            datasets={pieDatasets}
            value={selectedDatasetId}
            onChange={setSelectedDatasetId}
          />
        </div>
        <select
          value={selectedPaletteId}
          onChange={(event) =>
            setSelectedPaletteId(event.target.value)
          }
        >
          {chartPalettes.map((palette) => (
            <option
              key={palette.id}
              value={palette.id}
            >
              {palette.label}
            </option>
          ))}
        </select>

      </div>
      <div>
        <label>Pågående</label>
      </div>

    </>
  );

}
