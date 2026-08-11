from contextlib import asynccontextmanager
import logging
from typing import Any, AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints.guidebook import router as guidebook_router
from app.core.config import settings
from app.db.qdrant import qdrant_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Initializing Vintage Paper Guidebook API backend...")
    await qdrant_service.connect()
    yield
    logger.info("Shutting down backend and closing Qdrant connections...")
    await qdrant_service.close()


app = FastAPI(
    title="Vintage Paper Guidebook API",
    description="Backend service for generating nostalgic travel itineraries using Gemini Grounding & Qdrant Vector DB.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(guidebook_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, Any]:
    return {
        "status": "healthy",
        "qdrant_connected": qdrant_service.is_connected,
        "version": "1.0.0",
    }
