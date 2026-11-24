import type { ReactNode } from "react";
import Odontograph from "../features/odontograph/components/Odontograph";


export function OdontographPage() {
  return (
    <div className="dashboard-page">
          <section className="dashboard-hero">
            <p className="dashboard-hero__eyebrow">
              Mönsterhjul.
            </p>
    
            <h1 className="dashboard-hero__title">
              Odontograph
            </h1>
    
            <p className="dashboard-hero__description">
              Visa mönsterhjulets genererade linjer.
            </p>
          </section>
    
          <section className="dashboard-section">
            <Odontograph />
          </section>
        </div>
  );
}