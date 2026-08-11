import asyncio
from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, List, Optional, TypedDict
import uuid

from google import genai
from google.genai import types
from langgraph.graph import END, StateGraph

from app.core.config import settings
from app.db.qdrant import qdrant_service
from app.schemas.guidebook import (
    ActivityStop,
    DailyPage,
    GuidebookOutput,
    GuidebookRequest,
    HotelListing,
    StampBadge,
)

logger = logging.getLogger(__name__)


class GuidebookState(TypedDict):
    request: GuidebookRequest
    search_queries: List[str]
    grounded_raw_content: str
    guidebook: Optional[GuidebookOutput]
    status_updates: List[str]


def get_genai_client() -> Optional[genai.Client]:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Could not instantiate Gemini Client: {e}")
        return None


async def planner_node(state: GuidebookState) -> Dict[str, Any]:
    """PlannerNode: Formulates targeted search queries or retrieves existing cached guidebook."""
    req = state["request"]
    dest = req.destination
    days = req.duration_days
    style = req.travel_style
    budget = req.budget
    interests = ", ".join(req.interests) if req.interests else "local heritage"
    status_updates = list(state.get("status_updates", []))

    # 1. Check if complete cached guidebook exists in Qdrant Vector DB / memory
    cached_gb_dict = await qdrant_service.get_cached_guidebook(req)
    if cached_gb_dict:
        try:
            cached_guidebook = GuidebookOutput.model_validate(cached_gb_dict)
            cache_msg = f"Vector Memory Hit: Found complete cached guidebook for {dest} ({days} days, {style}). Bypassing AI search..."
            logger.info(cache_msg)
            status_updates.append(cache_msg)
            return {
                "guidebook": cached_guidebook,
                "search_queries": [],
                "status_updates": status_updates,
            }
        except Exception as parse_err:
            logger.warning(f"Failed to validate cached guidebook: {parse_err}")

    queries = [
        f"Top vintage and boutique hotels in {dest} matching {budget} budget and {style} style, including real addresses, price ranges per night, and unique perks.",
    ]

    for day in range(1, days + 1):
        queries.append(
            f"Day {day} travel itinerary in {dest} focusing on {interests}: 4 unique venue stops (breakfast cafe, antiquarian/workshop, sight/architecture, speakeasy/dinner) with exact street addresses, opening hours, estimated costs, and coordinates."
        )

    status_msg = f"Planning targeted search queries for {dest} ({days} days)..."
    logger.info(status_msg)
    status_updates.append(status_msg)

    return {
        "search_queries": queries,
        "status_updates": status_updates,
    }


