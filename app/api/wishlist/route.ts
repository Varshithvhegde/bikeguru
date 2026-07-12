import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id") || ""
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from("wishlist")
    .select("*, bikes(*)")
    .eq("session_id", sessionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
}

export async function POST(req: NextRequest) {
  const { bike_id, notes } = await req.json()
  const sessionId = req.headers.get("x-session-id") || ""
  const supabase = getServerSupabase()

  const { error } = await supabase
    .from("wishlist")
    .upsert({ session_id: sessionId, bike_id, notes }, { onConflict: "session_id,bike_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { bike_id } = await req.json()
  const sessionId = req.headers.get("x-session-id") || ""
  const supabase = getServerSupabase()

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("session_id", sessionId)
    .eq("bike_id", bike_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
