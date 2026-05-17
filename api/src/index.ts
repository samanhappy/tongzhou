import { buildServer } from "./server.js";
import { config } from "./env.js";

const app = await buildServer();

await app.listen({ port: config.port, host: "0.0.0.0" });

const shutdown = async (sig: string) => {
  app.log.info({ sig }, "shutting down");
  try {
    await app.close();
  } finally {
    process.exit(0);
  }
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
