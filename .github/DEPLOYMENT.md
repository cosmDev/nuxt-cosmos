# GitHub Workflow Setup

This repository includes automated GitHub workflows for continuous integration and npm publishing.

## Workflows

### 1. CI Workflow (`.github/workflows/test.yml`)
- Runs on all branches except `main`/`master`
- Runs on pull requests to `main`/`master`
- Performs: linting, testing, type checking, and build verification

### 2. Publish Workflow (`.github/workflows/publish.yml`)
- Runs on pushes to `main`/`master` branch
- Performs: testing, building, version management, npm publishing, and GitHub releases

## Required Secrets

To enable automatic npm publishing, you need to configure the following secrets in your GitHub repository:

### NPM_TOKEN
1. Go to [npmjs.com](https://npmjs.com) and log in to your account
2. Click on your profile picture → "Access Tokens"
3. Click "Generate New Token" → "Automation"
4. Copy the generated token
5. In your GitHub repository, go to Settings → Secrets and variables → Actions
6. Click "New repository secret"
7. Name: `NPM_TOKEN`
8. Value: Paste your npm token
9. Click "Add secret"

### GITHUB_TOKEN
This is automatically provided by GitHub Actions, no setup required.

## How It Works

### Version Management
- The workflow automatically checks if the current version in `package.json` already exists on npm
- If the version exists, it automatically bumps the patch version
- Creates a git tag for each release
- Commits version changes back to the repository with `[skip ci]` to avoid triggering another workflow

### Publishing Process
1. **Test Phase**: Runs linting, tests, and type checking
2. **Build Phase**: Builds the module using `npm run prepack`
3. **Version Check**: Checks if current version exists on npm
4. **Version Bump**: If needed, bumps patch version automatically
5. **Git Tag**: Creates and pushes a git tag
6. **NPM Publish**: Publishes to npm with public access
7. **GitHub Release**: Creates a GitHub release with changelog

## Manual Deployment

You can also trigger the deployment manually:
1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Publish to NPM" workflow
4. Click "Run workflow"

## Package Access

The package is published with `--access public` flag, making it publicly available on npm.

## Skipping CI

If you need to push changes without triggering the workflow, include `[skip ci]` in your commit message:
```bash
git commit -m "docs: update README [skip ci]"
```
