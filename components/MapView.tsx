"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Heritage } from "@/lib/types";

const culturalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const naturalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const mixedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getIcon(category: string) {
  if (category === "Natural") return naturalIcon;
  if (category === "Mixed") return mixedIcon;
  return culturalIcon;
}

export default function MapView({ heritages }: { heritages: Heritage[] }) {
  return (
    <MapContainer
      center={[30, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {heritages.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={getIcon(h.category)}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-bold">{h.nameJa}</p>
              <p className="text-gray-500">
                {h.countryJa} ・ {h.inscriptionYear}年
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/heritage/${h.id}`}
                  className="text-blue-600 hover:underline text-xs"
                >
                  詳細 →
                </Link>
                <Link
                  href={`/quiz?ids=${h.id}`}
                  className="text-green-600 hover:underline text-xs"
                >
                  クイズ
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
