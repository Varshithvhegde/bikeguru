import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase"

function makeId(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len)
}

export async function POST(req: NextRequest) {
  const { bike_ids, name } = await req.json()
  if (!bike_ids?.length) return NextResponse.json({ error: "No bikes" }, { status: 400 })

  const id = makeId(8)
  const supabase = getServerSupabase()
  const { error } = await supabase
    .from("saved_comparisons")
    .insert({ id, name: name || `Comparison ${new Date().toLocaleDateString("en-IN")}`, bike_ids })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id, url: `/compare?saved=${id}` })
}

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 })

  const supabase = getServerSupabase()
  const { data, error } = await supabase
    .from("saved_comparisons")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ comparison: data })
}