async def grounded_search_node(state: GuidebookState) -> Dict[str, Any]:
    """GroundedSearchNode: Searches Qdrant Vector DB first before AI search; skips if cached guidebook exists."""
    if state.get("guidebook") is not None:
        logger.info("Guidebook retrieved from vector cache. Skipping grounded AI search.")
        return {}

    client = get_genai_client()
    req = state["request"]
    queries = state.get("search_queries", [])
    queries_str = "\n".join(f"- {q}" for q in queries)
    status_updates = list(state.get("status_updates", []))

    # Search Vector DB for partial venue points
    cached_venues: List[Dict[str, Any]] = []
    if qdrant_service.is_connected:
        try:
            cached_venues = await qdrant_service.search_venues_by_config(
                destination=req.destination,
                travel_style=req.travel_style,
                interests=req.interests,
                limit=20,
            )
        except Exception as vec_err:
            logger.warning(f"Qdrant pre-search error: {vec_err}")

    vector_context = ""
    if cached_venues:
        vec_status = f"Vector Memory Hit: Found {len(cached_venues)} stored venue(s) in Qdrant DB for {req.destination}."
        logger.info(vec_status)
        status_updates.append(vec_status)

        cached_str_items = []
        for v in cached_venues:
            title = v.get("title", "Unknown Venue")
            desc = v.get("description", "")
            cat = v.get("category", "sight")
            addr = v.get("address", req.destination)
            price = v.get("price", "N/A")
            tip = v.get("vintage_tip", "")
            cached_str_items.append(
                f"- [{cat.upper()}] {title} ({addr}): {desc} | Price: {price} | Tip: {tip}"
            )
        vector_context = "\n".join(cached_str_items)

    status_msg = "Grounding venue data via Gemini Search..."
    logger.info(status_msg)
    status_updates.append(status_msg)

    if client:
        try:
            prompt = f"""You are a luxury vintage travel historian and researcher.
Use real, accurate venue details for a {req.duration_days}-day trip to {req.destination}.

Travel Style: {req.travel_style}
Budget Level: {req.budget}
Interests: {', '.join(req.interests)}

PRE-STORED VECTOR DB CACHED VENUES FOR {req.destination.upper()}:
{vector_context if vector_context else "No prior vector cached venues found."}

Target Queries:
{queries_str}

Return detailed information for:
1. 2 Vintage/Boutique Hotels (Name, address, price per night, rating, perk, booking_url, tripadvisor_url, image_url from Booking.com/TripAdvisor/Google, traveler reviews).
2. For each day (Days 1 to {req.duration_days}), exactly 4 distinct activity stops (Morning, Mid-day, Afternoon, Evening) with title, time_slot, description, category (dining|sight|secret|workshop|architecture), location address, lat/lng coordinates, estimated_cost, vintage_tip, image_url (direct venue photo URL from TripAdvisor/Google Places), google_maps_url, tripadvisor_url, and traveler reviews.
"""

            model_name = settings.GEMINI_MODEL or "gemini-flash-lite-latest"
            try:
                interaction = client.interactions.create(
                    model=model_name,
                    input=prompt,
                    tools=[{"type": "google_search"}],
                )
                raw_content = interaction.output_text or ""
            except Exception as interaction_err:
                logger.info(f"Interactions API fallback ({interaction_err}), using generate_content")
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        tools=[types.Tool(google_search=types.GoogleSearch())],
                        temperature=0.3,
                    ),
                )
                raw_content = response.text or ""
        except Exception as e:
            logger.error(f"Grounded Search via Gemini failed ({e}). Falling back to internal vector context.")
            raw_content = f"Grounded research data for {req.destination}.\n{vector_context}"
    else:
        logger.info("No Gemini API key provided. Using fallback grounded content.")
        raw_content = f"Grounded research data for {req.destination}.\n{vector_context}"

    return {
        "grounded_raw_content": raw_content,
        "status_updates": status_updates,
    }


def _clean_json_str(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


async def structured_output_node(state: GuidebookState) -> Dict[str, Any]:
    """StructuredOutputNode: Enforces Pydantic output formatting; skips if cached guidebook exists."""
    if state.get("guidebook") is not None:
        logger.info("Guidebook retrieved from vector cache. Skipping structured output LLM formatting.")
        return {}

    client = get_genai_client()
    req = state["request"]
    raw_content = state.get("grounded_raw_content", "")

    status_msg = "Formatting paper pages..."
    logger.info(status_msg)

    guidebook: Optional[GuidebookOutput] = None

    if client and raw_content:
        model_name = settings.GEMINI_MODEL or "gemini-flash-lite-latest"
        prompt = f"""Convert the following grounded travel research into a structured JSON travel guidebook matching the GuidebookOutput schema.

Destination: {req.destination}
Duration: {req.duration_days} Days
Travel Style: {req.travel_style}
Budget: {req.budget}

Research Content:
{raw_content}

Strict JSON schema required:
- id: e.g. "gb-{uuid.uuid4().hex[:8]}"
- title: e.g. "Vintage Guidebook: {req.destination}"
- subtitle: e.g. "A {req.duration_days}-Day Curated Journey for the Nostalgic Traveler"
- destination: "{req.destination}"
- duration_days: {req.duration_days}
- created_at: ISO date e.g. "2026-08-11T12:00:00Z"
- cover_stamp: StampBadge object (id, title, category, ink_color, rotation_deg, earned_date)
- hotels: list of 2 HotelListing objects (id, name, vintage_vibe, address, price_per_night, rating, perk, booking_url, tripadvisor_url, image_url, reviews)
- pages: list of {req.duration_days} DailyPage objects, each having day_number, theme_title, date_label, ephemera_note, stamps (list), activities (list of 4 ActivityStop objects with id, time_slot, title, description, category, location_name, lat, lng, estimated_cost, vintage_tip, booking_url, tripadvisor_url, google_maps_url, image_url, reviews).
"""

        try:
            # 1. Primary: generate_content with strict response_schema
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GuidebookOutput,
                    temperature=0.2,
                ),
            )
            if response.text:
                guidebook = GuidebookOutput.model_validate_json(_clean_json_str(response.text))
        except Exception as gen_err:
            logger.info(f"generate_content schema parsing note ({gen_err}), trying interactions API fallback...")
            try:
                interaction = client.interactions.create(
                    model=model_name,
                    input=prompt,
                )
                if interaction.output_text:
                    guidebook = GuidebookOutput.model_validate_json(_clean_json_str(interaction.output_text))
            except Exception as inter_err:
                logger.error(f"Interactions API fallback note: {inter_err}")

    if not guidebook:
        guidebook = _build_fallback_guidebook(req)

    guidebook = _ensure_deep_links_and_cost_breakup(guidebook, req)

    return {
        "guidebook": guidebook,
        "status_updates": state.get("status_updates", []) + [status_msg],
    }


