import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necessário para o Prisma Client funcionar corretamente no Vercel (serverless)
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
