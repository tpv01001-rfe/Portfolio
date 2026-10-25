export interface MarkerPosition {
  id: string;
  lat: number;
  lng: number;
}

export interface MarkerOffset {
  id: string;
  x: number;
  y: number;
}

export function getJitterRadius(zoom: number): number {
  const minZoom = 12;
  const maxZoom = 17;

  const minRadius = 0;
  const maxRadius = 12;

  const t = Math.max(
    0,
    Math.min(1, (zoom - minZoom) / (maxZoom - minZoom))
  );

  return minRadius + t * (maxRadius - minRadius);
}

export function getMarkerRadius(zoom: number): number {
  const minZoom = 15;
  const maxZoom = 19;

  const minRadius = 4;
  const maxRadius = 8;

  const t = Math.max(
    0,
    Math.min(1, (zoom - minZoom) / (maxZoom - minZoom))
  );

  return minRadius + t * (maxRadius - minRadius);
}

export function calculateMarkerOffsets(
  positions: MarkerPosition[],
  radius = 18
): Map<string, MarkerOffset> {
  const groups = new Map<string, MarkerPosition[]>();

  for (const position of positions) {
    const key = `${position.lat},${position.lng}`;

    const group = groups.get(key) ?? [];
    group.push(position);
    groups.set(key, group);
  }
/*
  console.log("Marker groups:");
  console.table(
    [...groups.entries()].map(([coordinates, companies]) => ({
      coordinates,
      count: companies.length,
      ids: companies.map((company) => company.id).join(", "),
    }))
  );
*/
  const offsets = new Map<string, MarkerOffset>();

  for (const group of groups.values()) {
    group.sort((a, b) => a.id.localeCompare(b.id));

    if (group.length === 1) {
      offsets.set(group[0].id, {
        id: group[0].id,
        x: 0,
        y: 0,
      });

      continue;
    }

    const count = group.length;

    const groupRadius = radius;
    for (let i = 0; i < count; i++) {
      const angle =
        -Math.PI / 2 + (2 * Math.PI * i) / count;

      offsets.set(group[i].id, {
        id: group[i].id,
        x: Math.cos(angle) * groupRadius,
        y: Math.sin(angle) * groupRadius,
      });
    }
  }

  return offsets;
}