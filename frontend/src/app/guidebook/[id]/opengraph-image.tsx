import { ImageResponse } from "next/og"


export const alt = "Shared Tourigent Travel Guidebook"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

export default async function GuidebookOGImage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let destination = "Historic Destination"
  let title = "Vintage Travel Guidebook"
  let durationDays = 3

  try {
    const res = await fetch(`${API_BASE_URL}/guidebook/${id}`)
    if (res.ok) {
      const data = await res.json()
      if (data.destination) destination = data.destination
      if (data.title) title = data.title
      if (data.duration_days) durationDays = data.duration_days
    }
  } catch (err) {
    console.warn("Could not fetch guidebook details for OG image:", err)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f0eb",
          backgroundImage: "radial-gradient(#b8860b 0.75px, transparent 0.75px)",
          backgroundSize: "24px 24px",
          padding: "40px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Outer Ledger Border */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "8px solid #b8860b",
            backgroundColor: "#f4efe6",
            padding: "36px",
            borderRadius: "4px",
            position: "relative",
          }}
        >
          {/* Passport Rubber Stamp Badge */}
          <div
            style={{
              position: "absolute",
              top: "28px",
              right: "32px",
              border: "3px solid #9e472a",
              color: "#9e472a",
              padding: "8px 20px",
              borderRadius: "2px",
              fontSize: "16px",
              fontWeight: "bold",
              letterSpacing: "3px",
              transform: "rotate(6deg)",
              backgroundColor: "rgba(158, 71, 42, 0.08)",
            }}
          >
            PASSPORT STAMP VERIFIED
          </div>

          {/* Pine Wax Seal */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              backgroundColor: "#22382c",
              border: "4px solid #b8860b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b8860b",
              fontSize: "44px",
              marginBottom: "16px",
            }}
          >
            ▲
          </div>

          <div
            style={{
              fontSize: "18px",
              color: "#9e472a",
              letterSpacing: "4px",
              fontWeight: "bold",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            TOURIGENT VINTAGE LEDGER
          </div>

          {/* Main Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: "bold",
              color: "#2d3130",
              textAlign: "center",
              marginBottom: "12px",
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>

          {/* Destination Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              backgroundColor: "#22382c",
              color: "#f5f0eb",
              padding: "10px 28px",
              borderRadius: "4px",
              border: "2px solid #b8860b",
              fontSize: "22px",
              fontWeight: "bold",
              marginTop: "16px",
            }}
          >
            <span>📍 {destination.toUpperCase()}</span>
            <span>•</span>
            <span>🗓️ {durationDays} DAYS EXPEDITION</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
