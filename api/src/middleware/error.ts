// 统一错误处理：业务抛 HttpError，其余 500

import type { FastifyInstance } from "fastify";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, req, reply) => {
    if (err instanceof HttpError) {
      return reply
        .code(err.status)
        .send({ error: err.message, details: err.details });
    }
    req.log.error({ err }, "unhandled");
    return reply.code(500).send({ error: err.message || "internal error" });
  });
}
