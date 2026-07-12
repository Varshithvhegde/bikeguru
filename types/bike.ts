export interface Bike {
  id: string
  name: string
  brand: string
  model_year: number
  price_on_road: number
  price_ex_showroom: number
  category: 'commuter' | 'sport' | 'adventure' | 'cruiser' | 'scooter'
  engine_cc: number
  max_power: string
  max_torque: string
  fuel_type: string
  mileage_kmpl: number
  top_speed: number
  abs: number
  weight_kg: number
  fuel_tank_liters: number
  seat_height_mm: number
  ground_clearance_mm: number
  colors: string[]
  pros: string[]
  cons: string[]
  image_url: string
  gallery_urls: string[]
  rating: number
  review_count: number
  features: string[]
  suitable_for: string[]
  created_at: string
}

export interface FilterState {
  budget_max: number
  budget_min: number
  category: string[]
  brand: string[]
  min_mileage: number
  min_power: number
  has_abs: boolean
  suitable_for: string[]
  sort: 'price_asc' | 'price_desc' | 'rating' | 'mileage' | 'power'
}
