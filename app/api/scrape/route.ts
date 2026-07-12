import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getServerSupabase } from "@/lib/supabase"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function fetchBikeWalePage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-IN,en;q=0.9",
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

function extractTextContent(html: string): string {
  // Strip scripts, styles, nav, header, footer first
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s{3,}/g, "  ")
    .trim()

  // Extract image IDs from CDN URLs
  const imgMatches = html.match(/imgd\.aeplcdn\.com\/\d+x\d+\/n\/cw\/ec\/(\d+)\/([^"'?\s]+)/g) || []
  const uniqueImgs = [...new Set(imgMatches)].slice(0, 10)

  // Extract price patterns
  const priceMatches = html.match(/[\d,]+(?:\.\d+)?\s*(?:lakh|lac|L|₹)/gi) || []

  return (
    `PAGE TEXT:\n${text.slice(0, 8000)}\n\n` +
    `CDN IMAGE URLS FOUND:\n${uniqueImgs.join("\n")}\n\n` +
    `PRICE MENTIONS:\n${[...new Set(priceMatches)].slice(0, 20).join(", ")}`
  )
}

const EXTRACTION_PROMPT = `You are a bike data extractor. Given scraped HTML text from a BikeWale bike page, extract structured data and return ONLY valid JSON (no markdown, no backticks).

Extract these fields (use null if not found):
{
  "name": "exact model name e.g. Apache RTR 310",
  "brand": "brand name e.g. TVS",
  "model_year": 2024,
  "price_on_road": 193000,
  "price_ex_showroom": 182000,
  "category": "commuter|sport|adventure|cruiser|scooter",
  "engine_cc": 210,
  "max_power": "25.15 bhp @ 9250 rpm",
  "max_torque": "20.4 Nm @ 7250 rpm",
  "fuel_type": "petrol",
  "mileage_kmpl": 35,
  "top_speed": 145,
  "abs": 2,
  "weight_kg": 162,
  "fuel_tank_liters": 13,
  "seat_height_mm": 860,
  "ground_clearance_mm": 220,
  "colors": ["Black", "Red"],
  "pros": ["Good off-road", "Dual ABS"],
  "cons": ["Heavy", "High seat"],
  "image_url": "https://imgd.aeplcdn.com/664x374/n/cw/ec/NUMERIC_ID/slug-right-side-view.jpeg",
  "features": ["Feature 1", "Feature 2"],
  "suitable_for": ["city", "highway", "commute"],
  "rating": 4.3,
  "review_count": 1200
}

Rules:
- abs: 0=none, 1=single channel, 2=dual channel
- suitable_for: array of "commute","city","highway","sport","touring"
- category: best fit from commuter/sport/adventure/cruiser/scooter
- price_on_road: DO NOT use any scraped on-road price — this will be calculated server-side using Bangalore Karnataka formula. Set price_on_road to null.
- price_ex_showroom: extract the ex-showroom price (base price before taxes) in INR as a plain number
- image_url: reconstruct from CDN URLs found — prefer right-side-view, use the numeric EC ID found in CDN IMAGE URLS section
- If right-side-view.jpeg 404s they might use .png — note that in image_url
- pros/cons: infer from specs and reviews if not explicit (5-6 each)
- rating: out of 5, from BikeWale rating if visible
- Return ONLY the JSON object, nothing else`

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || !url.includes("bikewale.com")) {
      return NextResponse.json({ error: "Please provide a valid BikeWale URL" }, { status: 400 })
    }

    // 1. Fetch the page
    let html: string
    try {
      html = await fetchBikeWalePage(url)
    } catch (e) {
      return NextResponse.json({ error: `Could not fetch page: ${(e as Error).message}` }, { status: 400 })
    }

    // 2. Extract text
    const pageText = extractTextContent(html)

    // 3. GPT extraction
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: pageText },
      ],
      max_tokens: 1000,
      temperature: 0,
    })

    const raw = completion.choices[0]?.message?.content || ""

    // 4. Parse JSON
    let bikeData: Record<string, unknown>
    try {
      // strip potential markdown fences
      const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      bikeData = JSON.parse(clean)
    } catch {
      return NextResponse.json(
        { error: "GPT returned invalid JSON", raw },
        { status: 500 }
      )
    }

    // 5. Calculate Bangalore on-road price from ex-showroom
    const exShowroom = Number(bikeData.price_ex_showroom) || 0
    const cc = Number(bikeData.engine_cc) || 150
    if (exShowroom > 0) {
      const roadTaxRate = cc <= 150 ? 0.13 : 0.14
      const insurance = cc <= 150 ? 8000 : cc <= 350 ? 12000 : 15000
      const handling = 3500
      const onRoad = Math.round((exShowroom + exShowroom * roadTaxRate + insurance + handling) / 100) * 100
      bikeData.price_on_road = onRoad
      bikeData._price_breakdown = {
        ex_showroom: exShowroom,
        road_tax: Math.round(exShowroom * roadTaxRate),
        road_tax_rate: `${(roadTaxRate * 100).toFixed(0)}% (Karnataka)`,
        insurance,
        handling,
        on_road_bangalore: onRoad,
      }
    }

    // 6. Return parsed data (don't insert yet — let admin confirm)
    return NextResponse.json({ bike: bikeData, raw })
  } catch (err) {
    console.error("Scrape error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Confirm and insert bike
export async function PUT(req: NextRequest) {
  try {
    const { bike } = await req.json()
    const supabase = getServerSupabase()

    // Check if already exists
    const { data: existing } = await supabase
      .from("bikes")
      .select("id, name")
      .ilike("name", bike.name)
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("bikes")
        .update({ ...bike, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, action: "updated", id: existing.id })
    }

    // Insert new
    const { data, error } = await supabase.from("bikes").insert(bike).select("id").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: "inserted", id: data.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
