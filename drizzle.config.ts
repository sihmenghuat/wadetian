import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("No process.env.DATABASE_URL found");
}

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
});
