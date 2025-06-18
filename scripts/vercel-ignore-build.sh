#!/bin/bash

# This script tells Vercel when to ignore a build
# Used in vercel.json ignoreCommand

echo "🔍 Checking if build should be ignored..."

# Get the list of changed files
CHANGED_FILES=$(git diff HEAD^ HEAD --name-only)

# Check if any changes affect the web app
SHOULD_BUILD=false

for file in $CHANGED_FILES; do
  # Build if changes in web app
  if [[ $file == apps/web/* ]]; then
    SHOULD_BUILD=true
    break
  fi
  
  # Build if changes in shared packages
  if [[ $file == packages/* ]]; then
    SHOULD_BUILD=true
    break
  fi
  
  # Build if changes in root config files
  if [[ $file == package.json ]] || [[ $file == package-lock.json ]] || [[ $file == turbo.json ]]; then
    SHOULD_BUILD=true
    break
  fi
  
  # Build if changes in deployment configs
  if [[ $file == vercel.json ]] || [[ $file == .github/workflows/* ]]; then
    SHOULD_BUILD=true
    break
  fi
done

if [ "$SHOULD_BUILD" = true ]; then
  echo "✅ Changes detected that affect web app. Proceeding with build."
  exit 1  # Exit 1 means "don't ignore, do build"
else
  echo "⏭️ No changes affecting web app. Skipping build."
  exit 0  # Exit 0 means "ignore this build"
fi