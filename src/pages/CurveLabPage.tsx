import type { ReactNode } from "react";

type CurveLabPageProps = {
  canvas: ReactNode;
  controls: ReactNode;
};

export function CurveLabPage({ canvas, controls }: CurveLabPageProps) {
  return (
    <div className="curve-lab-page">
      <section className="curve-lab-page__hero">
        <div>
          <p className="curve-lab-page__eyebrow">Curve Module</p>
          <h1 className="curve-lab-page__title">Curve Lab</h1>
        </div>

        <div className="curve-lab-page__status">
          Sticky canvas + modular controls preserved inside the dashboard shell.
        </div>
      </section>

      <section className="curve-lab-page__layout">
        <div className="curve-lab-page__canvas">{canvas}</div>
        <aside className="curve-lab-page__controls">{controls}</aside>
      </section>
    </div>
  );
}