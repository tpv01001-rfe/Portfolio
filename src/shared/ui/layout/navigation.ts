
import {
  experimentItems,
  experimentRegistry,
  type ExperimentId,
} from "../../../features/experiments/experimentRegistry";

export type MainView =
  | "overview"
  | "curve-lab"
  | "charts-lab"
  | "company-intelligence";

export type ActiveView = MainView | ExperimentId;

export type NavigationItem = {
  type: "item";
  id: ActiveView;
  label: string;
  icon: string;
};

export type NavigationGroup = {
  type: "group";
  id: string;
  label: string;
  icon: string;
  children: NavigationItem[];
};

export type NavigationEntry =
  | NavigationItem
  | NavigationGroup;

export const defaultView: ActiveView = "overview";

export const navItems: NavigationEntry[] = [
  {
    type: "item",
    id: "overview",
    label: "Översikt",
    icon: "◧",
  },
  {
    type: "item",
    id: "curve-lab",
    label: "Kurvlabb",
    icon: "∿",
  },
  {
    type: "item",
    id: "charts-lab",
    label: "Diagramlabb",
    icon: "⋮",
  },
  {
    type: "item",
    id: "company-intelligence",
    label: "Företagsanalys",
    icon: "⌖",
  },
  {
    type: "group",
    id: "experiments",
    label: "Tester och experiment",
    icon: "◇",
    children: experimentItems.map(item => ({
      type: "item",
      ...item,
    })),
  },
];

export function getViewTitle(view: ActiveView): string {
  if (view in experimentRegistry) {
    return experimentRegistry[view as ExperimentId].title;
  }

  switch (view) {
    case "overview":
      return "Översikt";
    case "curve-lab":
      return "Kurvlabb";
    case "charts-lab":
      return "Diagramlabb";
    case "company-intelligence":
      return "Företagsanalys";
    default:
      return "Workspace";
  }
}
