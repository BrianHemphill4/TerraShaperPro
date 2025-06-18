#!/bin/bash

# Vercel Build Script
# This script optimizes the build process for Vercel deployment

echo "🚀 Starting Vercel build process..."

# Set environment
export NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf apps/web/.next
rm -rf apps/web/out
rm -rf node_modules/.cache

# Install dependencies with production flag
echo "📦 Installing dependencies..."
npm ci --production=false

# Run pre-build tasks
echo "🔨 Running pre-build tasks..."

# Generate Prisma client if needed
if [ -f "packages/db/prisma/schema.prisma" ]; then
  echo "🗄️ Generating Prisma client..."
  npm run db:generate
fi

# Build the application
echo "🏗️ Building application..."
npx turbo run build --filter=web

# Run post-build optimizations
echo "✨ Running post-build optimizations..."

# Analyze bundle size if requested
if [ "$ANALYZE" = "true" ]; then
  echo "📊 Analyzing bundle size..."
  npm run build-stats -- --filter=web
fi

# Generate sitemap
if [ -f "apps/web/scripts/generate-sitemap.js" ]; then
  echo "🗺️ Generating sitemap..."
  node apps/web/scripts/generate-sitemap.js
fi

# Verify build output
echo "✅ Verifying build output..."
if [ ! -d "apps/web/.next" ]; then
  echo "❌ Build failed: .next directory not found"
  exit 1
fi

echo "✅ Vercel build completed successfully!"

# Print build info
echo "📊 Build Information:"
echo "- Node Version: $(node --version)"
echo "- NPM Version: $(npm --version)"
echo "- Build Date: $(date)"
echo "- Git Commit: ${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD)}"