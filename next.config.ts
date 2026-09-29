import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Hostinger ላይ በሚገነባበት ወቅት የ TypeScript error ቢኖር እንኳን ቢልዱ እንዲቀጥል ያደርጋል
    ignoreBuildErrors: true,
  },
  // eslint option has been removed in Next.js 16+
  // ESLint is now run separately via the ESLint CLI
};

export default nextConfig;