export interface StampBadge {
  id: string;
  title: string;
  category: string;
  ink_color: 'sepia' | 'crimson' | 'navy' | 'emerald' | 'gold' | string;
  rotation_deg: number;
  earned_date?: string;
}

export interface VenueReview {
  author: string;
  rating: number;
  source: string;
  text: string;
}

export interface ActivityStop {
  id: string;
  time_slot: string;
  title: string;
  description: string;
  category: 'dining' | 'sight' | 'secret' | 'workshop' | 'architecture' | string;
  location_name: string;
  lat?: number;
  lng?: number;
  estimated_cost: string;
  vintage_tip?: string;
  booking_url?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  reviews?: VenueReview[];
  qdrant_vector_id?: string;
}

export interface DailyPage {
  day_number: number;
  theme_title: string;
  date_label: string;
  ephemera_note: string;
  stamps: StampBadge[];
  activities: ActivityStop[];
}

export interface HotelListing {
  id: string;
  name: string;
  vintage_vibe: string;
  address: string;
  price_per_night: string;
  rating: number;
  perk: string;
  booking_url?: string;
  tripadvisor_url?: string;
  reviews?: VenueReview[];
}

export interface CostBreakup {
  currency_symbol: string;
  hotels_total: string;
  dining_total: string;
  activities_total: string;
  transport_total: string;
  grand_total: string;
  budget_tier: string;
  savings_tip?: string;
}

export interface GuidebookRequest {
  destination: string;
  duration_days: number;
  travel_style: string;
  budget: string;
  interests: string[];
}

export interface GuidebookOutput {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  duration_days: number;
  cover_stamp: StampBadge;
  hotels: HotelListing[];
  pages: DailyPage[];
  cost_breakup?: CostBreakup;
  created_at: string;
}

export interface SwapStopRequest {
  guidebook_id: string;
  day_number: number;
  stop_id: string;
  reason?: string;
}

export interface SwapStopResponse {
  updated_stop: ActivityStop;
  message: string;
}
