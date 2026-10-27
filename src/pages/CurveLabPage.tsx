import type { ReactNode } from "react";

type CurveLabPageProps = {
  canvas: ReactNode;
  controls: ReactNode;
};

export function CurveLabPage({ canvas, controls }: CurveLabPageProps) {
  return (
    <div className="curve-lab-page">
      <section className="dashboard-hero">
        <p className="dashboard-hero__eyebrow">Interaktiv visualisering</p>
        <h1 className="dashboard-hero__title">Kurvlabb</h1>
        <p className="dashboard-hero__description">
          Experimentera med matematiska kurvor och se hur deras form förändras när parametrarna justeras.
        </p>
      </section><br />

      <section className="curve-lab-page__layout">
        <div className="curve-lab-page__canvas">{canvas}</div>
        <aside className="curve-lab-page__controls">{controls}</aside>
      </section>
    </div>
  );
}