import type { CompanyId } from "../data/companyTypes";
import {
  pointInPolygon,
  type Position,
} from "./pointInPolygon";

export function filterCompaniesByPolygon(
  geoData: GeoJSON.FeatureCollection,
  polygon: Position[]
): Set<CompanyId> {
  const matchingIds = new Set<CompanyId>();

  for (const feature of geoData.features) {
    if (feature.geometry?.type !== "Point") {
      continue;
    }

    const id = feature.properties?.id;

    if (id == null) {
      continue;
    }

    const [lng, lat] = feature.geometry.coordinates;

    if (pointInPolygon([lng, lat], polygon)) {
      matchingIds.add(String(id));
    }
  }

  return matchingIds;
}