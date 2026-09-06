import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1714",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: -6,
          }}
        >
          <span
            style={{
              color: "#fafbfa",
              fontSize: 92,
              fontWeight: 300,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              letterSpacing: -6,
              lineHeight: 1,
            }}
          >
            H
          </span>
          <span
            style={{
              color: "#fafbfa",
              fontSize: 92,
              fontWeight: 800,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              letterSpacing: -6,
              lineHeight: 1,
            }}
          >
            W
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 36,
            right: 36,
            height: 8,
            background: "#9a5b3c",
            borderRadius: 4,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
