#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createAgntLockServer } from "./server.js";

// ─── Main Entry Point ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const server = createAgntLockServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error: unknown) => {
  console.error("Fatal error starting AGNT-LOCK server:", error);
  process.exit(1);
});
