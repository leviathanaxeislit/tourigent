import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#22382c",
          borderRadius: "50%",
          border: "2px solid #b8860b",
          color: "#b8860b",
          fontSize: 18,
          fontWeight: "bold",
          fontFamily: "serif",
        }}
      >
        ▲
      </div>
    ),
    { ...size }
  )
}
