import logging
from typing import Any, Optional
from google import genai
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models
from app.core.config import settings

logger = logging.getLogger(__name__)


class QdrantService:
    def __init__(self) -> None:
        self.client: Optional[AsyncQdrantClient] = None
        self.collection_name: str = settings.QDRANT_COLLECTION
        self.is_connected: bool = False
        self.genai_client: Optional[genai.Client] = None

        if settings.GEMINI_API_KEY:
            try:
                self.genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.warning(f"Could not initialize GenAI client for Qdrant: {e}")

    async def connect(self) -> None:
        try:
            self.client = AsyncQdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                timeout=5.0,
            )
            await self.init_collection()
            self.is_connected = True
            logger.info("Qdrant Async client initialized successfully.")
        except Exception as e:
            self.is_connected = False
            logger.warning(
                f"Qdrant connection unavailable ({e}). Falling back to in-memory mode."
            )

    async def init_collection(self) -> None:
        if not self.client:
            return
        collections = await self.client.get_collections()
        exists = any(
            c.name == self.collection_name for c in collections.collections
        )
        if not exists:
            await self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=3072, distance=models.Distance.COSINE
                ),
            )
            logger.info(f"Created Qdrant collection: {self.collection_name}")

        # Create payload indexes for fast semantic search, city filtering, and sorting
        indexes = [
            ("destination", models.PayloadSchemaType.KEYWORD),
            ("category", models.PayloadSchemaType.KEYWORD),
            ("stop_id", models.PayloadSchemaType.KEYWORD),
            ("title", models.PayloadSchemaType.TEXT),
            ("type", models.PayloadSchemaType.KEYWORD),
            ("duration_days", models.PayloadSchemaType.INTEGER),
        ]
        for field_name, field_schema in indexes:
            try:
                await self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name=field_name,
                    field_schema=field_schema,
                )
                logger.info(f"Payload index ensured on '{field_name}' ({field_schema}).")
            except Exception as e:
                logger.debug(f"Payload index for '{field_name}' setup note: {e}")

    async def get_cached_guidebook(self, req: Any) -> Optional[dict]:
        """
        Check if a complete guidebook matching the exact user request configuration
        already exists in Qdrant Vector DB or local cache.
        """
        import hashlib
        import uuid
        dest = getattr(req, "destination", "").strip().lower()
        days = getattr(req, "duration_days", 1)
        style = getattr(req, "travel_style", "").strip().lower()
        budget = getattr(req, "budget", "").strip().lower()
        raw_interests = getattr(req, "interests", []) or []
        interests_str = ",".join(sorted([i.strip().lower() for i in raw_interests]))

        sig = f"{dest}|{days}|{style}|{budget}|{interests_str}"
        point_id = str(uuid.UUID(hex=hashlib.md5(sig.encode("utf-8")).hexdigest()))

        # Check local memory cache
        if hasattr(self, "_memory_guidebook_cache") and point_id in self._memory_guidebook_cache:
            logger.info(f"Guidebook cache HIT (in-memory) for {dest} ({days} days)!")
            return self._memory_guidebook_cache[point_id]

        if not self.is_connected or not self.client:
            return None

        try:
            # 1. Retrieve by exact point ID hash
            points = await self.client.retrieve(
                collection_name=self.collection_name,
                ids=[point_id],
                with_payload=True,
            )
            if points and points[0].payload:
                gb_data = points[0].payload.get("guidebook_dict")
                if gb_data:
                    logger.info(f"Guidebook cache HIT (Qdrant point ID) for {dest} ({days} days)!")
                    if not hasattr(self, "_memory_guidebook_cache"):
                        self._memory_guidebook_cache = {}
                    self._memory_guidebook_cache[point_id] = gb_data
                    return gb_data

            # 2. Retrieve by payload filter matching destination + duration + style
            query_filter = models.Filter(
                must=[
                    models.FieldCondition(
                        key="type", match=models.MatchValue(value="full_guidebook")
                    ),
                    models.FieldCondition(
                        key="destination", match=models.MatchValue(value=dest)
                    ),
                    models.FieldCondition(
                        key="duration_days", match=models.MatchValue(value=days)
                    ),
                ]
            )
            search_res = await self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=query_filter,
                limit=1,
                with_payload=True,
            )
            records, _ = search_res
            if records and records[0].payload:
                gb_data = records[0].payload.get("guidebook_dict")
                if gb_data:
                    logger.info(f"Guidebook cache HIT (Qdrant filter) for {dest} ({days} days)!")
                    if not hasattr(self, "_memory_guidebook_cache"):
                        self._memory_guidebook_cache = {}
                    self._memory_guidebook_cache[point_id] = gb_data
                    return gb_data
        except Exception as e:
            logger.error(f"Error querying Qdrant for cached guidebook: {e}")

        return None

    async def save_cached_guidebook(self, req: Any, guidebook_dict: dict) -> bool:
        """Store a fully generated guidebook in Qdrant and memory cache for future matching requests."""
        import hashlib
        import uuid
        dest = getattr(req, "destination", "").strip().lower()
        days = getattr(req, "duration_days", 1)
        style = getattr(req, "travel_style", "").strip().lower()
        budget = getattr(req, "budget", "").strip().lower()
        raw_interests = getattr(req, "interests", []) or []
        interests_str = ",".join(sorted([i.strip().lower() for i in raw_interests]))

        sig = f"{dest}|{days}|{style}|{budget}|{interests_str}"
        point_id = str(uuid.UUID(hex=hashlib.md5(sig.encode("utf-8")).hexdigest()))

        if not hasattr(self, "_memory_guidebook_cache"):
            self._memory_guidebook_cache = {}
        self._memory_guidebook_cache[point_id] = guidebook_dict

        if not self.is_connected or not self.client:
            return True

        try:
            embed_text = f"Full travel guidebook for {dest} {days} days style {style} budget {budget} interests {interests_str}"
            vector = await self.generate_embedding(embed_text)

            payload = {
                "type": "full_guidebook",
                "destination": dest,
                "duration_days": days,
                "travel_style": style,
                "budget": budget,
                "interests": raw_interests,
                "guidebook_dict": guidebook_dict,
            }

            await self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(id=point_id, vector=vector, payload=payload)
                ],
            )
            logger.info(f"Successfully cached full guidebook in Qdrant for {dest} ({days} days)!")
            return True
        except Exception as e:
            logger.error(f"Failed to cache full guidebook in Qdrant: {e}")
            return False

    async def search_venues_by_config(
        self,
        destination: str,
        travel_style: str = "",
        interests: Optional[list[str]] = None,
        limit: int = 15,
    ) -> list[dict[str, Any]]:
        """
        Search vector DB for cached venues matching destination and semantic travel style/interests
        before executing external AI search.
        """
        if not self.is_connected or not self.client:
            return []

        interests_str = ", ".join(interests) if interests else ""
        query_text = f"Venues and sights in {destination} style: {travel_style} interests: {interests_str}"
        query_vector = await self.generate_embedding(query_text)

        return await self.search_similar_venues(
            query_vector=query_vector,
            destination=destination,
            limit=limit,
        )

    async def generate_embedding(self, text: str) -> list[float]:
        """Generate 3072-dim vector embedding using Gemini gemini-embedding-2."""
        if not self.genai_client and settings.GEMINI_API_KEY:
            try:
                self.genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception:
                pass

        if self.genai_client:
            try:
                response = self.genai_client.models.embed_content(
                    model="gemini-embedding-2",
                    contents=text,
                )
                if hasattr(response, "embeddings") and response.embeddings:
                    return list(response.embeddings[0].values)
                elif hasattr(response, "embedding") and response.embedding:
                    return list(response.embedding.values)
            except Exception as e:
                logger.error(f"Gemini gemini-embedding-2 generation failed: {e}")

        # Deterministic pseudo-embedding fallback (3072 dimensions)
        import hashlib
        seed_hash = hashlib.md5(text.encode("utf-8")).digest()
        fallback_vec = [(seed_hash[i % len(seed_hash)] / 255.0) - 0.5 for i in range(3072)]
        return fallback_vec

    async def upsert_venue(
        self, venue_id: str, vector: list[float], payload: dict[str, Any]
    ) -> bool:
        if not self.is_connected or not self.client:
            logger.warning(
                f"Qdrant offline. Skipping upsert for venue {venue_id}"
            )
            return False
        try:
            await self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(
                        id=venue_id, vector=vector, payload=payload
                    )
                ],
            )
            return True
        except Exception as e:
            logger.error(f"Failed to upsert venue {venue_id} to Qdrant: {e}")
            return False

    async def upsert_venues_batch(
        self, points: list[tuple[str, list[float], dict[str, Any]]]
    ) -> int:
        """Upsert a batch of (venue_id, vector, payload) points into Qdrant."""
        if not self.is_connected or not self.client or not points:
            return 0
        try:
            point_structs = [
                models.PointStruct(id=vid, vector=vec, payload=pld)
                for vid, vec, pld in points
            ]
            await self.client.upsert(
                collection_name=self.collection_name,
                points=point_structs,
            )
            return len(point_structs)
        except Exception as e:
            logger.error(f"Failed batch upsert to Qdrant: {e}")
            return 0

    async def search_similar_venues(
        self,
        query_vector: list[float],
        destination: Optional[str] = None,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        if not self.is_connected or not self.client:
            logger.warning(
                "Qdrant offline. Returning empty search results fallback."
            )
            return []
        try:
            query_filter = None
            if destination:
                query_filter = models.Filter(
                    must=[
                        models.FieldCondition(
                            key="destination",
                            match=models.MatchValue(value=destination),
                        )
                    ]
                )

            results = await self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=query_filter,
                limit=limit,
            )
            return [hit.payload for hit in results if hit.payload is not None]
        except Exception as e:
            logger.error(f"Error searching Qdrant vector DB: {e}")
            return []

    async def close(self) -> None:
        if self.client:
            await self.client.close()


qdrant_service = QdrantService()
