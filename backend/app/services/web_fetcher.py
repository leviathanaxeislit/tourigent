import re
import json
import urllib.parse
import logging
import httpx
from typing import Optional, Tuple, Dict, Any, List

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


async def scrape_tripadvisor_venue_details(venue_name: str, location: str) -> Dict[str, Any]:
    """
    Directly scrapes TripAdvisor using JSON-LD & embedded web context parsing.
    Returns direct photo URLs, aggregate ratings, and review quotes.
    """
    query = f"{venue_name} {location}"
    encoded = urllib.parse.quote(query)
    search_url = f"https://www.tripadvisor.com/Search?q={encoded}"

    result: Dict[str, Any] = {
        "image_url": None,
        "rating": None,
        "review_quote": None,
        "tripadvisor_url": search_url,
    }

    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True, headers=HEADERS) as client:
            res = await client.get(search_url)
            if res.status_code == 200:
                html = res.text

                # 1. Parse embedded JSON-LD scripts (<script type="application/ld+json">)
                json_ld_matches = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
                for script_str in json_ld_matches:
                    try:
                        data = json.loads(script_str.strip())
                        if isinstance(data, list):
                            data = data[0] if data else {}
                        
                        # Extract image URL
                        if "image" in data:
                            img = data["image"]
                            if isinstance(img, list) and img:
                                result["image_url"] = img[0]
                            elif isinstance(img, str):
                                result["image_url"] = img

                        # Extract rating
                        if "aggregateRating" in data and "ratingValue" in data["aggregateRating"]:
                            result["rating"] = float(data["aggregateRating"]["ratingValue"])

                        # Extract first review text
                        if "review" in data:
                            revs = data["review"]
                            if isinstance(revs, list) and revs:
                                first_rev = revs[0]
                                if isinstance(first_rev, dict) and "reviewBody" in first_rev:
                                    result["review_quote"] = first_rev["reviewBody"]
                    except Exception:
                        continue

                # 2. Extract TripAdvisor CDN media image URLs via regex fallback
                if not result["image_url"]:
                    media_matches = re.findall(
                        r'https://media-cdn\.tripadvisor\.com/[^"\s\'>]+\.(?:jpg|jpeg|png|webp)',
                        html,
                        re.IGNORECASE,
                    )
                    if media_matches:
                        result["image_url"] = media_matches[0]
    except Exception as e:
        logger.debug(f"Direct TripAdvisor scraping note for {venue_name}: {e}")

    return result


async def fetch_live_tripadvisor_photo(venue_name: str, location: str) -> Optional[str]:
    """Helper wrapper to obtain live photo URL from TripAdvisor."""
    details = await scrape_tripadvisor_venue_details(venue_name, location)
    if details.get("image_url"):
        return details["image_url"]

    # Fallback to search scraper media match
    query = f"{venue_name} {location} site:tripadvisor.com"
    encoded = urllib.parse.quote(query)
    search_url = f"https://html.duckduckgo.com/html/?q={encoded}"

    try:
        async with httpx.AsyncClient(timeout=4.0, follow_redirects=True, headers=HEADERS) as client:
            res = await client.get(search_url)
            if res.status_code == 200:
                matches = re.findall(
                    r'https://media-cdn\.tripadvisor\.com/[^"\s\'>]+\.(?:jpg|jpeg|png|webp)',
                    res.text,
                    re.IGNORECASE,
                )
                if matches:
                    return matches[0]
    except Exception:
        pass

    return None
