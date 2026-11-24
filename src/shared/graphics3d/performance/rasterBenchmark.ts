
import type { RasterizationMode } from "../rasterizer";

export type BenchmarkSample = {
  totalMs: number;
  rasterMs: number;
};

export type BenchmarkStatistics = {
  count: number;
  median: number;
  p95: number;
  mean: number;
  max: number;
};

export type BenchmarkResult = {
  mode: RasterizationMode;
  total: BenchmarkStatistics;
  raster: BenchmarkStatistics;
};

export type BenchmarkPhase = {
  mode: RasterizationMode;
  warmup: boolean;
  frames: number;
};

export type BenchmarkSession = {
  phases: BenchmarkPhase[];
  phaseIndex: number;
  frameInPhase: number;
  samples: Record<RasterizationMode, BenchmarkSample[]>;
};

function calculateStatistics(
  values: number[]
): BenchmarkStatistics {
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;

  if (count === 0) {
    return { count: 0, median: 0, p95: 0, mean: 0, max: 0 };
  }

  const percentile = (p: number): number => {
    const index = (count - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;

    return (
      sorted[lower] * (1 - fraction) +
      sorted[upper] * fraction
    );
  };

  return {
    count,
    median: percentile(0.5),
    p95: percentile(0.95),
    mean: values.reduce((sum, value) => sum + value, 0) / count,
    max: sorted[count - 1],
  };
}

export function createBenchmarkSession(): BenchmarkSession {
  const phases: BenchmarkPhase[] = [
    { mode: "bounding-box", warmup: true, frames: 30 },
    { mode: "scanline", warmup: true, frames: 30 },
  ];

  // 10 omgångar med 20 mätningar per metod.
  for (let i = 0; i < 10; i++) {
    const modes: RasterizationMode[] =
      i % 2 === 0
        ? ["bounding-box", "scanline"]
        : ["scanline", "bounding-box"];

    for (const mode of modes) {
      phases.push({ mode, warmup: false, frames: 20 });
    }
  }

  return {
    phases,
    phaseIndex: 0,
    frameInPhase: 0,
    samples: {
      "bounding-box": [],
      scanline: [],
    },
  };
}

export function recordBenchmarkFrame(
  session: BenchmarkSession,
  sample: BenchmarkSample
): boolean {
  const phase = session.phases[session.phaseIndex];
  if (!phase) return true;

  if (!phase.warmup) {
    session.samples[phase.mode].push(sample);
  }

  session.frameInPhase++;

  if (session.frameInPhase >= phase.frames) {
    session.phaseIndex++;
    session.frameInPhase = 0;
  }

  return session.phaseIndex >= session.phases.length;
}

export function getBenchmarkResults(
  session: BenchmarkSession
): BenchmarkResult[] {
  const modes: RasterizationMode[] = [
    "bounding-box",
    "scanline",
  ];

  return modes.map((mode) => {
    const samples = session.samples[mode];

    return {
      mode,
      total: calculateStatistics(
        samples.map((sample) => sample.totalMs)
      ),
      raster: calculateStatistics(
        samples.map((sample) => sample.rasterMs)
      ),
    };
  });
}
