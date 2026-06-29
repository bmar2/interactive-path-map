"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import useSWR from "swr"
import WaypointSidebar from "@/components/waypoint-sidebar"
import MobileDrawer from "@/components/mobile-drawer"
import type { Waypoint } from "@/lib/waypoints"

// Leaflet must be dynamically imported — it uses browser-only APIs
const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
      Loading map…
    </div>
  ),
})

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Page() {
  const { data: waypoints = [], mutate, isLoading } = useSWR<Waypoint[]>(
    "/api/waypoints",
    fetcher
  )
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleAdd(wp: Omit<Waypoint, "id">) {
    const res = await fetch("/api/waypoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wp),
    })
    if (res.ok) {
      await mutate()
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/waypoints/${id}`, { method: "DELETE" })
    await mutate()
  }

  return (
    <main className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop sidebar (md+) ── */}
      <div className="hidden md:flex">
        <WaypointSidebar
          waypoints={waypoints}
          onAdd={handleAdd}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      {/* ── Map (always fills remaining space) ── */}
      <div className="relative flex-1">
        <MapView waypoints={waypoints} />

        {/* Mobile: floating controls */}
        <div className="md:hidden">
          {/* Waypoint count badge */}
          {waypoints.length > 0 && (
            <div className="absolute left-4 top-4 z-[1000] flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 shadow-md backdrop-blur-sm border border-border">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-foreground">
                {waypoints.length} waypoint{waypoints.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Open drawer button */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open waypoint panel"
            className="absolute bottom-6 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile bottom drawer ── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        waypoints={waypoints}
        onAdd={handleAdd}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </main>
  )
}
