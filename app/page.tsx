"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import WaypointSidebar from "@/components/waypoint-sidebar"
import type { Waypoint } from "@/lib/waypoints"
import { loadWaypoints, saveWaypoints } from "@/lib/waypoints"

// Leaflet must be dynamically imported — it uses browser-only APIs
const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
})

export default function Page() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setWaypoints(loadWaypoints())
    setMounted(true)
  }, [])

  function handleAdd(wp: Omit<Waypoint, "id">) {
    const next = [...waypoints, { ...wp, id: crypto.randomUUID() }]
    setWaypoints(next)
    saveWaypoints(next)
  }

  function handleDelete(id: string) {
    const next = waypoints.filter((w) => w.id !== id)
    setWaypoints(next)
    saveWaypoints(next)
  }

  if (!mounted) return null

  return (
    <main className="flex h-screen overflow-hidden bg-background">
      <WaypointSidebar waypoints={waypoints} onAdd={handleAdd} onDelete={handleDelete} />
      <div className="relative flex-1">
        <MapView waypoints={waypoints} />
      </div>
    </main>
  )
}
