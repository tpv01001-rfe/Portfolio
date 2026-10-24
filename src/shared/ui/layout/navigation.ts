export type ActiveView = "overview" | "curve-lab" | "charts-lab" | "company-intelligence";

export const defaultView: ActiveView = "overview";

export const getViewTitle = (view: ActiveView): string => {
  switch (view) {
    case "overview":
      return "Overview";
    case "curve-lab":
      return "Curve Lab";
    case "charts-lab":
      return "Charts Lab";
    case "company-intelligence":
      return "Company Intelligence";
    default:
      return "Workspace";
  }
};

export const navItems: Array<{
  id: ActiveView;
  label: string;
}> = [
  { id: "overview", label: "Overview" },
  { id: "curve-lab", label: "Curve Lab" },
  { id: "charts-lab", label: "Charts Lab" },
  { id: "company-intelligence", label: "Company Intelligence" },
];