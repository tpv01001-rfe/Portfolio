type DashboardPageProps = {
  onOpenCurveLab: () => void;
  onOpenChartsLab: () => void;
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
}: DashboardPageProps) {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-hero__eyebrow">Overview</p>
        <h1 className="dashboard-hero__title">Portfolio</h1>
        <p className="dashboard-hero__description">
          A modular environment for various experiments.
        </p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Active Tools</h2>
          <p className="dashboard-section__description">
            Open the tools you are actively building and refining.
          </p>
        </div>

        <div className="dashboard-grid dashboard-grid--tools">
          <ToolCard
            title="Curve Lab"
            description="Explore parametric curves, animation, responsive canvas behavior, and overlays."
            actionLabel="Open tool"
            onClick={onOpenCurveLab}
          />

          <ToolCard
            title="Charts Lab"
            description="Build interactive XY and pie diagrams with axes, labels, click areas, and reusable chart structure."
            actionLabel="Open tool"
            onClick={onOpenChartsLab}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Current Focus</h2>
          <p className="dashboard-section__description">
            The main visual systems and interaction work in progress.
          </p>
        </div>

        <div className="dashboard-grid dashboard-grid--focus">
          <FocusCard
            title="Responsive Rendering"
            description="Stabilizing canvas layout, scaling, and rendering behavior across tool surfaces."
          />
          <FocusCard
            title="Chart Structure"
            description="Improving axes, labels, tick layout, and reusable plotting primitives."
          />
          <FocusCard
            title="Interactive Surfaces"
            description="Preparing for mouse interaction, overlays, hover states, and direct manipulation."
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">Next Experiments</h2>
          <p className="dashboard-section__description">
            Likely next additions to the workspace.
          </p>
        </div>

        <div className="dashboard-grid dashboard-grid--focus">
          <FocusCard
            title="Pan and Zoom"
            description="Mouse-based navigation for curve and chart surfaces."
          />
          <FocusCard
            title="Reusable Visual Primitives"
            description="Shared foundations for axes, labels, overlays, and interactive markers."
          />
          <FocusCard
            title="Diagram Tooling"
            description="Cleaner architecture for imagemaps, labels, and click-driven detail views."
          />
        </div>
      </section>
    </div>
  );
}