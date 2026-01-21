import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Turbopack from inferring an incorrect workspace root when other
    // lockfiles exist elsewhere on the machine.
    root: process.cwd(),
  },
};

export default nextConfig;
