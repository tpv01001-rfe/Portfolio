import type { ReactNode } from "react";

import "./ProjectIntroduction.css";

export type ProjectStatus =
    | "planned"
    | "in-development"
    | "experimental"
    | "completed";

const projectStatusLabels: Record<ProjectStatus, string> = {
    planned: "Planerat",
    "in-development": "Under uppbyggnad",
    experimental: "Experimentellt",
    completed: "Färdigställt",
};

export interface ProjectIntroductionProps {
    readonly title: string;
    readonly eyebrow?: string;
    readonly subtitle?: string;
    readonly children: ReactNode;
    readonly image?: {
        readonly src: string;
        readonly alt: string;
        readonly caption?: string;
    };
    readonly topics?: readonly string[];
    readonly status?: ProjectStatus;
}



export function ProjectIntroduction({
    title,
    eyebrow,
    subtitle,
    children,
    image,
    topics,
    status,
}: ProjectIntroductionProps) {
    return (
        <section className="project-introduction">

            <header className="project-introduction__header">
                {eyebrow && (
                    <p className="project-introduction__eyebrow">
                        {eyebrow}
                    </p>
                )}

                <div className="project-introduction__title-row">

    <h1 className="project-introduction__title">
        {title}
    </h1>

    {status && (
        <span
            className="project-introduction__status"
            data-status={status}
        >
            <span
                className="project-introduction__status-dot"
                aria-hidden="true"
            />

            {projectStatusLabels[status]}
        </span>
    )}

</div>

                {subtitle && (
                    <p className="project-introduction__subtitle">
                        {subtitle}
                    </p>
                )}
            </header>

            <div
                className={
                    image
                        ? "project-introduction__body project-introduction__body--with-image"
                        : "project-introduction__body"
                }
            >
                <div className="project-introduction__content">
                    {children}
                </div>

                {image && (
                    <figure className="project-introduction__figure">
                        <img
                            src={image.src}
                            alt={image.alt}
                        />

                        {image.caption && (
                            <figcaption>
                                {image.caption}
                            </figcaption>
                        )}
                    </figure>
                )}
            </div>

            {topics && topics.length > 0 && (
                <div className="project-introduction__topics">
                    {topics.map((topic) => (
                        <span
                            key={topic}
                            className="project-introduction__topic"
                        >
                            {topic}
                        </span>
                    ))}
                </div>
            )}

        </section>
    );
}
