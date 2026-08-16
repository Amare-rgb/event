import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Prisma CLI (db push / migrate) ቀጥታ ከዳታቤዙ ጋር እንዲገናኝ DIRECT_URL ይጠቀማል
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_3zrUvyh5niuE@ep-wispy-violet-ayzvuscr.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});