import * as fs from "node:fs";
import * as path from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FileLock {
  filepath: string;
  agent_name: string;
  intent: string;
  acquired_at: string;
  expires_at: string;
}

export interface IntentEntry {
  agent_name: string;
  filepath: string;
  intent: string;
  action: "acquire" | "release";
  timestamp: string;
}

export interface AgentLockState {
  version: string;
  active_locks: Record<string, FileLock>;
  intent_log: IntentEntry[];
  session_id: string;
}

export interface LockResult {
  success: boolean;
  message: string;
  lock?: FileLock;
  blocked_by?: FileLock;
}

export interface RepoState {
  session_id: string;
  total_active_locks: number;
  active_locks: FileLock[];
  recent_intents: IntentEntry[];
  agents_active: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATE_DIR = ".agentlock";
const STATE_FILE = "state.json";
const DEFAULT_LOCK_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_INTENT_LOG_SIZE = 500;

// ─── State Manager ──────────────────────────────────────────────────────────

export class AgentLockStateManager {
  private statePath: string;
  private state: AgentLockState;

  constructor(repoRoot?: string) {
    const root = repoRoot ?? process.cwd();
    const stateDir = path.join(root, STATE_DIR);
    this.statePath = path.join(stateDir, STATE_FILE);

    // Ensure .agentlock directory exists
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    // Load or initialize state
    this.state = this.loadState();
  }

  // ─── Persistence ────────────────────────────────────────────────────────

  private loadState(): AgentLockState {
    if (fs.existsSync(this.statePath)) {
      try {
        const raw = fs.readFileSync(this.statePath, "utf-8");
        const parsed = JSON.parse(raw) as AgentLockState;
        // Purge expired locks on load
        this.purgeExpiredLocks(parsed);
        return parsed;
      } catch {
        // Corrupted state file — reinitialize
        return this.createFreshState();
      }
    }
    return this.createFreshState();
  }

  private createFreshState(): AgentLockState {
    const state: AgentLockState = {
      version: "1.0.0",
      active_locks: {},
      intent_log: [],
      session_id: this.generateSessionId(),
    };
    this.persist(state);
    return state;
  }

  private persist(state?: AgentLockState): void {
    const s = state ?? this.state;
    fs.writeFileSync(this.statePath, JSON.stringify(s, null, 2), "utf-8");
  }

  private generateSessionId(): string {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).substring(2, 8);
    return `session_${dateStr}_${rand}`;
  }

  // ─── Lock Expiry ───────────────────────────────────────────────────────

  private purgeExpiredLocks(state: AgentLockState): void {
    const now = new Date().toISOString();
    const expired: string[] = [];

    for (const [filepath, lock] of Object.entries(state.active_locks)) {
      if (lock.expires_at < now) {
        expired.push(filepath);
      }
    }

    for (const filepath of expired) {
      const lock = state.active_locks[filepath];
      // Log the expiry as a release
      state.intent_log.push({
        agent_name: lock.agent_name,
        filepath,
        intent: `[AUTO-EXPIRED] ${lock.intent}`,
        action: "release",
        timestamp: now,
      });
      delete state.active_locks[filepath];
    }

    // Trim intent log
    if (state.intent_log.length > MAX_INTENT_LOG_SIZE) {
      state.intent_log = state.intent_log.slice(-MAX_INTENT_LOG_SIZE);
    }
  }

  // ─── Core Operations ──────────────────────────────────────────────────

