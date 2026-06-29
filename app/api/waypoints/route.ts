import { getAllWaypoints, createWaypoint } from "@/lib/db"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import type { Waypoint } from "@/lib/waypoints"

export async function GET() {
  try {
    const waypoints = await getAllWaypoints()
    return NextResponse.json(waypoints)
  } catch (error) {
    console.error("Error fetching waypoints:", error)
    return NextResponse.json({ error: "Failed to fetch waypoints" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { label, lat, lng, timestamp } = body as Omit<Waypoint, "id">

    if (!label || typeof lat !== "number" || typeof lng !== "number" || !timestamp) {
      return NextResponse.json({ error: "Invalid waypoint data" }, { status: 400 })
    }

    const waypoint: Waypoint = {
      id: nanoid(),
      label: label.trim(),
      lat,
      lng,
      timestamp,
    }

    const created = await createWaypoint(waypoint)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating waypoint:", error)
    return NextResponse.json({ error: "Failed to create waypoint" }, { status: 500 })
  }
}
