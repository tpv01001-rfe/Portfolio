
import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type ExperimentDefinition = {
  title: string;
  description: string;
  icon: string;
  component: LazyExoticComponent<ComponentType>;
};

export const experimentRegistry = {
  nurbs: {
    title: "NURBS",
    description: "Experiment med NURBS-kurvor och ytor.",
    icon: "∿",
    component: lazy(() => import("./nurbs/Nurbs")),
  },
  "molecular-viewer": {
    title: "Molecular Viewer",
    description: "Interaktiv molekylvisualisering (som gamla Java-appleten).",
    icon: "⚛",
    component: lazy(() =>
      import("./molecular-viewer/MolecularViewer")
    ),
  },
} satisfies Record<string, ExperimentDefinition>;

export type ExperimentId = keyof typeof experimentRegistry;

export function isExperimentId(
  value: string
): value is ExperimentId {
  return Object.prototype.hasOwnProperty.call(
    experimentRegistry,
    value
  );
}

export const experimentItems = (
  Object.keys(experimentRegistry) as ExperimentId[]
).map(id => ({
  id,
  label: experimentRegistry[id].title,
  icon: experimentRegistry[id].icon,
}));
