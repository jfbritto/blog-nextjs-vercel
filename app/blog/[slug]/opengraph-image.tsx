import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getPostBySlug } from "@/lib/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "IJR. | Think Free";
  const tag = post?.tags[0] ?? "";

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
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Barra vermelha no topo */}
        <div
          style={{
            background: "#dc2626",
            height: 10,
            width: "100%",
            borderRadius: 4,
            marginBottom: 64,
          }}
        />

        {/* Título do post */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {title}
          </p>
        </div>

        {/* Rodapé: logo + badge da tag */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <img
            src={logoBase64}
            width={200}
            height={52}
            style={{ objectFit: "contain" }}
          />
          {tag && (
            <div
              style={{
                background: "#dc2626",
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                padding: "10px 24px",
                borderRadius: 6,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {tag}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
