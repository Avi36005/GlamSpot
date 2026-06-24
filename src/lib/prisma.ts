import { PrismaClient } from "../generated/prisma";
import fs from "fs";
import path from "path";

const runtimeProcess = process;
let databaseUrl = runtimeProcess.env.DATABASE_URL || "file:./dev.db";

if (runtimeProcess.env.K_SERVICE) {
  try {
    console.error("[Prisma Runtime Sync] Starting sync on Cloud Run...");

    // Create /tmp directories
    const tmpEngineDir = "/tmp/prisma-engines";
    if (!fs.existsSync(tmpEngineDir)) {
      fs.mkdirSync(tmpEngineDir, { recursive: true });
    }

    // Find the engine binary.
    const engineFileName = "libquery_engine-debian-openssl-3.0.x.so.node";
    const possibleEnginePaths = [
      path.join(process.cwd(), "src/generated/prisma", engineFileName),
      path.join(process.cwd(), ".next/standalone/src/generated/prisma", engineFileName),
      path.join("/workspace/src/generated/prisma", engineFileName),
      path.join("/workspace/.next/standalone/src/generated/prisma", engineFileName),
    ];

    let engineSrcPath = "";
    for (const p of possibleEnginePaths) {
      if (fs.existsSync(p)) {
        engineSrcPath = p;
        break;
      }
    }

    const engineDestPath = path.join(tmpEngineDir, engineFileName);
    if (engineSrcPath) {
      console.error(`[Prisma Runtime Sync] Found engine at ${engineSrcPath}. Copying to ${engineDestPath}...`);
      if (!fs.existsSync(engineDestPath)) {
        fs.copyFileSync(engineSrcPath, engineDestPath);
        fs.chmodSync(engineDestPath, 0o755);
        console.error(`[Prisma Runtime Sync] Copied and set permissions for engine.`);
      } else {
        console.error(`[Prisma Runtime Sync] Engine already exists at dest.`);
      }
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = engineDestPath;
      console.error(`[Prisma Runtime Sync] Set PRISMA_QUERY_ENGINE_LIBRARY to ${engineDestPath}`);
    } else {
      console.error(`[Prisma Runtime Sync] ERROR: Engine binary not found in any of the expected paths: ${possibleEnginePaths.join(", ")}`);
    }

    // Find the sqlite database.
    const dbFileName = "dev.db";
    const possibleDbPaths = [
      path.join(process.cwd(), "prisma", dbFileName),
      path.join(process.cwd(), ".next/standalone/prisma", dbFileName),
      path.join("/workspace/prisma", dbFileName),
      path.join("/workspace/.next/standalone/prisma", dbFileName),
    ];

    let dbSrcPath = "";
    for (const p of possibleDbPaths) {
      if (fs.existsSync(p)) {
        dbSrcPath = p;
        break;
      }
    }

    const dbDestPath = "/tmp/dev.db";
    if (dbSrcPath) {
      console.error(`[Prisma Runtime Sync] Found database template at ${dbSrcPath}. Copying to ${dbDestPath}...`);
      if (!fs.existsSync(dbDestPath)) {
        fs.copyFileSync(dbSrcPath, dbDestPath);
        console.error(`[Prisma Runtime Sync] Copied database template.`);
      } else {
        console.error(`[Prisma Runtime Sync] Database already exists at dest.`);
      }
      databaseUrl = `file:${dbDestPath}`;
    } else {
      console.error(`[Prisma Runtime Sync] ERROR: Database template not found in any of the expected paths: ${possibleDbPaths.join(", ")}`);
    }

  } catch (err: any) {
    console.error("[Prisma Runtime Sync] Exception during sync:", err.stack || err.message);
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

