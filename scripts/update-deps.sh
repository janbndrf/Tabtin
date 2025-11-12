#!/bin/bash

# Script to update all dependencies to their latest versions

echo "Updating all dependencies to latest versions..."
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed"
    exit 1
fi

# Update all dependencies to latest
echo "Running npm-check-updates..."
npx npm-check-updates -u

echo ""
echo "Dependencies updated in package.json!"
echo ""
echo "Now installing updated dependencies..."
npm install

echo ""
echo "Done! All dependencies are now at their latest versions."
echo ""
echo "Run 'npm run check' to verify TypeScript compatibility"