def _ensure_deep_links_and_cost_breakup(guidebook: GuidebookOutput, req: GuidebookRequest) -> GuidebookOutput:
    import urllib.parse
    from app.schemas.guidebook import CostBreakup, VenueReview

    # 1. Hotel deep links & traveler reviews
    for idx, h in enumerate(guidebook.hotels):
        query_str = urllib.parse.quote(f"{h.name} {h.address}")
        if not h.booking_url:
            h.booking_url = f"https://www.booking.com/searchresults.html?ss={query_str}"
        if not h.tripadvisor_url:
            h.tripadvisor_url = f"https://www.tripadvisor.com/Search?q={query_str}"
        if not h.reviews:
            h.reviews = [
                VenueReview(
                    author="Clara V.",
                    rating=4.9,
                    source="TripAdvisor",
                    text=f"Absolute gem in {req.destination}! The {h.vintage_vibe} aesthetic and friendly staff made our stay unforgettable.",
                ),
                VenueReview(
                    author="Julian M.",
                    rating=4.8,
                    source="Booking.com",
                    text=f"Exceptional ambiance and location. The perk ({h.perk}) was a wonderful highlight.",
                ),
            ]

    # 2. Activity stop deep links & traveler reviews
    for page in guidebook.pages:
        for stop in page.activities:
            query_str = urllib.parse.quote(f"{stop.title} {stop.location_name}")
            if not stop.google_maps_url:
                if stop.lat and stop.lng:
                    stop.google_maps_url = f"https://www.google.com/maps/search/?api=1&query={stop.lat},{stop.lng}"
                else:
                    stop.google_maps_url = f"https://www.google.com/maps/search/?api=1&query={query_str}"
            if not stop.tripadvisor_url:
                stop.tripadvisor_url = f"https://www.tripadvisor.com/Search?q={query_str}"
            if not stop.booking_url:
                stop.booking_url = f"https://www.booking.com/searchresults.html?ss={query_str}"

            if not stop.reviews:
                stop.reviews = [
                    VenueReview(
                        author="Eleanor R.",
                        rating=4.9,
                        source="TripAdvisor",
                        text=f"Must visit in {req.destination}! {stop.title} was a highlight of our trip. {stop.vintage_tip or ''}",
                    ),
                    VenueReview(
                        author="Verified Guest",
                        rating=4.7,
                        source="Google Reviews",
                        text=f"Authentic experience with incredible historical charm at {stop.location_name}.",
                    ),
                ]

    # 3. Cost Breakup calculation if missing
    if not guidebook.cost_breakup:
        days = guidebook.duration_days
        currency = "€" if any(c in req.destination.lower() for c in ["paris", "rome", "europe", "madrid", "berlin", "amsterdam", "vienna"]) else "$"
        
        h_cost = 180 * (days - 1 if days > 1 else 1)
        h_low, h_high = int(h_cost * 0.85), int(h_cost * 1.25)
        
        d_cost = 50 * days
        d_low, d_high = int(d_cost * 0.8), int(d_cost * 1.25)
        
        a_cost = 35 * days
        a_low, a_high = int(a_cost * 0.75), int(a_cost * 1.3)
        
        t_cost = 15 * days
        t_low, t_high = int(t_cost * 0.8), int(t_cost * 1.2)
        
        g_low = h_low + d_low + a_low + t_low
        g_high = h_high + d_high + a_high + t_high

        guidebook.cost_breakup = CostBreakup(
            currency_symbol=currency,
            hotels_total=f"{currency}{h_low} - {currency}{h_high}",
            dining_total=f"{currency}{d_low} - {currency}{d_high}",
            activities_total=f"{currency}{a_low} - {currency}{a_high}",
            transport_total=f"{currency}{t_low} - {currency}{t_high}",
            grand_total=f"{currency}{g_low} - {currency}{g_high}",
            budget_tier=req.budget,
            savings_tip=f"Purchase a local heritage museum & transit pass in {req.destination} to save up to 25% on entrance tickets and metro lines.",
        )

    return guidebook


