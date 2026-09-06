import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "#1a1714",
          borderRadius: 7,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            marginTop: -1,
          }}
        >
          <span
            style={{
              color: "#fafbfa",
              fontSize: 17,
              fontWeight: 300,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              letterSpacing: -1.2,
              lineHeight: 1,
            }}
          >
            H
          </span>
          <span
            style={{
              color: "#fafbfa",
              fontSize: 17,
              fontWeight: 800,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              letterSpacing: -1.2,
              lineHeight: 1,
            }}
          >
            W
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 5,
            left: 7,
            right: 7,
            height: 2,
            background: "#9a5b3c",
            borderRadius: 1,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
