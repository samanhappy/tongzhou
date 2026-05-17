import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    watch: false,
    projects: [
      {
        test: {
          name: "sqlite",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/**/*.pg.test.ts"],
          environment: "node",
          globals: true,
          setupFiles: ["./tests/setup/sqlite-env.ts"],
        },
      },
      {
        test: {
          name: "postgres",
          include: ["tests/**/*.pg.test.ts"],
          environment: "node",
          globals: true,
          setupFiles: ["./tests/setup/postgres-env.ts"],
        },
      },
    ],
  },
});