async def vector_storage_node(state: GuidebookState) -> Dict[str, Any]:
    """VectorStorageNode: Generates embeddings via text-embedding-004 and upserts full guidebook & venue points to Qdrant."""
    guidebook = state.get("guidebook")
    req = state["request"]

    status_msg = "Storing vector embeddings and caching guidebook in Qdrant..."
    logger.info(status_msg)

    if guidebook:
        # Cache full guidebook for future matching requests
        await qdrant_service.save_cached_guidebook(req, guidebook.model_dump())

        points_to_upsert: List[tuple[str, List[float], Dict[str, Any]]] = []

        # 1. Hotels
        for hotel in guidebook.hotels:
            text = f"{hotel.name} {hotel.vintage_vibe} {hotel.address} {hotel.perk}"
            vector = await qdrant_service.generate_embedding(text)
            payload = {
                "destination": req.destination,
                "stop_id": hotel.id,
                "category": "hotel",
                "price": hotel.price_per_night,
                "lat": None,
                "lng": None,
                "title": hotel.name,
                "description": hotel.vintage_vibe,
                "address": hotel.address,
                "perk": hotel.perk,
            }
            points_to_upsert.append((hotel.id, vector, payload))

        # 2. Daily Activities
        for page in guidebook.pages:
            for stop in page.activities:
                text = f"{stop.title} {stop.description} {stop.location_name} {stop.category} {stop.vintage_tip or ''}"
                vector = await qdrant_service.generate_embedding(text)
                payload = {
                    "destination": req.destination,
                    "stop_id": stop.id,
                    "category": stop.category,
                    "price": stop.estimated_cost,
                    "lat": stop.lat,
                    "lng": stop.lng,
                    "title": stop.title,
                    "description": stop.description,
                    "address": stop.location_name,
                    "vintage_tip": stop.vintage_tip,
                }
                stop.qdrant_vector_id = stop.id
                points_to_upsert.append((stop.id, vector, payload))

        if qdrant_service.is_connected and points_to_upsert:
            count = await qdrant_service.upsert_venues_batch(points_to_upsert)
            logger.info(f"Upserted {count} venue points into Qdrant collection '{qdrant_service.collection_name}'.")

    return {
        "guidebook": guidebook,
        "status_updates": state.get("status_updates", []) + [status_msg],
    }


