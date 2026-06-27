"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import type { Waypoint } from "@/lib/waypoints"
import { formatTimestamp } from "@/lib/waypoints"
import "leaflet/dist/leaflet.css"

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function createNumberedIcon(index: number, isFirst: boolean, isLast: boolean) {
  const bg = isFirst ? "#22c55e" : isLast ? "#ef4444" : "#3b82f6"
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
    html: `
      <div style="
        width:32px;height:32px;
        background:${bg};
        border:2.5px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          color:#fff;
          font-size:11px;
          font-weight:700;
          font-family:sans-serif;
          line-height:1;
        ">${index + 1}</span>
      </div>`,
  })
}

function FitBounds({ waypoints }: { waypoints: Waypoint[] }) {
  const map = useMap()
  const prevLength = useRef(0)

  useEffect(() => {
    if (waypoints.length === 0) return
    // Only fit when waypoints change structurally
    if (waypoints.length === prevLength.current) return
    prevLength.current = waypoints.length

    const bounds = L.latLngBounds(waypoints.map((w) => [w.lat, w.lng]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 })
  }, [waypoints, map])

  return null
}

function WaypointMarkers({ waypoints }: { waypoints: Waypoint[] }) {
  const map = useMap()
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    // Remove old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    waypoints.forEach((wp, i) => {
      const isFirst = i === 0
      const isLast = i === waypoints.length - 1
      const icon = createNumberedIcon(i, isFirst, isLast)
      const marker = L.marker([wp.lat, wp.lng], { icon }).addTo(map)
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:180px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#1e293b;">${wp.label}</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:2px;">
            <span style="font-weight:600;">Time:</span> ${formatTimestamp(wp.timestamp)}
          </div>
          <div style="font-size:12px;color:#94a3b8;">
            ${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}
          </div>
        </div>
      `, { maxWidth: 260 })
      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
    }
  }, [waypoints, map])

  return null
}

interface MapViewProps {
  waypoints: Waypoint[]
}

export default function MapView({ waypoints }: MapViewProps) {
  const polylinePositions = waypoints.map((w) => [w.lat, w.lng] as [number, number])

  return (
    <MapContainer
      center={[40.78, -73.965]}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.8, dashArray: "6 4" }}
        />
      )}
      <WaypointMarkers waypoints={waypoints} />
      <FitBounds waypoints={waypoints} />
    </MapContainer>
  )
}
