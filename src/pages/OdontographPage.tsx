import { ProjectIntroduction } from
    "../shared/ui/layout/ProjectIntroduction";

import Odontograph from "../features/odontograph/components/Odontograph";


import patternWheelsImage from
    "../assets/odontograph/pattern-wheels.jpg";

export function OdontographPage() {
    return (
        <div className="dashboard-page">

            <ProjectIntroduction
                eyebrow="Historiska instrument / Geometrisk modellering"
                title="Odontograf"
                subtitle="Från historiska mönsterhjul till digitala modeller"
                status="in-development"
                image={{
                    src: patternWheelsImage,
                    alt: "Historiska mönsterhjul i mässing",
                    caption: "Två odontografer och mönsterhjul",
                }}
                topics={[
                    "Parametrisk geometri",
                    "Bézierkurvor",
                    "2D-visualisering",
                    "3D-rendering",
                ]}
            >
                <p>
                    Odontograf är ett experimentellt projekt
                    där historiska mönsterhjul återskapas och
                    undersöks med hjälp av modern geometrisk
                    modellering.
                </p>

                <p>
                    Genom parametriska taggprofiler,
                    Bézierkurvor och interaktiv visualisering
                    i två och tre dimensioner kan hjulens
                    konstruktion och skrivmönster studeras.
                </p>

                <p>
                    Projektet utvecklas successivt med
                    ambitionen att kunna konstruera och
                    modifiera mönsterhjul digitalt.
                </p>
            </ProjectIntroduction>

            <section className="dashboard-section">
                <Odontograph />
            </section>

        </div>
    );
}

