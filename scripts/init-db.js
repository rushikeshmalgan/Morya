const { Client } = require("pg");
const { execSync } = require("child_process");
require("dotenv").config();

async function main() {
  console.log("Generating PostgreSQL DDL schema...");
  const sql = execSync("npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script", {
    encoding: "utf-8",
  });

  console.log("Connecting to Neon DB...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected! Applying DDL to Neon DB...");

  await client.query(sql);
  console.log("✅ Schema successfully applied to Neon DB!");

  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
