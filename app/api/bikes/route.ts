import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const supabase = getServerSupabase()

  let query = supabase.from("bikes").select("*")

  const category = searchParams.get("category")
  const brand = searchParams.get("brand")
  const max_price = searchParams.get("max_price")
  const min_price = searchParams.get("min_price")
  const sort = searchParams.get("sort") || "price_on_road"
  const search = searchParams.get("search")
  const suitable_for = searchParams.get("suitable_for")
  const has_abs = searchParams.get("has_abs")
  const min_mileage = searchParams.get("min_mileage")

  if (category) {
    const cats = category.split(",")
    query = query.in("category", cats)
  }
  if (brand) {
    const brands = brand.split(",")
    query = query.in("brand", brands)
  }
  if (max_price) {
    query = query.lte("price_on_road", Number(max_price))
  }
  if (min_price) {
    query = query.gte("price_on_road", Number(min_price))
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`)
  }
  if (suitable_for) {
    const uses = suitable_for.split(",")
    query = query.overlaps("suitable_for", uses)
  }
  if (has_abs === "true") {
    query = query.gt("abs", 0)
  }
  if (min_mileage) {
    query = query.gte("mileage_kmpl", Number(min_mileage))
  }

  const sortMap: Record<string, { col: string; asc: boolean }> = {
    price_asc: { col: "price_on_road", asc: true },
    price_desc: { col: "price_on_road", asc: false },
    rating: { col: "rating", asc: false },
    mileage: { col: "mileage_kmpl", asc: false },
    power: { col: "engine_cc", asc: false },
  }
  const s = sortMap[sort] || sortMap.price_asc
  query = query.order(s.col, { ascending: s.asc })

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bikes: data || [] })
}
