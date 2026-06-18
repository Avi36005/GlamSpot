import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Copy prisma directory to firebase functions staging directory during production build
try {
  const srcPrisma = path.join(process.cwd(), "prisma");
  const destPrisma = path.join(process.cwd(), ".firebase/glamspot-mumbai/functions/prisma");
  
  if (fs.existsSync(srcPrisma)) {
    fs.mkdirSync(destPrisma, { recursive: true });
    fs.readdirSync(srcPrisma).forEach((file) => {
      const srcFile = path.join(srcPrisma, file);
      const destFile = path.join(destPrisma, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
      }
    });
    console.log("[Prisma Staging] Successfully copied prisma files to firebase functions directory.");
  }
} catch (err) {
  console.log("[Prisma Staging] Staging directory not ready yet or error occurred:", err);
}

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
    ],
  },
};

export default nextConfig;
