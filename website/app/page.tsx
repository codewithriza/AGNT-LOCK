export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <span className="font-bold text-white text-lg tracking-tight">
              AGNT-LOCK
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/codewithriza/AGNT-LOCK"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/codewithriza/AGNT-LOCK#-quick-start"
              className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-glow" />
            <span className="text-sm text-cyan-400 font-medium">
              MCP Compatible
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            <span className="text-white">Stop </span>
            <span className="gradient-text">Agentic Collision.</span>
            <br />
            <span className="text-gray-400 text-4xl md:text-5xl">
              The Git for AI Agents.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            An open-source MCP coordination layer that prevents{" "}
            <span className="text-white font-medium">Claude Code</span>,{" "}
            <span className="text-white font-medium">Roo Code</span>,{" "}
            <span className="text-white font-medium">Aider</span>, and{" "}
            <span className="text-white font-medium">Cursor</span> from
            overwriting each other&apos;s work in shared repositories.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="https://github.com/codewithriza/AGNT-LOCK"
              className="px-8 py-3.5 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all hover:scale-105"
            >
              ⭐ Star on GitHub
            </a>
            <a
              href="https://github.com/codewithriza/AGNT-LOCK#-quick-start"
              className="px-8 py-3.5 border border-white/10 text-white rounded-xl font-semibold text-lg hover:border-white/30 transition-all"
            >
              Quick Start →
            </a>
          </div>

          {/* Terminal Preview */}
          <div className="max-w-3xl mx-auto animated-border p-1">
            <div className="bg-[#0d0d0d] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-gray-500 font-mono">
                  agnt-lock status
                </span>
              </div>
              <pre className="p-6 text-sm text-left font-mono leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-cyan-400">
                    {"╔═══════════════════════════════════════════╗\n"}
                  </span>
                  <span className="text-cyan-400">
                    {"║          🔐 AGNT-LOCK Dashboard          ║\n"}
                  </span>
                  <span className="text-cyan-400">
                    {"╚═══════════════════════════════════════════╝\n\n"}
                  </span>
                  <span className="text-gray-500">{"  Session:  "}</span>
                  <span className="text-white">
                    {"session_20260315_a3f8k2\n"}
                  </span>
                  <span className="text-gray-500">{"  Locks:    "}</span>
                  <span className="text-red-400">{"2 active\n"}</span>
                  <span className="text-gray-500">{"  Agents:   "}</span>
                  <span className="text-yellow-400">
                    {"claude-code, aider\n\n"}
                  </span>
                  <span className="text-red-400">
                    {"  🔒 Active File Locks\n"}
                  </span>
                  <span className="text-gray-600">
                    {
                      "  ┌──────────────┬─────────────┬──────────────────────┐\n"
                    }
                  </span>
                  <span className="text-gray-600">
                    {
                      "  │ "
                    }
                  </span>
                  <span className="text-cyan-400">{"src/auth.ts"}</span>
                  <span className="text-gray-600">
                    {"  │ "}</span>
                  <span className="text-yellow-400">{"claude-code"}</span>
                  <span className="text-gray-600">
                    {" │ "}</span>
                  <span className="text-white">{"Refactoring auth"}</span>
                  <span className="text-gray-600">
                    {"     │\n"}
                  </span>
                  <span className="text-gray-600">
                    {
                      "  │ "
                    }
                  </span>
                  <span className="text-cyan-400">{"src/routes.ts"}</span>
                  <span className="text-gray-600">{"│ "}</span>
                  <span className="text-yellow-400">{"aider"}</span>
                  <span className="text-gray-600">
                    {"      │ "}</span>
                  <span className="text-white">{"Adding API endpoints"}</span>
                  <span className="text-gray-600">
                    {"  │\n"}
                  </span>
                  <span className="text-gray-600">
                    {
                      "  └──────────────┴─────────────┴──────────────────────┘\n"
                    }
                  </span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              💥 The Problem
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              When multiple AI agents work on the same codebase, they have zero
              awareness of each other. The result? Silent data loss.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "🔄",
                title: "Silent Overwrites",
                desc: "Agent B nukes Agent A's changes with zero warning. Hours of work vanish instantly.",
              },
              {
                icon: "🧠",
                title: "Context Loss",
                desc: "Each agent hallucinates that it's the only one working. No shared awareness exists.",
              },
              {
                icon: "🔁",
                title: "Infinite Loops",
                desc: 'Agents "fix" each other\'s changes back and forth forever, burning tokens and time.',
              },
              {
                icon: "💀",
                title: "Broken Builds",
                desc: "The repo ends up in a state no single agent intended. CI/CD pipelines fail silently.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:border-red-500/20 hover:bg-red-500/[0.02] transition-all"
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ⚡ How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Three simple MCP tools. Zero configuration. Instant coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "acquire_lock",
                desc: "Before editing a file, the agent requests an exclusive lock. If another agent holds it, the request is blocked with full context.",
                color: "text-cyan-400",
              },
              {
                step: "02",
                title: "get_repo_state",
                desc: "Any agent can query the full coordination map — who's working on what, with what intent, and when locks expire.",
                color: "text-purple-400",
              },
              {
                step: "03",
                title: "release_lock",
                desc: "After finishing edits, the agent releases the lock. The intent is committed to a rolling session history.",
                color: "text-green-400",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <span
                  className={`text-sm font-mono font-bold ${item.color} mb-4 block`}
                >
                  STEP {item.step}
                </span>
                <h3 className="text-lg font-semibold text-white mb-2 font-mono">
                  {item.title}()
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibility Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🔌 Works With Your Stack
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Any MCP-compatible AI agent. One protocol. Zero vendor lock-in.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              "Claude Code",
              "Roo Code",
              "Cursor",
              "Aider",
              "Claude Desktop",
              "Windsurf",
            ].map((agent) => (
              <div
                key={agent}
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-gray-300 font-medium hover:border-cyan-500/30 hover:text-white transition-all"
              >
                {agent}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🚀 Get Started in 30 Seconds
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Clone, build, and add to your MCP config. That&apos;s it.
          </p>

          <div className="animated-border p-1 text-left">
            <div className="bg-[#0d0d0d] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-gray-500 font-mono">
                  terminal
                </span>
              </div>
              <pre className="p-6 text-sm font-mono leading-loose overflow-x-auto">
                <span className="text-gray-500">{"# Clone & build\n"}</span>
                <span className="text-green-400">{"$ "}</span>
                <span className="text-white">
                  {"git clone https://github.com/codewithriza/AGNT-LOCK.git\n"}
                </span>
                <span className="text-green-400">{"$ "}</span>
                <span className="text-white">
                  {"cd AGNT-LOCK && npm install && npm run build\n\n"}
                </span>
                <span className="text-gray-500">
                  {"# Check coordination status\n"}
                </span>
                <span className="text-green-400">{"$ "}</span>
                <span className="text-white">{"agnt-lock status\n\n"}</span>
                <span className="text-gray-500">
                  {"# Start MCP server\n"}
                </span>
                <span className="text-green-400">{"$ "}</span>
                <span className="text-white">{"node dist/index.js"}</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔐</span>
            <span className="font-bold text-white">AGNT-LOCK</span>
            <span className="text-gray-500 text-sm">
              — Built by{" "}
              <a
                href="https://x.com/rizawastaken"
                className="text-cyan-400 hover:underline"
              >
                Riza
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a
              href="https://github.com/codewithriza/AGNT-LOCK"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/codewithriza/AGNT-LOCK/blob/main/LICENSE"
              className="hover:text-white transition-colors"
            >
              MIT License
            </a>
            <a
              href="https://discord.gg/yTUCdHtpaP"
              className="hover:text-white transition-colors"
            >
              Discord
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
