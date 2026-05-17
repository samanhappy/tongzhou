// Uploads · Routes
//
// MVP 走「服务器中转」一条路径：前端 POST multipart 到 /api/uploads。
// V0.5 起增加 /api/uploads/sign（前端拿凭证直传 COS）,完成后回调 /api/uploads/complete。

import type { FastifyInstance } from "fastify";
import { HttpError } from "../../middleware/error.js";
import { requireTenant } from "../../middleware/tenant.js";
import { getStorage } from "../../storage/index.js";
import * as repo from "./repo.js";
import { newId } from "../../lib/id.js";

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB（V0 §V0-3）

export async function registerUploadRoutes(app: FastifyInstance) {
  app.post("/api/uploads", async (req) => {
    const t = requireTenant(req);
    const data = await req.file();
    if (!data) throw new HttpError(400, "file required (multipart)");

    const filename = data.filename || "untitled.bin";
    const mime = data.mimetype || "application/octet-stream";
    const buf = await data.toBuffer();
    if (buf.length > MAX_BYTES) {
      throw new HttpError(413, `file too large > ${MAX_BYTES} bytes`);
    }

    const key = `videos/${t.id}/${newId()}-${safeName(filename)}`;
    const obj = await getStorage().putObject({ key, body: buf, mime });
    const upload = await repo.create(t.id, {
      filename,
      mime,
      sizeBytes: obj.size,
      storageDriver: getStorage().driver,
      storageKey: obj.key,
      url: obj.url,
      phase: "ready",
    });
    return { upload };
  });

  app.post<{ Body: { filename: string; mime: string } }>(
    "/api/uploads/sign",
    async (req) => {
      const t = requireTenant(req);
      const { filename, mime } = req.body ?? {};
      if (!filename || !mime) throw new HttpError(400, "filename & mime required");
      const key = `videos/${t.id}/${newId()}-${safeName(filename)}`;
      const cred = await getStorage().sign({ key, mime, expiresSec: 600 });
      return { credential: cred };
    },
  );

  app.get("/api/uploads", async (req) => {
    const t = requireTenant(req);
    return { uploads: await repo.listByTenant(t.id) };
  });
}

function safeName(name: string) {
  return name.replace(/[^\w.-]/g, "_").slice(-120);
}
