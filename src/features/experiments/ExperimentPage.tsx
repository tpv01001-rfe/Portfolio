
import { Suspense } from "react";
import {
  experimentRegistry,
  type ExperimentId,
} from "./experimentRegistry";

type ExperimentPageProps = {
  experimentId: ExperimentId;
};

export function ExperimentPage({
  experimentId,
}: ExperimentPageProps) {
  const experiment = experimentRegistry[experimentId];
  const Component = experiment.component;

  return (
    <section className="experiment-page">
      <header className="experiment-page__header">
        <h2>{experiment.title}</h2>
        <p>{experiment.description}</p>
      </header>

      <Suspense fallback={<p>Laddar experiment...</p>}>
        <Component />
      </Suspense>
    </section>
  );
}
