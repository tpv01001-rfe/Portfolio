import { CompanyExplorer } from
  "../features/company-intelligence/components/CompanyExplorer";

export function CompanyIntelligencePage() {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-hero__eyebrow">
          Företagsinformation och analys
        </p>

        <h1 className="dashboard-hero__title">
          Företagsanalys
        </h1>

        <p className="dashboard-hero__description">
          Utforska företagsdata på en interaktiv karta.
          Filtrera företag, undersök deras verksamheter
          och ta del av analyser och rapporter.
        </p>
      </section>

      <section className="dashboard-section">
        <CompanyExplorer />
      </section>
    </div>
  );
}