import json
import logging
from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse

from app.graph.builder import guidebook_pipeline_graph
from app.schemas.guidebook import (
    ActivityStop,
    GuidebookOutput,
    GuidebookRequest,
    SwapStopRequest,
    SwapStopResponse,
)

from app.services.swapper import register_guidebook_session, swapper_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/guidebook", tags=["Guidebook"])


async def sse_event_generator(
    guidebook_req: GuidebookRequest,
) -> AsyncGenerator[str, None]:
    """Generates Server-Sent Events (SSE) streaming execution updates and final guidebook."""
    initial_state = {
        "request": guidebook_req,
        "search_queries": [],
        "grounded_raw_content": "",
        "guidebook": None,
        "status_updates": [],
    }

    try:
        final_guidebook: GuidebookOutput | None = None

        async for event in guidebook_pipeline_graph.astream(initial_state):
            for node_name, state_update in event.items():
                status_updates = state_update.get("status_updates", [])
                if status_updates:
                    latest_msg = status_updates[-1]
                    payload = json.dumps(
                        {"status": "processing", "node": node_name, "message": latest_msg}
                    )
                    yield f"event: status\ndata: {payload}\n\n"

                if "guidebook" in state_update and state_update["guidebook"] is not None:
                    final_guidebook = state_update["guidebook"]

        if final_guidebook:
            register_guidebook_session(final_guidebook.model_dump())
            guidebook_json = final_guidebook.model_dump_json()
            yield f"event: complete\ndata: {guidebook_json}\n\n"
        else:
            err_payload = json.dumps(
                {"status": "error", "message": "Failed to generate guidebook"}
            )
            yield f"event: error\ndata: {err_payload}\n\n"

    except Exception as e:
        logger.error(f"SSE pipeline streaming exception: {e}")
        err_payload = json.dumps({"status": "error", "message": str(e)})
        yield f"event: error\ndata: {err_payload}\n\n"


@router.post(
    "/generate",
    status_code=status.HTTP_201_CREATED,
)
async def generate_guidebook(
    request_data: GuidebookRequest,
    http_req: Request,
    stream: bool = Query(
        default=False, description="Stream LangGraph pipeline progress via Server-Sent Events (SSE)"
    ),
):
    accept_header = http_req.headers.get("accept", "")
    is_sse_requested = stream or "text/event-stream" in accept_header

    if is_sse_requested:
        return StreamingResponse(
            sse_event_generator(request_data),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    try:
        initial_state = {
            "request": request_data,
            "search_queries": [],
            "grounded_raw_content": "",
            "guidebook": None,
            "status_updates": [],
        }

        final_state = await guidebook_pipeline_graph.ainvoke(initial_state)
        guidebook: GuidebookOutput | None = final_state.get("guidebook")

        if not guidebook:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Graph execution completed without producing a valid guidebook.",
            )

        register_guidebook_session(guidebook.model_dump())
        return guidebook
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate guidebook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate vintage guidebook: {str(e)}",
        )


@router.post("/swap-stop", response_model=SwapStopResponse)
async def swap_stop(request: SwapStopRequest) -> SwapStopResponse:
    try:
        return await swapper_service.swap_activity_stop(request)
    except Exception as e:
        logger.error(f"Error in swap_stop endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to swap venue stop: {str(e)}",
        )
