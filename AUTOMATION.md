# Automated Benchmark System

This document describes the automated benchmark system that runs daily benchmarks across multiple Node.js versions and automatically updates the repository with the latest results.

## Overview

The automated benchmark system consists of:

1. **GitHub Actions Workflow** (`.github/workflows/daily-benchmarks.yml`)
2. **README Update Script** (`scripts/update-readme.js`)
3. **Automated Git Commits** (via GitHub Actions bot)

## How It Works

### Daily Scheduled Runs

The workflow runs automatically every day at 2:00 AM UTC via GitHub Actions cron schedule:

```yaml
schedule:
  - cron: '0 2 * * *'
```

### Multi-Version Testing

Benchmarks are executed in parallel across multiple Node.js versions:

- **Node.js 18** (Legacy LTS)
- **Node.js 20** (Active LTS - Recommended)
- **Node.js 22** (Current)
- **Node.js 24** (Latest)
- **Node.js latest** (Most recent release)

### Workflow Steps

1. **Checkout Repository**: Clones the latest code from the main branch
2. **Setup Node.js**: Configures each Node.js version in parallel jobs
3. **Install Dependencies**: Installs build tools and npm packages
4. **Run Benchmarks**: Executes `npm run benchmark` for each version
5. **Upload Artifacts**: Saves benchmark JSON results as artifacts
6. **Consolidate Results**: Downloads all artifacts and consolidates them
7. **Update README**: Runs the update script to generate markdown tables
8. **Commit Changes**: Automatically commits and pushes updated files

### Result Processing

The `scripts/update-readme.js` script:

- Reads all `benchmark_results_node_*.json` files
- Generates comprehensive markdown tables for each configuration
- Adds performance comparison summaries
- Identifies best performers by operation type
- Updates the README between `<!-- BENCHMARK_RESULTS_START -->` and `<!-- BENCHMARK_RESULTS_END -->` markers

## Files Updated Automatically

The following files are automatically updated and committed:

- `benchmark_results_node_v18.*.json` - Node.js 18 results
- `benchmark_results_node_v20.*.json` - Node.js 20 results
- `benchmark_results_node_v22.*.json` - Node.js 22 results
- `benchmark_results_node_v24.*.json` - Node.js 24 results
- `benchmark_results_node_v*.*.json` - Node.js latest results
- `README.md` - Updated with latest benchmark tables

## Manual Triggering

You can manually trigger the workflow in two ways:

### 1. Via GitHub UI

1. Go to the **Actions** tab in the GitHub repository
2. Select **Daily SQLite Benchmarks** workflow
3. Click **Run workflow** button
4. Select the branch and click **Run workflow**

### 2. Via GitHub CLI

```bash
gh workflow run daily-benchmarks.yml
```

### 3. Via Push to Main

The workflow also runs automatically when you push changes to:
- `benchmark.js`
- `.github/workflows/daily-benchmarks.yml`

## Permissions

The workflow requires the following permissions:

- **contents: write** - To commit and push updated benchmark results

These permissions are configured in the workflow file and should be automatically granted by GitHub Actions.

## Commit Messages

Automated commits use the following format:

```
chore: update benchmark results [skip ci]
```

The `[skip ci]` tag prevents the workflow from triggering itself recursively.

## Troubleshooting

### Workflow Fails to Commit

**Problem**: The workflow runs but doesn't commit changes.

**Solution**: Ensure the repository settings allow GitHub Actions to create and approve pull requests:
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**

### Native Module Compilation Errors

**Problem**: Benchmarks fail with native module compilation errors.

**Solution**: The workflow automatically installs build dependencies. If issues persist, check:
- Node.js version compatibility with `better-sqlite3-multiple-ciphers`
- Ubuntu build tools are properly installed in the workflow

### Missing Benchmark Results

**Problem**: Some Node.js versions don't produce results.

**Solution**: The workflow uses `continue-on-error: true` for benchmark steps to allow partial results. Check the workflow logs to see which versions failed and why.

## Customization

### Change Schedule

Edit the cron expression in `.github/workflows/daily-benchmarks.yml`:

```yaml
schedule:
  # Run every 6 hours
  - cron: '0 */6 * * *'

  # Run weekly on Monday at 3 AM
  - cron: '0 3 * * 1'

  # Run on the 1st of every month
  - cron: '0 0 1 * *'
```

### Add More Node.js Versions

Edit the matrix in `.github/workflows/daily-benchmarks.yml`:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22, 23, 24, 'latest']
```

### Customize README Format

Edit `scripts/update-readme.js` to change:
- Table formatting
- Performance analysis
- Best performer calculations
- Additional metrics or charts

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Node 18     │  │  Node 20     │  │  Node 22     │ ...  │
│  │  Benchmark   │  │  Benchmark   │  │  Benchmark   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                   │
│                           ▼                                   │
│                  ┌─────────────────┐                         │
│                  │  Consolidate    │                         │
│                  │  Artifacts      │                         │
│                  └────────┬────────┘                         │
│                           │                                   │
│                           ▼                                   │
│                  ┌─────────────────┐                         │
│                  │  Update README  │                         │
│                  │  (Node script)  │                         │
│                  └────────┬────────┘                         │
│                           │                                   │
│                           ▼                                   │
│                  ┌─────────────────┐                         │
│                  │  Git Commit     │                         │
│                  │  & Push         │                         │
│                  └─────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Always Up-to-Date**: Benchmark results reflect the latest code changes
2. **Multi-Version Testing**: Identifies performance regressions across Node.js versions
3. **Zero Maintenance**: Fully automated with no manual intervention required
4. **Historical Tracking**: Git history preserves all benchmark results over time
5. **Transparent**: All results are visible in the repository
6. **CI/CD Integration**: Workflow can be extended to block merges on performance regressions

## Future Enhancements

Potential improvements to consider:

- [ ] Add performance regression detection (fail if performance drops >10%)
- [ ] Generate performance trend charts over time
- [ ] Send notifications on significant performance changes
- [ ] Add more detailed system information (CPU, RAM, disk specs)
- [ ] Create a separate `BENCHMARKS.md` file for historical data
- [ ] Add comparison with other SQLite libraries
- [ ] Implement benchmark result caching to avoid redundant runs

## License

This automation system is part of the sqlite-benchmarks project and follows the same license.
