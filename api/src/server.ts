// 同舟 · Fastify 服务器装配
//
// 启动顺序：
//   1. 初始化 adapters（DB / Cache / Storage） — 出错直接终止
//   2. 注册公共中间件（CORS, multipart, 静态文件, error handler, tenant hook）
//   3. 注册各模块路由

import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastify, { type FastifyInstance } from "fastify";
import path from "node:path";
import fs from "node:fs";
import { config } from "./env.js";
import { initDb } from "./db/index.js";
import { initCache } from "./cache/index.js";
import { initStorage } from "./storage/index.js";
import { registerErrorHandler } from "./middleware/error.js";
import { registerTenantHook } from "./middleware/tenant.js";
import { registerTenantRoutes } from "./modules/tenants/routes.js";
import { registerTrackRoutes } from "./modules/tracks/routes.js";
import { registerLessonRoutes } from "./modules/lessons/routes.js";
import { registerMemberRoutes } from "./modules/members/routes.js";
import { registerUsageRoutes } from "./modules/usage/routes.js";
import { registerUploadRoutes } from "./modules/uploads/routes.js";
import { registerPublicRoutes } from "./modules/public/routes.js";

export async function buildServer(): Promise<FastifyInstance> {
  await initDb();
  await initCache();
  await initStorage();

  const app = fastify({
    logger: { level: config.logLevel },
    bodyLimit: 50 * 1024 * 1024, // 50 MB for non-multipart bodies
  });

  await app.register(fastifyCors, {
    origin: config.corsOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  });

  await app.register(fastifyMultipart, {
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  });

  registerErrorHandler(app);
  registerTenantHook(app);

  // 健康检查
  app.get("/api/healthz", async () => ({
    ok: true,
    drivers: {
      db: (await import("./db/index.js")).getDb().driver,
      cache: (await import("./cache/index.js")).getCache().driver,
      storage: (await import("./storage/index.js")).getStorage().driver,
    },
    time: new Date().toISOString(),
  }));

  // 本地存储的静态文件路由（Storage.driver=local 时）
  if (config.storage.driver === "local") {
    app.get<{ Params: { "*": string } }>("/files/*", async (req, reply) => {
      const rel = req.params["*"];
      const abs = path.join(path.resolve(config.storage.localDir), rel);
      if (!abs.startsWith(path.resolve(config.storage.localDir))) {
        return reply.code(400).send({ error: "bad path" });
      }
      if (!fs.existsSync(abs)) return reply.code(404).send({ error: "not found" });
      const stream = fs.createReadStream(abs);
      return reply.send(stream);
    });
  }

  // 各模块
  await registerTenantRoutes(app);
  await registerTrackRoutes(app);
  await registerLessonRoutes(app);
  await registerMemberRoutes(app);
  await registerUsageRoutes(app);
  await registerUploadRoutes(app);
  await registerPublicRoutes(app);

  return app;
}
