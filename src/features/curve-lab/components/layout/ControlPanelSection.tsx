import type { ReactNode } from "react";

type ControlPanelSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function ControlPanelSection({
  title,
  description,
  children,
}: ControlPanelSectionProps) {
  return (
    <section className="control-panel-section">
      <div className="control-panel-section__header">
        <h3 className="control-panel-section__title">{title}</h3>

        {description && (
          <p className="control-panel-section__description">
            {description}
          </p>
        )}
      </div>

      <div className="control-panel-section__content">{children}</div>
    </section>
  );
}