import type { BenchmarkResult } from "../../../shared/graphics3d/performance/rasterBenchmark";

type Props = {
  running: boolean;
  results: BenchmarkResult[] | null;
  onStart: () => void;
  disabled?: boolean;
};

const rows = [
  ["Raster median", "raster", "median"],
  ["Raster P95", "raster", "p95"],
  ["Raster medel", "raster", "mean"],
  ["Raster max", "raster", "max"],
  ["Total median", "total", "median"],
  ["Total P95", "total", "p95"],
] as const;

/** Presentationskomponent: kan användas av andra renderare med samma benchmarkresultat. */
export function RasterBenchmarkPanel({ running, results, onStart, disabled }: Props) {
  return (
    <div className="raster-benchmark">
      <button
        type="button"
        className="raster-profile-toggle"
        onClick={onStart}
        disabled={running || disabled}
      >
        {running ? "Benchmark pågår..." : "Starta benchmark"}
      </button>

      {results && (
        <div className="raster-benchmark-results">
          <strong>Benchmarkresultat</strong>
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Mätvärde</th>
                <th>Bounding box</th>
                <th>Scanline</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, category, metric]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {results.map((result) => (
                    <td key={result.mode}>
                      {result[category][metric].toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
