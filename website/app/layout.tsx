import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGNT-LOCK — Stop Agentic Collision",
  description:
    "The Git for AI Agents. MCP coordination layer that prevents AI agents from overwriting each other's work in shared repositories.",
  keywords: [
    "MCP",
    "AI agents",
    "coordination",
    "Claude Code",
    "Cursor",
    "Aider",
    "Roo Code",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
