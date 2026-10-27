export type ActiveView = "overview" | "curve-lab" | "charts-lab" | "company-intelligence";

export const defaultView: ActiveView = "overview";

export const getViewTitle = (view: ActiveView): string => {
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
};

export const navItems: Array<{
  id: ActiveView;
  label: string;
}> = [
  { id: "overview", label: "Översikt" },
  { id: "curve-lab", label: "Kurvlabb" },
  { id: "charts-lab", label: "Diagramlabb" },
  { id: "company-intelligence", label: "Företagsanalys" },
];