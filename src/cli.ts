#!/usr/bin/env node

import chalk from "chalk";
import Table from "cli-table3";
import { AgentLockStateManager } from "./state-manager.js";

// ─── CLI Interface ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

function printBanner(): void {
  console.log(
    chalk.bold.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                    🔐 AGNT-LOCK                           ║
║         AI Agent Coordination Layer for Repos             ║
╚═══════════════════════════════════════════════════════════╝
`)
  );
}

function printUsage(): void {
  printBanner();
  console.log(chalk.white("Usage: ") + chalk.green("agnt-lock") + chalk.gray(" <command> [options]"));
  console.log();
  console.log(chalk.bold.white("Commands:"));

  const cmdTable = new Table({
    chars: {
      top: "", "top-mid": "", "top-left": "", "top-right": "",
      bottom: "", "bottom-mid": "", "bottom-left": "", "bottom-right": "",
      left: "  ", "left-mid": "", mid: "", "mid-mid": "",
      right: "", "right-mid": "", middle: "  ",
    },
    style: { "padding-left": 0, "padding-right": 2 },
  });

  cmdTable.push(
    [chalk.green("status"), chalk.gray("Show current repo coordination state (live dashboard)")],
    [chalk.green("lock") + chalk.gray(" <file> <agent> <intent>"), chalk.gray("Acquire a lock on a file")],
    [chalk.green("unlock") + chalk.gray(" <file> [agent]"), chalk.gray("Release a lock on a file")],
    [chalk.green("reset"), chalk.gray("Force-release all locks (emergency)")],
    [chalk.green("serve"), chalk.gray("Start the MCP server (stdio transport)")],
  );

  console.log(cmdTable.toString());
  console.log();
  console.log(chalk.bold.white("Examples:"));
  console.log(chalk.gray("  $ ") + chalk.green("agnt-lock status"));
  console.log(chalk.gray("  $ ") + chalk.green('agnt-lock lock src/index.ts claude-code "Refactoring auth"'));
  console.log(chalk.gray("  $ ") + chalk.green("agnt-lock unlock src/index.ts claude-code"));
  console.log(chalk.gray("  $ ") + chalk.green("agnt-lock reset"));
  console.log();
}

function renderDashboard(manager: AgentLockStateManager): void {
  const state = manager.getRepoState();

  printBanner();

  // ─── Session Info ─────────────────────────────────────────────────────
  console.log(
    chalk.gray("  Session: ") + chalk.white(state.session_id)
  );
  console.log(
    chalk.gray("  Active Locks: ") +
      (state.total_active_locks > 0
        ? chalk.bold.red(`${state.total_active_locks}`)
        : chalk.bold.green("0"))
  );
  console.log(
    chalk.gray("  Active Agents: ") +
      (state.agents_active.length > 0
        ? chalk.bold.yellow(state.agents_active.join(", "))
        : chalk.dim("none"))
  );
  console.log();

  // ─── Active Locks Table ───────────────────────────────────────────────
  if (state.active_locks.length > 0) {
    console.log(chalk.bold.red("  🔒 Active File Locks"));
    console.log();

    const lockTable = new Table({
      head: [
        chalk.bold.white("File"),
        chalk.bold.white("Agent"),
        chalk.bold.white("Intent"),
        chalk.bold.white("Acquired"),
        chalk.bold.white("Expires"),
        chalk.bold.white("Status"),
      ],
      style: {
        head: [],
        border: ["gray"],
        "padding-left": 1,
        "padding-right": 1,
      },
      colWidths: [25, 16, 30, 22, 22, 10],
      wordWrap: true,
    });

    for (const lock of state.active_locks) {
      const now = new Date();
      const expires = new Date(lock.expires_at);
      const remainingMs = expires.getTime() - now.getTime();
      const remainingMin = Math.max(0, Math.ceil(remainingMs / 60000));

      let statusText: string;
      if (remainingMin <= 2) {
        statusText = chalk.red(`⚠️ ${remainingMin}m`);
      } else if (remainingMin <= 5) {
        statusText = chalk.yellow(`⏳ ${remainingMin}m`);
      } else {
        statusText = chalk.green(`✅ ${remainingMin}m`);
      }

      const acquiredTime = new Date(lock.acquired_at).toLocaleTimeString();
      const expiresTime = expires.toLocaleTimeString();

      lockTable.push([
        chalk.cyan(lock.filepath),
        chalk.yellow(lock.agent_name),
        chalk.white(lock.intent),
        chalk.gray(acquiredTime),
        chalk.gray(expiresTime),
        statusText,
      ]);
    }

    console.log(lockTable.toString());
    console.log();
  } else {
    console.log(chalk.bold.green("  ✅ No Active Locks"));
    console.log(chalk.dim("  All files are free. Agents can work without conflicts."));
    console.log();
  }

  // ─── Recent Activity ──────────────────────────────────────────────────
  if (state.recent_intents.length > 0) {
    console.log(chalk.bold.blue("  📝 Recent Activity"));
    console.log();

    const activityTable = new Table({
      head: [
        chalk.bold.white("Action"),
        chalk.bold.white("Agent"),
        chalk.bold.white("File"),
        chalk.bold.white("Intent"),
        chalk.bold.white("Time"),
      ],
      style: {
        head: [],
        border: ["gray"],
        "padding-left": 1,
        "padding-right": 1,
      },
      colWidths: [10, 16, 25, 30, 22],
      wordWrap: true,
    });

    for (const entry of state.recent_intents.slice(-10)) {
      const actionText =
        entry.action === "acquire"
          ? chalk.red("🔐 LOCK")
          : chalk.green("🔓 FREE");

      const time = new Date(entry.timestamp).toLocaleTimeString();

      activityTable.push([
        actionText,
        chalk.yellow(entry.agent_name),
        chalk.cyan(entry.filepath),
        chalk.gray(entry.intent),
        chalk.dim(time),
      ]);
    }

    console.log(activityTable.toString());
    console.log();
  }

  // ─── Footer ───────────────────────────────────────────────────────────
  console.log(
    chalk.dim("  ─────────────────────────────────────────────────────────")
  );
  console.log(
    chalk.dim("  AGNT-LOCK v1.0.0 • ") +
      chalk.dim.underline("https://github.com/codewithriza/AGNT-LOCK")
  );
  console.log();
}

async function main(): Promise<void> {
  const manager = new AgentLockStateManager();

  switch (command) {
    case "status": {
      renderDashboard(manager);
      break;
    }

    case "lock": {
      const filepath = args[1];
      const agent = args[2];
      const intent = args.slice(3).join(" ");

      if (!filepath || !agent || !intent) {
        console.error(
          chalk.red("❌ Usage: ") +
            chalk.white("agnt-lock lock <filepath> <agent_name> <intent>")
        );
        process.exit(1);
      }

      const result = manager.acquireLock(filepath, agent, intent);
      if (result.success) {
        console.log(chalk.bold.green(`\n  ${result.message}\n`));
      } else {
        console.log(chalk.bold.red(`\n  ${result.message}\n`));
        if (result.blocked_by) {
          console.log(chalk.yellow("  Blocked by:"));
          console.log(chalk.gray(`    Agent:  ${result.blocked_by.agent_name}`));
          console.log(chalk.gray(`    Intent: ${result.blocked_by.intent}`));
          console.log(chalk.gray(`    Since:  ${result.blocked_by.acquired_at}`));
        }
        console.log();
        process.exit(1);
      }
      break;
    }

    case "unlock": {
      const filepath = args[1];
      const agent = args[2];

      if (!filepath) {
        console.error(
          chalk.red("❌ Usage: ") +
            chalk.white("agnt-lock unlock <filepath> [agent_name]")
        );
        process.exit(1);
      }

      const result = manager.releaseLock(filepath, agent);
      if (result.success) {
        console.log(chalk.bold.green(`\n  ${result.message}\n`));
      } else {
        console.log(chalk.bold.red(`\n  ${result.message}\n`));
        process.exit(1);
      }
      break;
    }

    case "reset": {
      console.log(chalk.yellow("\n  ⚠️  Force-releasing ALL locks...\n"));
      const result = manager.releaseAllLocks();
      console.log(chalk.bold.green(`  ${result.message}\n`));
      break;
    }

    case "serve": {
      console.log(chalk.cyan("\n  🚀 Starting AGNT-LOCK MCP Server...\n"));
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
        console.error(chalk.red(`\n  ❌ Unknown command: "${command}"\n`));
        process.exit(1);
      }
  }
}

main().catch((error: unknown) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
