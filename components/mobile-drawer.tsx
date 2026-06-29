"use client"

import { useEffect, useRef } from "react"
import WaypointSidebar from "@/components/waypoint-sidebar"
import type { Waypoint } from "@/lib/waypoints"

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  waypoints: Waypoint[]
  onAdd: (wp: Omit<Waypoint, "id">) => void
  onDelete: (id: string) => void
}

export default function MobileDrawer({
  open,
  onClose,
  waypoints,
  onAdd,
  onDelete,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel — slides up from bottom */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Waypoint panel"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[1200] flex flex-col rounded-t-2xl bg-card border-t border-border shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "88dvh" }}
      >
        {/* Drag handle + close */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
          <div className="mx-auto h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2 shrink-0">
          <h1 className="text-base font-semibold tracking-tight text-foreground">Path Tracker</h1>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar content reused — strip its outer <aside> wrapper by passing a flag */}
        <div className="flex flex-1 flex-col overflow-hidden border-t border-border">
          <WaypointSidebarInner
            waypoints={waypoints}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        </div>
      </div>
    </>
  )
}

// Inner version without the fixed-width aside shell
function WaypointSidebarInner(props: {
  waypoints: Waypoint[]
  onAdd: (wp: Omit<Waypoint, "id">) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <WaypointSidebar {...props} mobile />
    </div>
  )
}
