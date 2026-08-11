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
