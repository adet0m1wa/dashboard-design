import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The dev badge would sit on top of the sidebar in screenshots.
  devIndicators: false,
  // Keep CLAUDE.md short: don't let `next dev` append its agent-rules block.
  agentRules: false,
};

export default nextConfig;
