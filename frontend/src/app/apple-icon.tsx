import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
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
          background: "#22382c",
          borderRadius: "36px",
          border: "8px solid #b8860b",
          color: "#f5f0eb",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 72, color: "#b8860b", marginBottom: -10 }}>▲</div>
        <div style={{ fontSize: 24, fontWeight: "bold", color: "#f5f0eb", letterSpacing: 2 }}>
          TOURIGENT
        </div>
      </div>
    ),
    { ...size }
  )
}
