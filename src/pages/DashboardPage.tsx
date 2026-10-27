type DashboardPageProps = {
  onOpenCurveLab: () => void;
  onOpenChartsLab: () => void;
  onOpencompanyIntelligence: () => void;
};

type ToolCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
};

function ToolCard({
  title,
  description,
  actionLabel,
  onClick,
}: ToolCardProps) {
  return (
    <div className="dashboard-card dashboard-card--tool">
      <div className="dashboard-card__icon">◌</div>
      <h3 className="dashboard-card__title">{title}</h3>
      <p className="dashboard-card__description">{description}</p>

      <button
        type="button"
        className="dashboard-card__action"
        onClick={onClick}
      >
        {actionLabel}
      </button>
    </div>
  );
}

type FocusCardProps = {
  title: string;
  description: string;
};

function FocusCard({ title, description }: FocusCardProps) {
  return (
    <div className="dashboard-card dashboard-card--focus">
      <h3 className="dashboard-card__title">{title}</h3>
      <p className="dashboard-card__description">{description}</p>
    </div>
  );
}

export function DashboardPage({
  onOpenCurveLab,
  onOpenChartsLab,
  onOpencompanyIntelligence,
}: DashboardPageProps) {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-hero__eyebrow">&nbsp;</p>
        <h1 className="dashboard-hero__title">Min portfölj</h1>
        <p className="dashboard-hero__description">
          Ett urval av egna utvecklingsprojekt där jag utforskar teknik, visualisering och interaktiva lösningar.
        </p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Utforska projekten</h2>
          <p className="dashboard-section__description">
            Välj ett projekt för att se hur det fungerar och prova själv.
          </p>
        </div>

        <div className="dashboard-grid dashboard-grid--tools">
          <ToolCard
            title="Kurvlabb"
            description="Utforska parametriska kurvor och animationer genom att ändra parametrar och se resultatet direkt."
            actionLabel="Öppna projekt"
            onClick={onOpenCurveLab}
          />

          <ToolCard
            title="Diagramlabb"
            description="Interaktiva diagram med klickbara datapunkter, responsiv layout och återanvändbara komponenter."
            actionLabel="Öppna projekt"
            onClick={onOpenChartsLab}
          />

          <ToolCard
            title="Företagsanalys"
            description="Utforska företagsinformation på en interaktiv karta, filtrera företag och ta del av analyser och rapporter."
            actionLabel="Öppna projekt"
            onClick={onOpencompanyIntelligence}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Utvecklingsområden</h2>
          {/* <p className="dashboard-section__description">
            The main visual systems and interaction work in progress.
          </p> */}
        </div>

        <div className="dashboard-grid dashboard-grid--focus">
          <FocusCard
            title="Responsiv rendering"
            description="Anpassning av canvas, skalning och rendering för olika skärmstorlekar."
          />
          <FocusCard
            title="Diagramstruktur"
            description="Utveckling av återanvändbara komponenter för axlar, skalor, etiketter och datapunkter."
          />
          <FocusCard
            title="Interaktiva gränssnitt"
            description="Funktioner för markering, hovring, överlägg och direkt interaktion med visualiseringar."
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Idéer och vidareutveckling</h2>
          {/* <p className="dashboard-section__description">
            Likely next additions to the workspace.
          </p> */}
        </div>

        <div className="dashboard-grid dashboard-grid--focus">
          <FocusCard
            title="Panorering och zoomning"
            description="Mouse-based navigation for curve and chart surfaces."
          />
          <FocusCard
            title="Reusable Visual Primitives"
            description="Shared foundations for axes, labels, overlays, and interactive markers."
          />
          <FocusCard
            title="Diagram Tooling"
            description="Cleaner architecture for labels, legends, and click-driven detail views."
          />
        </div>
      </section>
    </div>
  );
}