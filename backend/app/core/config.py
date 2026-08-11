from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-lite-latest"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "travel_venues"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
