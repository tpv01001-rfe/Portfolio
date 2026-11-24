import { useCallback, useRef, useState } from "react";
import {
  createBenchmarkSession,
  recordBenchmarkFrame,
  getBenchmarkResults,
  type BenchmarkSession,
  type BenchmarkResult,
} from "../../../shared/graphics3d/performance/rasterBenchmark";

/** Återanvänder befintlig benchmarkmotor utan att ändra mätmetoden. */
export function useRasterBenchmark() {
  const sessionRef = useRef<BenchmarkSession | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);

  const start = useCallback(() => {
    if (sessionRef.current) return;
    setResults(null);
    sessionRef.current = createBenchmarkSession();
    setRunning(true);
  }, []);

  // Läs aktuell fas direkt från ref: renderloopen behöver inte rendera om React.
  const getActiveMode = useCallback((fallback: "bounding-box" | "scanline") => {
    const session = sessionRef.current;
    return session?.phases[session.phaseIndex]?.mode ?? fallback;
  }, []);

  const recordFrame = useCallback((totalMs: number, rasterMs: number) => {
    const session = sessionRef.current;
    if (!session) return;
    const finished = recordBenchmarkFrame(session, { totalMs, rasterMs });
    if (finished) {
      sessionRef.current = null;
      setResults(getBenchmarkResults(session));
      setRunning(false);
    }
  }, []);

  return { running, results, start, getActiveMode, recordFrame };
}
