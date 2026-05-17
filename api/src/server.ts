// 同舟 · Fastify 服务器装配

import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import fastify, { type FastifyInstance } from "fastify";
import path from "node:path";
import fs from "node:fs";
import { config } from "./env.js";
import { getDb, initDb } from "./db/index.js";
import { getCache, initCache } from "./cache/index.js";
import { getStorage, initStorage } from "./storage/index.js";
import { getVideo, initVideo } from "./video/index.js";
import { registerErrorHandler } from "./middleware/error.js";
import { registerTenantHook } from "./middleware/tenant.js";
import { registerTenantRoutes } from "./modules/tenants/routes.js";
import { registerTrackRoutes } from "./modules/tracks/routes.js";
import { registerLessonRoutes } from "./modules/lessons/routes.js";
import { registerMemberRoutes } from "./modules/members/routes.js";
import { registerUsageRoutes } from "./modules/usage/routes.js";
import { registerUploadRoutes } from "./modules/uploads/routes.js";
import { registerPublicRoutes } from "./modules/public/routes.js";
import { registerAuthRoutes } from "./modules/auth/routes.js";

export async function buildServer(): Promise<FastifyInstance> {
  await initDb();
  await initCache();
  await initStorage();
  await initVideo();

  const app = fastify({
    logger: { level: config.logLevel },
    bodyLimit: 50 * 1024 * 1024,
  });

  await app.register(fastifyCookie);

  await app.register(fastifyCors, {
    origin: config.corsOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  });

  await app.register(fastifyMultipart, {
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  });

  registerErrorHandler(app);
  registerTenantHook(app);

  app.get("/api/healthz", async () => ({
    ok: true,
    drivers: {
      db: getDb().driver,
      cache: getCache().driver,
      storage: getStorage().driver,
      video: getVideo().driver,
    },
    time: new Date().toISOString(),
  }));

  // 本地存储静态路由(STORAGE_DRIVER=local 时)
  if (config.storage.driver === "local") {
    app.get<{ Params: { "*": string } }>("/files/*", async (req, reply) => {
      const rel = req.params["*"];
      const abs = path.join(path.resolve(config.storage.localDir), rel);
      if (!abs.startsWith(path.resolve(config.storage.localDir))) {
        return reply.code(400).send({ error: "bad path" });
      }
      if (!fs.existsSync(abs))
        return reply.code(404).send({ error: "not found" });
      const stream = fs.createReadStream(abs);
      return reply.send(stream);
    });
  }

  await registerTenantRoutes(app);
  await registerAuthRoutes(app);
  await registerTrackRoutes(app);
  await registerLessonRoutes(app);
  await registerMemberRoutes(app);
  await registerUsageRoutes(app);
  await registerUploadRoutes(app);
  await registerPublicRoutes(app);

  return app;
}
