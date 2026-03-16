import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { AgentLockStateManager } from "../src/state-manager.js";

// ─── Test Helpers ────────────────────────────────────────────────────────────

const TEST_DIR = path.join(process.cwd(), ".agentlock-test-" + Date.now());

function createManager(): AgentLockStateManager {
  return new AgentLockStateManager(TEST_DIR);
}

function cleanup(): void {
  const stateDir = path.join(TEST_DIR, ".agentlock");
  if (fs.existsSync(stateDir)) {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("AgentLockStateManager", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    cleanup();
  });

  // ─── Test 1: Acquire Lock Successfully ──────────────────────────────────

  describe("acquire_lock", () => {
    it("should successfully acquire a lock on an unlocked file", () => {
      const manager = createManager();
      const result = manager.acquireLock(
        "src/index.ts",
        "claude-code",
        "Refactoring the main entry point"
      );

      expect(result.success).toBe(true);
      expect(result.lock).toBeDefined();
      expect(result.lock!.filepath).toBe("src/index.ts");
      expect(result.lock!.agent_name).toBe("claude-code");
      expect(result.lock!.intent).toBe("Refactoring the main entry point");
      expect(result.message).toContain("Lock acquired");
    });

    // ─── Test 2: Block Lock on Already-Locked File ──────────────────────

    it("should block a second agent from acquiring a lock on an already-locked file", () => {
      const manager = createManager();

      // First agent acquires the lock
      const first = manager.acquireLock(
        "src/auth.ts",
        "claude-code",
        "Refactoring auth middleware"
      );
      expect(first.success).toBe(true);

      // Second agent tries to lock the same file
      const second = manager.acquireLock(
        "src/auth.ts",
        "aider",
        "Adding new auth routes"
      );

      expect(second.success).toBe(false);
      expect(second.message).toContain("BLOCKED");
      expect(second.blocked_by).toBeDefined();
      expect(second.blocked_by!.agent_name).toBe("claude-code");
      expect(second.blocked_by!.intent).toBe("Refactoring auth middleware");
    });

    // ─── Test 3: Same Agent Can Re-acquire Its Own Lock ─────────────────

    it("should allow the same agent to re-acquire its own lock", () => {
      const manager = createManager();

      const first = manager.acquireLock(
        "src/config.ts",
        "roo-code",
        "Updating config defaults"
      );
      expect(first.success).toBe(true);

      const second = manager.acquireLock(
        "src/config.ts",
        "roo-code",
        "Updating config defaults with new env vars"
      );
      expect(second.success).toBe(true);
      expect(second.lock!.intent).toBe(
        "Updating config defaults with new env vars"
      );
    });
  });

  // ─── Test 4: Release Lock Successfully ──────────────────────────────────

  describe("release_lock", () => {
    it("should successfully release a lock and free the file", () => {
      const manager = createManager();

      // Acquire then release
      manager.acquireLock("src/utils.ts", "aider", "Adding utility functions");
      const release = manager.releaseLock("src/utils.ts");

      expect(release.success).toBe(true);
      expect(release.message).toContain("Lock released");
      expect(release.lock).toBeDefined();
      expect(release.lock!.agent_name).toBe("aider");

      // Now another agent should be able to lock it
      const newLock = manager.acquireLock(
        "src/utils.ts",
        "claude-code",
        "Refactoring utilities"
      );
      expect(newLock.success).toBe(true);
    });

    // ─── Test 5: Cannot Release Non-existent Lock ───────────────────────

    it("should fail when releasing a file that is not locked", () => {
      const manager = createManager();
      const result = manager.releaseLock("src/nonexistent.ts");

      expect(result.success).toBe(false);
      expect(result.message).toContain("No active lock found");
    });

    // ─── Test 6: Cannot Release Another Agent's Lock ────────────────────

    it("should prevent an agent from releasing another agent's lock", () => {
      const manager = createManager();

      manager.acquireLock(
        "src/server.ts",
        "claude-code",
        "Updating server config"
      );

      const result = manager.releaseLock("src/server.ts", "aider");

      expect(result.success).toBe(false);
      expect(result.message).toContain("Cannot release lock");
      expect(result.blocked_by).toBeDefined();
      expect(result.blocked_by!.agent_name).toBe("claude-code");
    });
  });

  // ─── Test 7: Get Repo State ─────────────────────────────────────────────

  describe("get_repo_state", () => {
    it("should return accurate repo state with active locks and agents", () => {
      const manager = createManager();

      manager.acquireLock("src/a.ts", "claude-code", "Working on A");
      manager.acquireLock("src/b.ts", "aider", "Working on B");
      manager.acquireLock("src/c.ts", "roo-code", "Working on C");

      const state = manager.getRepoState();

      expect(state.total_active_locks).toBe(3);
      expect(state.agents_active).toHaveLength(3);
      expect(state.agents_active).toContain("claude-code");
      expect(state.agents_active).toContain("aider");
      expect(state.agents_active).toContain("roo-code");
      expect(state.active_locks).toHaveLength(3);
      expect(state.recent_intents.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ─── Test 8: Force Release All ──────────────────────────────────────────

  describe("force_release_all", () => {
    it("should release all active locks at once", () => {
      const manager = createManager();

      manager.acquireLock("src/x.ts", "agent-1", "Task X");
      manager.acquireLock("src/y.ts", "agent-2", "Task Y");
      manager.acquireLock("src/z.ts", "agent-3", "Task Z");

      const result = manager.releaseAllLocks();

      expect(result.released).toBe(3);
      expect(result.message).toContain("Force-released 3 lock(s)");

      // Verify state is clean
      const state = manager.getRepoState();
      expect(state.total_active_locks).toBe(0);
      expect(state.agents_active).toHaveLength(0);
    });
  });

  // ─── Test 9: Lock Expiry ────────────────────────────────────────────────

  describe("lock expiry", () => {
    it("should auto-expire locks after TTL", () => {
      const manager = createManager();

      // Acquire with a very short TTL (1ms)
      manager.acquireLock("src/expired.ts", "old-agent", "Old task", 1);

      // Wait a tiny bit for expiry
      const start = Date.now();
      while (Date.now() - start < 10) {
        // busy wait
      }

      // Another agent should now be able to lock it (expired lock gets purged)
      const result = manager.acquireLock(
        "src/expired.ts",
        "new-agent",
        "New task"
      );

      expect(result.success).toBe(true);
      expect(result.lock!.agent_name).toBe("new-agent");
    });
  });
});
