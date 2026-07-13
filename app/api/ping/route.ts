import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase"

export async function GET() {
  const supabase = getServerSupabase()
  // Lightweight query to keep Supabase active
  const { error } = await supabase.from("bikes").select("id").limit(1).single()
  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