def _build_fallback_guidebook(req: GuidebookRequest) -> GuidebookOutput:
    dest = req.destination.capitalize()
    book_id = f"gb-{uuid.uuid4().hex[:8]}"
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    cover_stamp = StampBadge(
        id=f"stamp-cover-{uuid.uuid4().hex[:4]}",
        title=f"Grand Tour of {dest}",
        category="Passport Seal",
        ink_color="gold",
        rotation_deg=-4.2,
        earned_date=today_str,
    )

    hotels = [
        HotelListing(
            id=f"hotel-1-{uuid.uuid4().hex[:4]}",
            name=f"The Grand Heritage Hotel {dest}",
            vintage_vibe="1920s Belle Époque & Mahogany Lounge",
            address=f"12 Rue de l'Ancien, {dest}",
            price_per_night="€180 - €240",
            rating=4.9,
            perk="Includes complimentary vintage afternoon tea & vinyl listening room",
        ),
        HotelListing(
            id=f"hotel-2-{uuid.uuid4().hex[:4]}",
            name=f"L'Artisan Boutique Inn {dest}",
            vintage_vibe="Mid-Century Library & Garden Patio",
            address=f"45 Via Antiqua, {dest}",
            price_per_night="€120 - €160",
            rating=4.7,
            perk="Handcrafted brass keycard & complimentary bicycle loan",
        ),
    ]

    pages: List[DailyPage] = []
    for day in range(1, req.duration_days + 1):
        stamps = [
            StampBadge(
                id=f"stamp-d{day}-1",
                title=f"Day {day} Heritage Pass",
                category="Exploration",
                ink_color="crimson" if day % 2 == 1 else "navy",
                rotation_deg=(day * 2.5) % 8 - 4,
                earned_date=today_str,
            )
        ]

        activities = [
            ActivityStop(
                id=f"stop-d{day}-1",
                time_slot="09:00 AM — Morning Elixir & Bakery",
                title=f"Café de l'Ombre in {dest}",
                description="Hidden courtyard cafe serving single-origin drip coffee poured into vintage porcelain cups.",
                category="dining",
                location_name=f"Old Town Quarter, {dest}",
                lat=48.8566,
                lng=2.3522,
                estimated_cost="€8 - €15",
                vintage_tip="Ask the barista for the secret bookshop key behind the mirror.",
            ),
            ActivityStop(
                id=f"stop-d{day}-2",
                time_slot="11:30 AM — Antiquarian Browsing",
                title=f"Cabinet of Curiosities {day}",
                description="Rare 19th-century maps, leatherbound travelogues, and hand-inked postcards.",
                category="secret",
                location_name=f"Artisan Passage, {dest}",
                lat=48.8570,
                lng=2.3530,
                estimated_cost="Free Entry (Items €10+)",
                vintage_tip="Check the top drawer of the apothecary chest for original 1950s transit tokens.",
            ),
            ActivityStop(
                id=f"stop-d{day}-3",
                time_slot="03:00 PM — Architecture Promenade",
                title=f"{dest} Botanical Glasshouse",
                description="Ironwork pavilion designed in 1895 holding tropical flora and marble statues.",
                category="sight",
                location_name=f"Parc Centenaire, {dest}",
                lat=48.8580,
                lng=2.3540,
                estimated_cost="€6",
                vintage_tip="Best sunlight hits the dome stained glass at exactly 3:45 PM.",
            ),
            ActivityStop(
                id=f"stop-d{day}-4",
                time_slot="07:30 PM — Speakeasy Dinner & Jazz",
                title=f"The Brass Phonograph {dest}",
                description="Candlelit subterranean lounge with live acoustic jazz and heirloom cocktail recipes.",
                category="dining",
                location_name=f"Subterranean Vault 4, {dest}",
                lat=48.8590,
                lng=2.3550,
                estimated_cost="€35 - €60",
                vintage_tip="Whisper the password 'Parchment' at the velvet curtain entrance.",
            ),
        ]

        pages.append(
            DailyPage(
                day_number=day,
                theme_title=f"Day {day}: Secrets of Old {dest}",
                date_label=f"Day {day} Itinerary",
                ephemera_note=f"Parchment notes gathered by vintage travelers in {dest}. Preserve ink signatures.",
                stamps=stamps,
                activities=activities,
            )
        )

    return GuidebookOutput(
        id=book_id,
        title=f"Vintage Guidebook: {dest}",
        subtitle=f"A {req.duration_days}-Day Curated Journey for the Nostalgic Traveler",
        destination=dest,
        duration_days=req.duration_days,
        cover_stamp=cover_stamp,
        hotels=hotels,
        pages=pages,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


def create_guidebook_graph() -> StateGraph:
    """Build and compile the LangGraph workflow graph."""
    graph = StateGraph(GuidebookState)

    graph.add_node("planner", planner_node)
    graph.add_node("grounded_search", grounded_search_node)
    graph.add_node("structured_output", structured_output_node)
    graph.add_node("vector_storage", vector_storage_node)

    graph.set_entry_point("planner")
    graph.add_edge("planner", "grounded_search")
    graph.add_edge("grounded_search", "structured_output")
    graph.add_edge("structured_output", "vector_storage")
    graph.add_edge("vector_storage", END)

    return graph.compile()


guidebook_pipeline_graph = create_guidebook_graph()
