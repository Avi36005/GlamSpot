"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { SalonDTO } from "@/lib/types";
import { MUMBAI_CENTER } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

const roseIcon = L.divIcon({
  className: "",
  html: `<div style="background:#c9184a;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
});

export default function SalonMap({ salons }: { salons: SalonDTO[] }) {
  return (
    <MapContainer
      center={[MUMBAI_CENTER.lat, MUMBAI_CENTER.lng]}
      zoom={11}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {salons.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={roseIcon}>
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-neutral-500">
                {s.locality} · ★ {s.avgRating.toFixed(1)} · from {formatINR(s.priceFrom)}
              </div>
              <Link href={`/salon/${s.id}`} className="text-xs font-medium text-[#c9184a]">
                View Salon →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
