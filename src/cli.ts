#!/usr/bin/env node

import { AgentLockStateManager } from "./state-manager.js";

// ─── CLI Interface ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    🔐 AGNT-LOCK CLI                       ║
║         AI Agent Coordination Layer for Repos             ║
╚═══════════════════════════════════════════════════════════╝

Usage: agnt-lock <command> [options]

Commands:
  status                          Show current repo coordination state
  lock <filepath> <agent> <intent> Acquire a lock on a file
  unlock <filepath> [agent]        Release a lock on a file
  reset                           Force-release all locks
  serve                           Start the MCP server (stdio transport)

Examples:
  agnt-lock status
  agnt-lock lock src/index.ts claude-code "Refactoring auth module"
  agnt-lock unlock src/index.ts claude-code
  agnt-lock reset
  agnt-lock serve
`);
}

async function main(): Promise<void> {
  const manager = new AgentLockStateManager();

  switch (command) {
    case "status": {
      const state = manager.getRepoState();
      console.log("\n📊 AGNT-LOCK Repository State");
      console.log("━".repeat(50));
      console.log(`Session:       ${state.session_id}`);
      console.log(`Active Locks:  ${state.total_active_locks}`);
      console.log(
        `Active Agents: ${state.agents_active.length > 0 ? state.agents_active.join(", ") : "none"}`
      );

      if (state.active_locks.length > 0) {
        console.log("\n🔒 Locked Files:");
        for (const lock of state.active_locks) {
          console.log(`  • ${lock.filepath}`);
          console.log(`    Agent:   ${lock.agent_name}`);
          console.log(`    Intent:  ${lock.intent}`);
          console.log(`    Since:   ${lock.acquired_at}`);
          console.log(`    Expires: ${lock.expires_at}`);
        }
      }

      if (state.recent_intents.length > 0) {
        console.log("\n📝 Recent Activity:");
        for (const entry of state.recent_intents.slice(-10)) {
          const icon = entry.action === "acquire" ? "🔐" : "🔓";
          console.log(
            `  ${icon} ${entry.agent_name} → ${entry.action} "${entry.filepath}"`
          );
          console.log(`     ${entry.intent}`);
        }
      }
      break;
    }

    case "lock": {
      const filepath = args[1];
      const agent = args[2];
      const intent = args.slice(3).join(" ");

      if (!filepath || !agent || !intent) {
        console.error(
          "❌ Usage: agnt-lock lock <filepath> <agent_name> <intent>"
        );
        process.exit(1);
      }

      const result = manager.acquireLock(filepath, agent, intent);
      console.log(result.message);
      if (!result.success) process.exit(1);
      break;
    }

    case "unlock": {
      const filepath = args[1];
      const agent = args[2];

      if (!filepath) {
        console.error("❌ Usage: agnt-lock unlock <filepath> [agent_name]");
        process.exit(1);
      }

      const result = manager.releaseLock(filepath, agent);
      console.log(result.message);
      if (!result.success) process.exit(1);
      break;
    }

    case "reset": {
      const result = manager.releaseAllLocks();
      console.log(result.message);
      break;
    }

    case "serve": {
      // Dynamic import to avoid loading MCP deps for simple CLI commands
      const { StdioServerTransport } = await import(
        "@modelcontextprotocol/sdk/server/stdio.js"
      );
      const { createAgntLockServer } = await import("./server.js");

      const server = createAgntLockServer();
      const transport = new StdioServerTransport();
      await server.connect(transport);

      process.on("SIGINT", async () => {
        await server.close();
        process.exit(0);
      });
      break;
    }

    default:
      printUsage();
      if (command && command !== "--help" && command !== "-h") {
        console.error(`\n❌ Unknown command: "${command}"`);
        process.exit(1);
      }
  }
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
