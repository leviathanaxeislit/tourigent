import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Tourigent — Vintage Paper Travel Guidebook"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
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
        {/* Outer Field Ledger Card Border */}
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
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            position: "relative",
          }}
        >
          {/* Top Stamp Header */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "28px",
              border: "2px stroke #9e472a",
              color: "#9e472a",
              padding: "6px 16px",
              borderRadius: "2px",
              fontSize: "14px",
              fontWeight: "bold",
              letterSpacing: "3px",
              transform: "rotate(-4deg)",
              backgroundColor: "rgba(158, 71, 42, 0.08)",
            }}
          >
            OFFICIAL TRAVEL LEDGER
          </div>

          {/* Pine Wax Seal Emblem */}
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#22382c",
              border: "4px solid #b8860b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b8860b",
              fontSize: "48px",
              marginBottom: "20px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            ▲
          </div>

          {/* Main Title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#2d3130",
              textAlign: "center",
              letterSpacing: "2px",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            TOURIGENT
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              color: "#9e472a",
              textAlign: "center",
              letterSpacing: "1px",
              marginBottom: "28px",
              fontWeight: "600",
            }}
          >
            Interactive Vintage Paper Guidebooks & Travel Itineraries
          </div>

          {/* Features Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              borderTop: "2px dashed #b8860b",
              borderBottom: "2px dashed #b8860b",
              padding: "12px 32px",
              color: "#22382c",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <span>📜 Skeuomorphic Pages</span>
            <span>•</span>
            <span>🤖 LangGraph AI</span>
            <span>•</span>
            <span>📍 Gemini Search Grounding</span>
            <span>•</span>
            <span>🗺️ Vector DB Swapper</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
