"use client"

import { useState } from "react"
import type { Waypoint } from "@/lib/waypoints"
import { formatTimestamp } from "@/lib/waypoints"

interface WaypointSidebarProps {
  waypoints: Waypoint[]
  onAdd: (wp: Omit<Waypoint, "id">) => void
  onDelete: (id: string) => void
}

interface FormState {
  label: string
  lat: string
  lng: string
  timestamp: string
}

const EMPTY_FORM: FormState = { label: "", lat: "", lng: "", timestamp: "" }

function now(): string {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

export default function WaypointSidebar({ waypoints, onAdd, onDelete }: WaypointSidebarProps) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, timestamp: now() })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function validate(): boolean {
    const e: Partial<FormState> = {}
    if (!form.label.trim()) e.label = "Label is required"
    const lat = parseFloat(form.lat)
    const lng = parseFloat(form.lng)
    if (isNaN(lat) || lat < -90 || lat > 90) e.lat = "Valid latitude (-90 to 90)"
    if (isNaN(lng) || lng < -180 || lng > 180) e.lng = "Valid longitude (-180 to 180)"
    if (!form.timestamp) e.timestamp = "Timestamp is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onAdd({
      label: form.label.trim(),
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      timestamp: new Date(form.timestamp).toISOString(),
    })
    setForm({ ...EMPTY_FORM, timestamp: now() })
    setErrors({})
  }

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-border bg-card text-card-foreground">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h1 className="text-base font-semibold tracking-tight text-foreground">Path Tracker</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {waypoints.length} waypoint{waypoints.length !== 1 ? "s" : ""} recorded
        </p>
      </div>

      {/* Add form */}
      <div className="border-b border-border px-5 py-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Add Waypoint
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {/* Label */}
          <div>
            <label htmlFor="wp-label" className="mb-1 block text-xs font-medium text-foreground">
              Label
            </label>
            <input
              id="wp-label"
              type="text"
              placeholder="e.g. Coffee Shop"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.label && <p className="mt-1 text-xs text-destructive">{errors.label}</p>}
          </div>

          {/* Lat / Lng */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="wp-lat" className="mb-1 block text-xs font-medium text-foreground">
                Latitude
              </label>
              <input
                id="wp-lat"
                type="number"
                step="any"
                placeholder="40.7128"
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.lat && <p className="mt-1 text-xs text-destructive">{errors.lat}</p>}
            </div>
            <div className="flex-1">
              <label htmlFor="wp-lng" className="mb-1 block text-xs font-medium text-foreground">
                Longitude
              </label>
              <input
                id="wp-lng"
                type="number"
                step="any"
                placeholder="-74.0060"
                value={form.lng}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.lng && <p className="mt-1 text-xs text-destructive">{errors.lng}</p>}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label htmlFor="wp-ts" className="mb-1 block text-xs font-medium text-foreground">
              Timestamp
            </label>
            <input
              id="wp-ts"
              type="datetime-local"
              value={form.timestamp}
              onChange={(e) => setForm((f) => ({ ...f, timestamp: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.timestamp && (
              <p className="mt-1 text-xs text-destructive">{errors.timestamp}</p>
            )}
          </div>

          <button
            type="submit"
            className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
          >
            Add Waypoint
          </button>
        </form>
      </div>

      {/* Waypoint list */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <h2 className="shrink-0 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Route
        </h2>

        {waypoints.length === 0 ? (
          <p className="px-5 text-sm text-muted-foreground">No waypoints yet. Add one above.</p>
        ) : (
          <ol className="flex-1 overflow-y-auto px-5 pb-4">
            {waypoints.map((wp, i) => {
              const isFirst = i === 0
              const isLast = i === waypoints.length - 1
              const dotColor = isFirst
                ? "bg-green-500"
                : isLast
                  ? "bg-red-500"
                  : "bg-blue-500"

              return (
                <li key={wp.id} className="relative flex gap-3">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`mt-3 h-3 w-3 shrink-0 rounded-full ring-2 ring-background ${dotColor}`}
                    />
                    {i < waypoints.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="group flex flex-1 items-start justify-between gap-2 py-2 pb-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        <span className="mr-1.5 text-xs font-bold text-muted-foreground">
                          {i + 1}.
                        </span>
                        {wp.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTimestamp(wp.timestamp)}
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground/70">
                        {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
                      </p>
                    </div>

                    {/* Delete */}
                    {confirmDelete === wp.id ? (
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          onClick={() => {
                            onDelete(wp.id)
                            setConfirmDelete(null)
                          }}
                          className="rounded px-2 py-0.5 text-xs font-semibold text-destructive ring-1 ring-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(wp.id)}
                        aria-label={`Delete waypoint ${wp.label}`}
                        className="mt-2.5 shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </aside>
  )
}
