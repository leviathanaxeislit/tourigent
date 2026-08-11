import logging
import uuid
from typing import Dict, Optional

from google import genai

from app.core.config import settings
from app.db.qdrant import qdrant_service
from app.schemas.guidebook import ActivityStop, SwapStopRequest, SwapStopResponse

logger = logging.getLogger(__name__)

# Session cache storing active guidebooks in memory
_active_guidebooks: Dict[str, dict] = {}


def register_guidebook_session(guidebook_data: dict) -> None:
    """Store or update active guidebook payload in session memory."""
    guidebook_id = guidebook_data.get("id")
    if guidebook_id:
        _active_guidebooks[guidebook_id] = guidebook_data


def get_guidebook_session(guidebook_id: str) -> Optional[dict]:
    """Retrieve guidebook payload from session memory."""
    return _active_guidebooks.get(guidebook_id)


class SwapperService:
    def __init__(self) -> None:
        self.genai_client: Optional[genai.Client] = None
        if settings.GEMINI_API_KEY:
            try:
                self.genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.warning(f"Could not initialize GenAI client in SwapperService: {e}")

    async def swap_activity_stop(
        self, request: SwapStopRequest, destination: Optional[str] = None
    ) -> SwapStopResponse:
        """
        Granularly replaces a single ActivityStop using Gemini 768-dim embeddings
        and Qdrant vector similarity search, with Grounded Gemini Flash generation as fallback.
        """
        logger.info(
            f"Processing swap request for guidebook '{request.guidebook_id}', Day {request.day_number}, Stop '{request.stop_id}' with reason: '{request.reason}'"
        )

        session_guidebook = get_guidebook_session(request.guidebook_id)
        target_destination = destination
        if session_guidebook and not target_destination:
            target_destination = session_guidebook.get("destination", "Paris")

        reason_text = (
            request.reason.strip()
            if request.reason and request.reason.strip()
            else "Curated alternative vintage venue stop"
        )

        # 1. Convert reason into 768-dim query vector using Gemini embeddings
        query_vector = await qdrant_service.generate_embedding(reason_text)

        # 2. Search Qdrant vector store filtering by destination
        similar_venues = await qdrant_service.search_similar_venues(
            query_vector=query_vector,
            destination=target_destination,
            limit=5,
        )

        new_stop: Optional[ActivityStop] = None

        # Filter out current stop_id from search results to avoid returning the exact same venue
        candidate_venues = [
            v for v in similar_venues if v.get("stop_id") != request.stop_id
        ]

        if candidate_venues:
            chosen = candidate_venues[0]
            new_stop = ActivityStop(
                id=f"stop-qdrant-{uuid.uuid4().hex[:6]}",
                time_slot="Updated Time Slot",
                title=chosen.get("title", "Alternative Vintage Venue"),
                description=chosen.get(
                    "description", "Curated replacement venue from vector memory."
                ),
                category=chosen.get("category", "sight"),
                location_name=chosen.get("address", target_destination or "City Center"),
                lat=chosen.get("lat"),
                lng=chosen.get("lng"),
                estimated_cost=chosen.get("price", "€15 - €30"),
                vintage_tip=chosen.get("vintage_tip", "Recommended by Tourigent ledger."),
                qdrant_vector_id=chosen.get("stop_id"),
            )
            logger.info(f"Retrieved replacement venue '{new_stop.title}' from Qdrant vector search.")

        # 3. Fallback generation using Gemini Flash if Qdrant yields no match
        if not new_stop:
            new_stop = await self._generate_gemini_replacement(
                destination=target_destination or "Paris",
                reason=reason_text,
            )

        # 4. Replace ONLY that specific ActivityStop in session payload
        if session_guidebook and "pages" in session_guidebook:
            for page in session_guidebook["pages"]:
                if page.get("day_number") == request.day_number:
                    activities = page.get("activities", [])
                    for idx, stop in enumerate(activities):
                        stop_id = stop.get("id") if isinstance(stop, dict) else getattr(stop, "id", None)
                        if stop_id == request.stop_id:
                            new_stop.time_slot = (
                                stop.get("time_slot", "02:00 PM")
                                if isinstance(stop, dict)
                                else getattr(stop, "time_slot", "02:00 PM")
                            )
                            if isinstance(stop, dict):
                                page["activities"][idx] = new_stop.model_dump()
                            else:
                                page["activities"][idx] = new_stop
                            break

        return SwapStopResponse(
            updated_stop=new_stop,
            message=f"Successfully replaced venue stop on Day {request.day_number}.",
        )

    async def _generate_gemini_replacement(
        self, destination: str, reason: str
    ) -> ActivityStop:
        """Invokes Gemini Flash to generate an authentic alternative venue matching requested reason."""
        if self.genai_client:
            try:
                prompt = f"""Generate a single replacement travel venue stop in {destination} matching this user preference: "{reason}".
Return strictly valid JSON matching this structure:
{{
  "title": "Venue Title",
  "description": "Vivid historical or vintage description",
  "category": "dining | sight | secret | workshop | architecture",
  "location_name": "Neighborhood or street address",
  "estimated_cost": "Cost estimation e.g. €10 - €20",
  "vintage_tip": "Insider handwritten margin note tip"
}}"""
                model_name = settings.GEMINI_MODEL or "gemini-flash-lite-latest"
                resp_text = None
                try:
                    interaction = self.genai_client.interactions.create(
                        model=model_name,
                        input=prompt,
                    )
                    resp_text = interaction.output_text
                except Exception:
                    try:
                        response = self.genai_client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                        )
                        resp_text = response.text
                    except Exception:
                        pass

                if resp_text:
                    cleaned_text = resp_text.strip()
                    if cleaned_text.startswith("```json"):
                        cleaned_text = cleaned_text[7:]
                    if cleaned_text.endswith("```"):
                        cleaned_text = cleaned_text[:-3]

                    import json
                    data = json.loads(cleaned_text.strip())
                    return ActivityStop(
                        id=f"stop-gemini-{uuid.uuid4().hex[:6]}",
                        time_slot="Alternative Slot",
                        title=data.get("title", "Curated Vintage Gem"),
                        description=data.get("description", "Authentic historic replacement venue."),
                        category=data.get("category", "secret"),
                        location_name=data.get("location_name", f"{destination} Historic District"),
                        estimated_cost=data.get("estimated_cost", "€15 - €25"),
                        vintage_tip=data.get("vintage_tip", "Recommended alternative stop."),
                    )
            except Exception as e:
                logger.error(f"Gemini replacement generation error: {e}")

        # Static fallback
        return ActivityStop(
            id=f"stop-fallback-{uuid.uuid4().hex[:6]}",
            time_slot="Alternative Slot",
            title="La Galerie Clandestine",
            description=f"Hidden courtyard salon in {destination} featuring local vintage art and tea tasting.",
            category="secret",
            location_name=f"{destination} Central Quarter",
            estimated_cost="€15 - €25",
            vintage_tip="Ask for the private garden entrance.",
        )


swapper_service = SwapperService()
