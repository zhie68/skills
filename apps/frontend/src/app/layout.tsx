import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Skill Radar — AI Agent Skill Discovery & Intelligence Platform',
  description:
    'Discover, analyze, rank, monitor, and recommend the most advanced AI Agent Skills across GitHub, skills.sh, Anthropic, Antigravity, Three.js, and OpenClaw.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
