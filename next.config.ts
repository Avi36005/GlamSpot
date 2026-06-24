import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Helper for recursive directory copying
function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Stage files during build
try {
  let siteId = "glamspot-mumbai";
  try {
    const firebaseJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase.json"), "utf8"));
    if (firebaseJson.hosting?.site) {
      siteId = firebaseJson.hosting.site;
    }
  } catch (e) {
    // fallback
  }

  const srcPrisma = path.join(process.cwd(), "prisma");
  const destPrisma = path.join(process.cwd(), `.firebase/${siteId}/functions/prisma`);
  copyDir(srcPrisma, destPrisma);
  
  const srcGenerated = path.join(process.cwd(), "src/generated");
  const destGenerated = path.join(process.cwd(), `.firebase/${siteId}/functions/src/generated`);
  copyDir(srcGenerated, destGenerated);
  
  console.log(`[Prisma Staging] Staged prisma and generated client for Firebase deployment to site: ${siteId}`);
} catch (err: any) {
  console.log("[Prisma Staging] Staging target not ready yet:", err.message);
}

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  images: {
    // Serve images directly from source (Google Places / Unsplash / Cloudinary CDNs)
    // instead of routing every image through the Next optimizer on a single Cloud Run
    // instance. Fixes (a) broken images — Places photo URLs 302-redirect to
    // lh3.googleusercontent.com which the optimizer won't follow (HTTP 400) — and
    // (b) lag from CPU-bound on-demand optimization in the SSR function.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  outputFileTracingIncludes: {
    '/**/*': [
      './src/generated/prisma/**/*',
      './prisma/**/*',
    ],
  },
};

export default nextConfig;
