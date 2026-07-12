import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getServerSupabase } from "@/lib/supabase"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM = `You are a senior Indian motorcycle expert. Given specs of 2–3 bikes, produce a structured JSON comparison report for someone buying in Bangalore, Karnataka.

Return ONLY valid JSON — no markdown, no explanation, just the raw object.

Schema:
{
  "verdict": {
    "winner": "<bike name>",
    "tagline": "<one punchy sentence why this bike wins overall>",
    "runner_up": "<bike name or null if only 2>",
    "best_value": "<bike name — best price-to-performance>",
    "best_for_highway": "<bike name>",
    "best_for_city": "<bike name>",
    "best_mileage": "<bike name>"
  },
  "summary": "<2–3 sentence plain-English summary of the comparison — who should buy which bike>",
  "categories": [
    {
      "name": "Performance",
      "icon": "⚡",
      "scores": { "<bike1_name>": 82, "<bike2_name>": 74 },
      "insight": "<one sentence insight about performance differences>"
    },
    {
      "name": "Value for Money",
      "icon": "💰",
      "scores": { "<bike1_name>": 90, "<bike2_name>": 68 },
      "insight": "<one sentence>"
    },
    {
      "name": "Mileage / Economy",
      "icon": "⛽",
      "scores": { "<bike1_name>": 70, "<bike2_name>": 88 },
      "insight": "<one sentence>"
    },
    {
      "name": "Comfort & Ergonomics",
      "icon": "🛋️",
      "scores": { "<bike1_name>": 75, "<bike2_name>": 85 },
      "insight": "<one sentence>"
    },
    {
      "name": "City Rideability",
      "icon": "🏙️",
      "scores": { "<bike1_name>": 80, "<bike2_name>": 90 },
      "insight": "<one sentence>"
    },
    {
      "name": "Highway Capability",
      "icon": "🛣️",
      "scores": { "<bike1_name>": 88, "<bike2_name>": 72 },
      "insight": "<one sentence>"
    },
    {
      "name": "Safety (ABS/Brakes)",
      "icon": "🛡️",
      "scores": { "<bike1_name>": 90, "<bike2_name>": 80 },
      "insight": "<one sentence>"
    },
    {
      "name": "Resale Value",
      "icon": "📈",
      "scores": { "<bike1_name>": 78, "<bike2_name>": 82 },
      "insight": "<one sentence>"
    }
  ],
  "use_cases": [
    { "use": "Daily Commute (Bangalore traffic)", "winner": "<bike name>", "reason": "<short reason>" },
    { "use": "Weekend Highways (Mysore/Coorg)", "winner": "<bike name>", "reason": "<short reason>" },
    { "use": "First-time Rider", "winner": "<bike name>", "reason": "<short reason>" },
    { "use": "Long Distance Touring", "winner": "<bike name>", "reason": "<short reason>" },
    { "use": "Budget-Conscious Buyer", "winner": "<bike name>", "reason": "<short reason>" }
  ],
  "key_differences": [
    "<most important differentiator between the bikes — 1 sentence>",
    "<second key difference>",
    "<third key difference>"
  ],
  "buyer_personas": [
    { "persona": "<type of rider e.g. Daily Commuter>", "recommendation": "<bike name>", "reason": "<why>" },
    { "persona": "<type of rider e.g. Weekend Warrior>", "recommendation": "<bike name>", "reason": "<why>" },
    { "persona": "<type of rider e.g. New Rider>", "recommendation": "<bike name>", "reason": "<why>" }
  ]
}

Scores must be 0–100. Be decisive — don't give all bikes the same score. Use Bangalore on-road price for value assessments.`

export async function POST(req: NextRequest) {
  try {
    const { bike_ids } = await req.json()
    if (!bike_ids?.length || bike_ids.length < 2) {
      return NextResponse.json({ error: "Need at least 2 bikes" }, { status: 400 })
    }

    const supabase = getServerSupabase()
    const { data: bikes } = await supabase
      .from("bikes")
      .select("name,brand,price_on_road,price_ex_showroom,engine_cc,max_power,max_torque,mileage_kmpl,top_speed,weight_kg,ground_clearance_mm,abs,fuel_tank_liters,category,pros,cons,suitable_for,rating,seat_height_mm")
      .in("id", bike_ids)

    if (!bikes?.length) return NextResponse.json({ error: "Bikes not found" }, { status: 404 })

    const prompt = `Compare these ${bikes.length} bikes for a buyer in Bangalore, Karnataka:\n\n${JSON.stringify(bikes, null, 2)}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: 1800,
      temperature: 0.3,
    })

    const raw = completion.choices[0]?.message?.content || ""
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

    let report
    try {
      report = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: "GPT returned invalid JSON", raw }, { status: 500 })
    }

    return NextResponse.json({ report, bikes })
  } catch (err) {
    console.error("AI compare error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
