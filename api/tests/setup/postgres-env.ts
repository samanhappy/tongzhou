import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "tongzhou-api-vitest-postgres-"));

process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.PORT = process.env.PORT ?? "4100";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://127.0.0.1:4173";
process.env.AUTH_JWT_SECRET =
  process.env.AUTH_JWT_SECRET ?? "test-secret-with-32-plus-characters";
process.env.AUTH_DEV_MODE = "false";
process.env.CACHE_DRIVER = "memory";
process.env.STORAGE_DRIVER = "local";
process.env.STORAGE_LOCAL_DIR = path.join(root, "uploads");
process.env.STORAGE_PUBLIC_BASE = process.env.STORAGE_PUBLIC_BASE ?? "http://127.0.0.1:4100/files";
process.env.VIDEO_DRIVER = "local";

if (process.env.TEST_PG_DATABASE_URL) {
  process.env.DB_DRIVER = "postgres";
  process.env.DATABASE_URL = process.env.TEST_PG_DATABASE_URL;
}

process.on("exit", () => {
  fs.rmSync(root, { recursive: true, force: true });
});
