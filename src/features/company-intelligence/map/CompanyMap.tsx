import { useEffect, useRef, useState } from "react";
import { getCompanyGeoJson } from "../data/companyRepository";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import styles from "./CompanyMap.module.css";
import {
  type MarkerOffset,
  type MarkerPosition,
  getJitterRadius,
  calculateMarkerOffsets,
  getMarkerRadius
} from "./markerJitter";

import { companySectorColors } from "./companySectorColors";
import type { CompanySector, CompanyId } from "../data/companyTypes";

interface CompanyMapProps {
  visibleCompanyIds: CompanyId[];
  selectedCompanyId: CompanyId | null;
  onSelectCompany: (id: CompanyId) => void;
}

function applyMarkerOffset(
  map: L.Map,
  position: L.LatLng,
  offset: MarkerOffset
): L.LatLng {
  const point = map.latLngToLayerPoint(position);

  const shiftedPoint = L.point(
    point.x + offset.x,
    point.y + offset.y
  );

  return map.layerPointToLatLng(shiftedPoint);
}


export function CompanyMap({
  visibleCompanyIds,
  selectedCompanyId,
  onSelectCompany,
}: CompanyMapProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
  const markersRef = useRef<Map<CompanyId, L.CircleMarker>>(new Map());
  //Skilja mellan de synliga markörerna från fullständiga GeoJSON-lagret
  const visibleLayerRef = useRef<L.LayerGroup | null>(null);
  const selectedCompanyIdRef = useRef(selectedCompanyId);
  selectedCompanyIdRef.current = selectedCompanyId;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const map = L.map(container, {
      center: [55.51, 13.23],
      zoom: 14,
      zoomControl: true,
    });

    mapRef.current = map;

    L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }
    ).addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getCompanyGeoJson()
      .then((data) => {
        if (!cancelled) {
          setGeoData(data);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);

  //undvik att kartans GeoJSON-effekt körs om varje gång onSelectCompany
  const onSelectCompanyRef = useRef(onSelectCompany);
  useEffect(() => {
    onSelectCompanyRef.current = onSelectCompany;
  }, [onSelectCompany]);


  useEffect(() => {
    const map = mapRef.current;

    if (!map || !geoData) return;

    const positions: MarkerPosition[] = geoData.features
      .filter(
        (feature): feature is GeoJSON.Feature<GeoJSON.Point> =>
          feature.geometry?.type === "Point"
      )
      .map((feature) => ({
        id: String(feature.properties?.id),
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      }));

    markersRef.current.clear();

    const companyLayer = L.geoJSON(geoData, {
      pointToLayer: (feature, latlng) => {
        const id = String(feature.properties?.id);

        const sector = feature.properties?.sector as
          | CompanySector
          | undefined;

        const color = sector
          ? companySectorColors[sector] ?? "#D0D0D0"
          : "#D0D0D0";

        const marker = L.circleMarker(latlng, {
          radius: 4,
          color: "#333333",
          weight: 1,
          fillColor: color,
          fillOpacity: 0.9,
        });

        marker.on("click", () => {
          onSelectCompanyRef.current(id);
        });

        markersRef.current.set(id, marker);

        return marker;
      },
    });

    const visibleLayer = L.layerGroup().addTo(map);
    visibleLayerRef.current = visibleLayer;

    const updatePositions = () => {
      const zoom = map.getZoom();

      const radius = getJitterRadius(zoom);
      const markerRadius = getMarkerRadius(zoom);

      const offsets = calculateMarkerOffsets(positions, radius);

      companyLayer.eachLayer((layer) => {
        if (!(layer instanceof L.CircleMarker)) return;

        const feature = (
          layer as L.CircleMarker & {
            feature?: GeoJSON.Feature;
          }
        ).feature;

        if (feature?.geometry?.type !== "Point") return;

        const id = String(feature.properties?.id);
        const offset = offsets.get(id);

        const original = L.latLng(
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0]
        );

        layer.setLatLng(
          offset
            ? applyMarkerOffset(map, original, offset)
            : original
        );

        const selected = id === selectedCompanyIdRef.current;

        layer.setRadius(selected ? markerRadius + 3 : markerRadius);
      });
    };
    updatePositions();

    // Visa rätt företag redan när lagret skapas.
    const visibleIds = new Set(visibleCompanyIds);

    markersRef.current.forEach((marker, id) => {
      if (visibleIds.has(id)) {
        visibleLayer.addLayer(marker);
      }
    });

    map.on("zoomend", updatePositions);

    return () => {
      map.off("zoomend", updatePositions);
      map.removeLayer(visibleLayer);
      visibleLayerRef.current = null;
      markersRef.current.clear();
    };
  }, [geoData]);

  useEffect(() => {
    const visibleLayer = visibleLayerRef.current;

    if (!visibleLayer) return;

    visibleLayer.clearLayers();
    for (const id of visibleCompanyIds) {
      const marker = markersRef.current.get(id);

      if (marker) {
        visibleLayer.addLayer(marker);
      }
    }
  }, [visibleCompanyIds, geoData]);

  useEffect(() => {
    const zoom = mapRef.current?.getZoom() ?? 14;
    const markerRadius = getMarkerRadius(zoom);

    markersRef.current.forEach((marker, id) => {
      const selected = id === selectedCompanyId;

      marker.setStyle({
        radius: selected ? markerRadius + 3 : markerRadius,
        weight: selected ? 3 : 1,
        color: selected ? "#FFFFFF" : "#333333",
      });

      if (selected) {
        marker.bringToFront();
      }
    });
  }, [selectedCompanyId, geoData]);

  return (
    <div className={styles.mapContainer}>
      <div
        ref={containerRef}
        className={styles.map}
        aria-label="Interactive company map"
      />
    </div>
  );
}