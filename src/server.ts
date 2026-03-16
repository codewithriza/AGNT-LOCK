import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AgentLockStateManager } from "./state-manager.js";

// ─── Create the MCP Server ──────────────────────────────────────────────────

export function createAgntLockServer(repoRoot?: string): McpServer {
  const stateManager = new AgentLockStateManager(repoRoot);

  const server = new McpServer({
    name: "agnt-lock",
    version: "1.0.0",
  });

  // ─── Tool: acquire_lock ─────────────────────────────────────────────────

  server.tool(
    "acquire_lock",
    "Acquire an exclusive lock on a file before editing. Prevents other AI agents from modifying the same file simultaneously. Returns lock status and blocker info if already locked.",
    {
      filepath: z
        .string()
        .describe("Relative path to the file to lock (e.g., 'src/index.ts')"),
      agent_name: z
        .string()
        .describe(
          "Name of the AI agent requesting the lock (e.g., 'claude-code', 'aider', 'roo-code')"
        ),
      intent: z
        .string()
        .describe(
          "Brief description of what the agent plans to do with this file (e.g., 'Refactoring the auth middleware')"
        ),
    },
    async ({ filepath, agent_name, intent }) => {
      const result = stateManager.acquireLock(filepath, agent_name, intent);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: !result.success,
      };
    }
  );

  // ─── Tool: release_lock ─────────────────────────────────────────────────

  server.tool(
    "release_lock",
    "Release a previously acquired lock on a file. Call this after finishing edits to allow other agents to work on the file. The intent is committed to session history.",
    {
      filepath: z
        .string()
        .describe("Relative path to the file to unlock"),
      agent_name: z
        .string()
        .optional()
        .describe(
          "Optional: name of the agent releasing the lock (for ownership verification)"
        ),
    },
    async ({ filepath, agent_name }) => {
      const result = stateManager.releaseLock(filepath, agent_name);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: !result.success,
      };
    }
  );

  // ─── Tool: get_repo_state ───────────────────────────────────────────────

  server.tool(
    "get_repo_state",
    "Get the current coordination state of the repository. Shows all active locks, which agents are working, and recent intent history. Use this before starting work to understand what other agents are doing.",
    {},
    async () => {
      const state = stateManager.getRepoState();

      // Build a human-readable summary
      const lines: string[] = [
        `📊 AGNT-LOCK Repository State`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Session: ${state.session_id}`,
        `Active Locks: ${state.total_active_locks}`,
        `Active Agents: ${state.agents_active.length > 0 ? state.agents_active.join(", ") : "none"}`,
        ``,
      ];

      if (state.active_locks.length > 0) {
        lines.push(`🔒 Locked Files:`);
        for (const lock of state.active_locks) {
          lines.push(
            `  • ${lock.filepath} → ${lock.agent_name} (intent: "${lock.intent}")`
          );
          lines.push(`    acquired: ${lock.acquired_at} | expires: ${lock.expires_at}`);
        }
        lines.push(``);
      }

      if (state.recent_intents.length > 0) {
        lines.push(`📝 Recent Activity (last ${state.recent_intents.length}):`);
        for (const entry of state.recent_intents.slice(-10)) {
          const icon = entry.action === "acquire" ? "🔐" : "🔓";
          lines.push(
            `  ${icon} [${entry.timestamp}] ${entry.agent_name} → ${entry.action} "${entry.filepath}" (${entry.intent})`
          );
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: lines.join("\n"),
          },
          {
            type: "text" as const,
            text: "\n\n--- Raw JSON ---\n" + JSON.stringify(state, null, 2),
          },
        ],
      };
    }
  );

  // ─── Tool: force_release_all ────────────────────────────────────────────

  server.tool(
    "force_release_all",
    "Emergency: Force-release ALL active locks. Use only when agents are stuck or locks are stale. This will free every locked file in the repository.",
    {},
    async () => {
      const result = stateManager.releaseAllLocks();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  return server;
}
