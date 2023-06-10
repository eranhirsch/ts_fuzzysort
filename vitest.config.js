import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**.test.ts"],
    exclude: ["src/__legacy"],
    globals: true,
  },
});
