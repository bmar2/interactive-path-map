import { deleteWaypoint } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteWaypoint(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting waypoint:", error)
    return NextResponse.json({ error: "Failed to delete waypoint" }, { status: 500 })
  }
}
