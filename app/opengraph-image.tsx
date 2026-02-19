import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoData = readFileSync(join(process.cwd(), "public/logo.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <img
          src={logoBase64}
          width={420}
          height={108}
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            color: "#64748b",
            fontSize: 30,
            margin: 0,
            fontFamily: "sans-serif",
          }}
        >
          Blog sobre desenvolvimento web moderno
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
