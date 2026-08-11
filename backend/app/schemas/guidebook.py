from typing import Optional
from pydantic import BaseModel, Field


class StampBadge(BaseModel):
    id: str = Field(..., description="Unique badge ID")
    title: str = Field(..., description="Title of the vintage stamp")
    category: str = Field(..., description="Category, e.g. Heritage, Culinary, Secret")
    ink_color: str = Field(
        default="sepia",
        description="Ink color variable: sepia, crimson, navy, emerald, gold",
    )
    rotation_deg: float = Field(
        default=-3.5, description="Rotation angle for stamp display (-10 to 10)"
    )
    earned_date: Optional[str] = Field(
        None, description="ISO date stamp earned"
    )


class VenueReview(BaseModel):
    author: str = Field(default="Verified Traveler", description="Reviewer name")
    rating: float = Field(default=4.8, description="Rating out of 5")
    source: str = Field(default="TripAdvisor", description="TripAdvisor | Google Reviews | Booking.com")
    text: str = Field(..., description="Authentic review quote or snippet")


class ActivityStop(BaseModel):
    id: str = Field(..., description="Unique activity ID")
    time_slot: str = Field(..., description="Time slot, e.g. 09:00 AM - Morning Coffee")
    title: str = Field(..., description="Venue or activity name")
    description: str = Field(..., description="Vivid vintage description")
    category: str = Field(
        ..., description="dining | sight | secret | workshop | architecture"
    )
    location_name: str = Field(..., description="Street or neighborhood location")
    lat: Optional[float] = Field(None, description="Latitude coordinate")
    lng: Optional[float] = Field(None, description="Longitude coordinate")
    estimated_cost: str = Field(..., description="Cost estimation e.g. €15 - €25")
    vintage_tip: Optional[str] = Field(
        None, description="Handwritten margin note tip"
    )
    booking_url: Optional[str] = Field(None, description="Deep link for booking or reservation")
    tripadvisor_url: Optional[str] = Field(None, description="Deep link for TripAdvisor reviews")
    google_maps_url: Optional[str] = Field(None, description="Google Maps navigation link")
    reviews: list[VenueReview] = Field(default_factory=list, description="Authentic traveler reviews")
    qdrant_vector_id: Optional[str] = Field(
        None, description="Qdrant vector ID if stored"
    )


class DailyPage(BaseModel):
    day_number: int = Field(..., description="Day index starting at 1")
    theme_title: str = Field(..., description="Theme of the day")
    date_label: str = Field(..., description="Formatted date label")
    ephemera_note: str = Field(
        ..., description="Curated historical background or margin snippet"
    )
    stamps: list[StampBadge] = Field(
        default_factory=list, description="Stamps collected on this day"
    )
    activities: list[ActivityStop] = Field(
        default_factory=list, description="List of scheduled activity stops"
    )


class HotelListing(BaseModel):
    id: str = Field(..., description="Hotel unique ID")
    name: str = Field(..., description="Property name")
    vintage_vibe: str = Field(
        ..., description="Art Deco, Belle Époque, Mid-Century Modern, etc."
    )
    address: str = Field(..., description="Full address")
    price_per_night: str = Field(..., description="Price per night formatted")
    rating: float = Field(..., description="Rating out of 5")
    perk: str = Field(..., description="Special vintage perk or secret feature")
    booking_url: Optional[str] = Field(None, description="Booking.com or hotel reservation link")
    tripadvisor_url: Optional[str] = Field(None, description="TripAdvisor hotel review link")
    reviews: list[VenueReview] = Field(default_factory=list, description="Authentic traveler reviews")


class CostBreakup(BaseModel):
    currency_symbol: str = Field(default="€", description="Currency symbol (e.g. €, $, ¥, £)")
    hotels_total: str = Field(..., description="Total estimated accommodation cost")
    dining_total: str = Field(..., description="Total estimated dining cost")
    activities_total: str = Field(..., description="Total estimated activities & entry fees")
    transport_total: str = Field(..., description="Total estimated local transit cost")
    grand_total: str = Field(..., description="Overall trip cost range e.g. €650 - €950")
    budget_tier: str = Field(default="Moderate", description="Budget, Moderate, Luxury")
    savings_tip: Optional[str] = Field(None, description="Vintage traveler money saving tip")


class GuidebookRequest(BaseModel):
    destination: str = Field(..., description="Target travel destination city/region")
    duration_days: int = Field(
        default=3, ge=1, le=14, description="Trip duration in days"
    )
    travel_style: str = Field(
        default="Vintage Explorer",
        description="Style: Historic, Speakeasy & Gastronomy, Artisan & Antiques",
    )
    budget: str = Field(
        default="Moderate", description="Budget level: Budget, Moderate, Luxury"
    )
    interests: list[str] = Field(
        default_factory=lambda: ["Architecture", "Local Crafts", "Hidden Cafes"]
    )


class GuidebookOutput(BaseModel):
    id: str = Field(..., description="Guidebook unique ID")
    title: str = Field(..., description="Title of the travel book")
    subtitle: str = Field(..., description="Subtitle or tagline")
    destination: str = Field(..., description="Target destination")
    duration_days: int = Field(..., description="Duration in days")
    cover_stamp: StampBadge = Field(..., description="Main cover badge stamp")
    hotels: list[HotelListing] = Field(
        default_factory=list, description="Recommended vintage hotels"
    )
    pages: list[DailyPage] = Field(
        default_factory=list, description="Day-by-day travel pages"
    )
    cost_breakup: Optional[CostBreakup] = Field(
        None, description="Itemized cost breakup and financial summary"
    )
    created_at: str = Field(..., description="Creation ISO timestamp")


class SwapStopRequest(BaseModel):
    guidebook_id: str = Field(..., description="Target guidebook ID")
    day_number: int = Field(..., description="Day number")
    stop_id: str = Field(..., description="ID of the stop to swap out")
    reason: Optional[str] = Field(
        None, description="Reason for replacement (e.g., too busy, prefer cafe)"
    )


class SwapStopResponse(BaseModel):
    updated_stop: ActivityStop = Field(..., description="Replacement activity stop")
    message: str = Field(..., description="Status note")
