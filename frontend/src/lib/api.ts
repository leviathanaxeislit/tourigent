import { GuidebookOutput, GuidebookRequest, SwapStopRequest, SwapStopResponse } from "@/types/guidebook"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"
const HEALTH_URL = process.env.NEXT_PUBLIC_HEALTH_URL || "http://localhost:8000/health"

export interface StatusUpdate {
  status: string
  node?: string
  message: string
}

/**
 * Generates a guidebook with optional SSE status streaming updates.
 */
export async function generateGuidebook(
  request: GuidebookRequest,
  onStatus?: (update: StatusUpdate) => void
): Promise<GuidebookOutput> {
  const url = `${API_BASE_URL}/guidebook/generate?stream=${onStatus ? "true" : "false"}`

  if (onStatus) {
    return new Promise<GuidebookOutput>((resolve, reject) => {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify(request),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("ReadableStream not supported by browser/response.")
          }

          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n\n")
            buffer = lines.pop() || ""

            for (const chunk of lines) {
              const eventMatch = chunk.match(/event:\s*(\w+)/)
              const dataMatch = chunk.match(/data:\s*([\s\S]+)/)

              if (eventMatch && dataMatch) {
                const eventType = eventMatch[1]
                const dataString = dataMatch[1].trim()

                try {
                  const dataJson = JSON.parse(dataString)

                  if (eventType === "status") {
                    onStatus(dataJson)
                  } else if (eventType === "complete") {
                    resolve(dataJson as GuidebookOutput)
                    return
                  } else if (eventType === "error") {
                    reject(new Error(dataJson.message || "Pipeline processing error"))
                    return
                  }
                } catch (err) {
                  console.warn("Failed to parse SSE event payload:", err, dataString)
                }
              }
            }
          }

          reject(new Error("Stream ended without emitting a complete event."))
        })
        .catch((err) => reject(err))
    })
  }

  // Standard non-streaming HTTP POST request fallback
  const res = await fetch(`${API_BASE_URL}/guidebook/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Backend returned status ${res.status}`)
  }

  return await res.json()
}

/**
 * Swaps a specific activity stop in the active guidebook.
 */
export async function swapActivityStop(
  request: SwapStopRequest
): Promise<SwapStopResponse> {
  const res = await fetch(`${API_BASE_URL}/guidebook/swap-stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Swap failed with status ${res.status}`)
  }

  return await res.json()
}

/**
 * Health check endpoint ping.
 */
export async function checkBackendHealth(): Promise<{ status: string; qdrant_connected: boolean }> {
  const res = await fetch(HEALTH_URL)
  if (!res.ok) {
    throw new Error("Backend service unreachable")
  }
  return await res.json()
}
