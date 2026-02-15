// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts", // スキーマファイルの場所
  out: "./migrations",           // SQLファイルの出力先
  dialect: "sqlite",           // D1は内部的にSQLite
  driver: "d1-http",           // D1を使用するための指定
});