  /**
   * Acquire a lock on a file for a specific agent.
   * Returns success if the file is unlocked or already locked by the same agent.
   * Returns failure with blocker info if locked by another agent.
   */
  acquireLock(
    filepath: string,
    agentName: string,
    intent: string,
    ttlMs: number = DEFAULT_LOCK_TTL_MS
  ): LockResult {
    // Purge expired locks first
    this.purgeExpiredLocks(this.state);

    const normalizedPath = path.normalize(filepath);
    const existing = this.state.active_locks[normalizedPath];

    // Check if already locked by another agent
    if (existing && existing.agent_name !== agentName) {
      return {
        success: false,
        message: `🔒 BLOCKED: File "${normalizedPath}" is locked by agent "${existing.agent_name}" since ${existing.acquired_at}. Intent: "${existing.intent}"`,
        blocked_by: existing,
      };
    }

    // Create or update the lock
    const now = new Date();
    const lock: FileLock = {
      filepath: normalizedPath,
      agent_name: agentName,
      intent,
      acquired_at: now.toISOString(),
      expires_at: new Date(now.getTime() + ttlMs).toISOString(),
    };

    this.state.active_locks[normalizedPath] = lock;

    // Log the intent
    this.state.intent_log.push({
      agent_name: agentName,
      filepath: normalizedPath,
      intent,
      action: "acquire",
      timestamp: now.toISOString(),
    });

    // Trim intent log
    if (this.state.intent_log.length > MAX_INTENT_LOG_SIZE) {
      this.state.intent_log = this.state.intent_log.slice(
        -MAX_INTENT_LOG_SIZE
      );
    }

    this.persist();

    return {
      success: true,
      message: `✅ Lock acquired on "${normalizedPath}" by "${agentName}". Expires at ${lock.expires_at}.`,
      lock,
    };
  }

  /**
   * Release a lock on a file. Commits the intent to session history.
   */
  releaseLock(filepath: string, agentName?: string): LockResult {
    this.purgeExpiredLocks(this.state);

    const normalizedPath = path.normalize(filepath);
    const existing = this.state.active_locks[normalizedPath];

    if (!existing) {
      return {
        success: false,
        message: `⚠️ No active lock found on "${normalizedPath}".`,
      };
    }

    // If agent_name is provided, verify ownership
    if (agentName && existing.agent_name !== agentName) {
      return {
        success: false,
        message: `🚫 Cannot release lock on "${normalizedPath}": locked by "${existing.agent_name}", not "${agentName}".`,
        blocked_by: existing,
      };
    }

    // Log the release
    this.state.intent_log.push({
      agent_name: existing.agent_name,
      filepath: normalizedPath,
      intent: `[COMPLETED] ${existing.intent}`,
      action: "release",
      timestamp: new Date().toISOString(),
    });

    // Remove the lock
    delete this.state.active_locks[normalizedPath];

    // Trim intent log
    if (this.state.intent_log.length > MAX_INTENT_LOG_SIZE) {
      this.state.intent_log = this.state.intent_log.slice(
        -MAX_INTENT_LOG_SIZE
      );
    }

    this.persist();

    return {
      success: true,
      message: `🔓 Lock released on "${normalizedPath}" (was held by "${existing.agent_name}").`,
      lock: existing,
    };
  }

  /**
   * Get the full repository coordination state.
   */
  getRepoState(): RepoState {
    this.purgeExpiredLocks(this.state);
    this.persist();

    const locks = Object.values(this.state.active_locks);
    const agents = [...new Set(locks.map((l) => l.agent_name))];
    const recentIntents = this.state.intent_log.slice(-20);

    return {
      session_id: this.state.session_id,
      total_active_locks: locks.length,
      active_locks: locks,
      recent_intents: recentIntents,
      agents_active: agents,
    };
  }

  /**
   * Force-release all locks (emergency reset).
   */
  releaseAllLocks(): { released: number; message: string } {
    const count = Object.keys(this.state.active_locks).length;
    const now = new Date().toISOString();

    for (const [filepath, lock] of Object.entries(this.state.active_locks)) {
      this.state.intent_log.push({
        agent_name: lock.agent_name,
        filepath,
        intent: `[FORCE-RELEASED] ${lock.intent}`,
        action: "release",
        timestamp: now,
      });
    }

    this.state.active_locks = {};
    this.persist();

    return {
      released: count,
      message: `🧹 Force-released ${count} lock(s). All files are now unlocked.`,
    };
  }
}
