export interface Waypoint {
  id: string
  label: string
  lat: number
  lng: number
  timestamp: string // ISO 8601
}

const STORAGE_KEY = "path-tracker-waypoints"

export const DEFAULT_WAYPOINTS: Waypoint[] = [
  {
    id: "1",
    label: "Central Park Entrance",
    lat: 40.7679,
    lng: -73.9718,
    timestamp: "2025-06-10T08:00:00",
  },
  {
    id: "2",
    label: "Bethesda Fountain",
    lat: 40.7736,
    lng: -73.9712,
    timestamp: "2025-06-10T08:25:00",
  },
  {
    id: "3",
    label: "The Ramble",
    lat: 40.7762,
    lng: -73.9694,
    timestamp: "2025-06-10T09:00:00",
  },
  {
    id: "4",
    label: "Jacqueline Kennedy Onassis Reservoir",
    lat: 40.7848,
    lng: -73.9635,
    timestamp: "2025-06-10T09:40:00",
  },
  {
    id: "5",
    label: "North Meadow",
    lat: 40.7912,
    lng: -73.9578,
    timestamp: "2025-06-10T10:15:00",
  },
]

export function loadWaypoints(): Waypoint[] {
  if (typeof window === "undefined") return DEFAULT_WAYPOINTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Waypoint[]
      return parsed.length > 0 ? parsed : DEFAULT_WAYPOINTS
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_WAYPOINTS
}

export function saveWaypoints(waypoints: Waypoint[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(waypoints))
  } catch {
    // ignore quota errors
  }
}

export function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}
