# Scripts

This directory contains utility scripts for the project.

## update-deps.sh

Updates all dependencies to their latest versions.

### Usage

```bash
# From project root
./scripts/update-deps.sh

# Or using npm script
npm run update-deps
```

### What it does

1. Uses `npm-check-updates` to update all dependency versions in `package.json`
2. Runs `npm install` to install the updated dependencies
3. Shows a summary of what was updated

### Interactive Mode

If you want to choose which dependencies to update:

```bash
npm run update-deps:interactive
```

This will show you each dependency update and let you choose whether to apply it.

### After Updating

Always run these commands after updating dependencies:

```bash
# Check for TypeScript errors
npm run check

# Run tests
npm run test

# Try building
npm run build
```

### Notes

- Updates both `dependencies` and `devDependencies`
- Uses semantic versioning (^) by default
- Some updates might have breaking changes - check changelogs
- Test thoroughly after updating
