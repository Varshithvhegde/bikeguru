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
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const supabase = getServerSupabase()

  // Fetch single comparison by id
  if (id) {
    const { data, error } = await supabase
      .from("saved_comparisons")
      .select("*")
      .eq("id", id)
      .single()
    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ comparison: data })
  }

  // Fetch all comparisons with bike details joined
  const { data: comparisons, error } = await supabase
    .from("saved_comparisons")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // For each comparison, fetch bike previews
  const bikeIds = [...new Set(comparisons?.flatMap(c => c.bike_ids) || [])]
  const { data: bikes } = await supabase
    .from("bikes")
    .select("id, name, brand, image_url, price_on_road, engine_cc, category")
    .in("id", bikeIds)

  const bikeMap = Object.fromEntries((bikes || []).map(b => [b.id, b]))

  const enriched = (comparisons || []).map(c => ({
    ...c,
    bikes: c.bike_ids.map((bid: string) => bikeMap[bid]).filter(Boolean),
  }))

  return NextResponse.json({ comparisons: enriched })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 })
  const supabase = getServerSupabase()
  const { error } = await supabase.from("saved_comparisons").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
