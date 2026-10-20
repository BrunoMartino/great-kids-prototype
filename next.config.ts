import type { NextConfig } from "next";

const distDirEnv: string | undefined = process.env.NEXT_DIST_DIR;
const distDir: string =
  distDirEnv !== undefined && distDirEnv !== "" ? distDirEnv : ".next";

const nextConfig: NextConfig = {
  distDir,
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/*": ["./db/migrations/**/*"],
  },
};

export default nextConfig;
