# GitHub Actions Setup Guide

This guide explains how to set up the automated benchmark system in your GitHub repository.

## Prerequisites

- GitHub repository with admin access
- The repository must be public or have GitHub Actions enabled for private repos

## Quick Setup

The automation files are already in place. You just need to enable GitHub Actions permissions:

### Step 1: Enable Workflow Permissions

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Scroll down to **Workflow permissions**
4. Select **Read and write permissions**
5. Check ✅ **Allow GitHub Actions to create and approve pull requests**
6. Click **Save**

### Step 2: Commit and Push the Automation Files

```bash
# Add all the new files
git add .github/workflows/daily-benchmarks.yml
git add scripts/update-readme.js
git add AUTOMATION.md
git add SETUP.md
git add README.md

# Commit the changes
git commit -m "feat: add automated daily benchmark workflow"

# Push to GitHub
git push origin main
```

### Step 3: Verify the Workflow

1. Go to the **Actions** tab in your GitHub repository
2. You should see **Daily SQLite Benchmarks** workflow listed
3. The workflow will run automatically:
   - Daily at 2:00 AM UTC
   - When you push changes to `benchmark.js` or the workflow file
   - When manually triggered

## Manual Testing

To test the workflow immediately without waiting for the scheduled run:

### Option 1: Via GitHub UI

1. Go to **Actions** tab
2. Click on **Daily SQLite Benchmarks** workflow
3. Click **Run workflow** button (top right)
4. Select the `main` branch
5. Click **Run workflow**

### Option 2: Via GitHub CLI

```bash
# Install GitHub CLI if needed
# https://cli.github.com/

# Authenticate
gh auth login

# Trigger the workflow
gh workflow run daily-benchmarks.yml
```

### Option 3: Via Push Trigger

```bash
# Make a small change to trigger the workflow
echo "# Test" >> benchmark.js
git add benchmark.js
git commit -m "test: trigger workflow"
git push origin main

# Revert if needed
git revert HEAD
git push origin main
```

## Verifying Results

After the workflow runs:

1. Check the **Actions** tab to see the workflow execution
2. Look for updated files in the repository:
   - `benchmark_results_node_v*.json` files should be updated
   - `README.md` should have new benchmark tables
3. Check the commit history for automated commits by `github-actions[bot]`

## Troubleshooting

### Workflow Doesn't Appear

**Problem**: The workflow doesn't show up in the Actions tab.

**Solution**:
- Ensure the workflow file is in `.github/workflows/` directory
- Ensure the file has `.yml` or `.yaml` extension
- Check that you've pushed the file to the `main` branch
- Verify the YAML syntax is valid

### Workflow Runs But Doesn't Commit

**Problem**: The workflow completes successfully but doesn't commit changes.

**Solution**:
- Check **Settings** → **Actions** → **General** → **Workflow permissions**
- Ensure **Read and write permissions** is selected
- Ensure **Allow GitHub Actions to create and approve pull requests** is checked

### Benchmark Fails on Specific Node Version

**Problem**: Benchmarks fail for one or more Node.js versions.

**Solution**: This is expected behavior. The workflow uses `continue-on-error: true` to allow partial results. Check the workflow logs to see which versions failed and why. Common causes:
- Native module compilation issues
- Node.js version incompatibility with dependencies
- Memory or timeout issues

### No Changes to Commit

**Problem**: Workflow logs show "No changes to commit".

**Solution**: This is normal if:
- Benchmark results haven't changed significantly
- The workflow ran but produced identical results
- The README already has the latest results

## Customization

### Change Schedule

Edit `.github/workflows/daily-benchmarks.yml`:

```yaml
on:
  schedule:
    # Change this cron expression
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

Common cron patterns:
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * 0'` - Weekly on Sunday at midnight
- `'0 0 1 * *'` - Monthly on the 1st at midnight
- `'0 0 * * 1-5'` - Weekdays at midnight

### Add/Remove Node.js Versions

Edit the matrix in `.github/workflows/daily-benchmarks.yml`:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22, 24, 'latest']
    # Add or remove versions as needed
```

### Customize README Format

Edit `scripts/update-readme.js` to change:
- Table structure and formatting
- Performance metrics displayed
- Analysis and recommendations
- Additional charts or visualizations

## Security Considerations

### Secrets and Tokens

The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub Actions. This token:
- Has limited permissions scoped to the repository
- Expires after the workflow run
- Cannot be used outside of GitHub Actions
- Is automatically rotated by GitHub

### Permissions

The workflow only requires:
- **contents: write** - To commit benchmark results

No additional secrets or tokens are needed.

### Branch Protection

If you have branch protection rules on `main`:
1. Go to **Settings** → **Branches**
2. Edit the branch protection rule for `main`
3. Under **Restrict who can push to matching branches**
4. Add `github-actions[bot]` to the allowed list

Or disable the rule for automated commits:
- Uncheck **Include administrators** to allow bot commits

## Monitoring

### GitHub Actions Usage

The workflow consumes GitHub Actions minutes. For public repositories, this is free and unlimited. For private repositories:
- Free tier: 2,000 minutes/month
- Each workflow run takes approximately 10-15 minutes total
- Daily runs = ~30 runs/month = ~300-450 minutes/month

### Notifications

To receive notifications when workflows fail:

1. Go to your GitHub profile settings
2. Click **Notifications**
3. Under **Actions**, ensure **Send notifications for failed workflows** is enabled

Or set up custom notifications:
- Use GitHub's webhook integrations
- Add notification steps to the workflow (Slack, Discord, email, etc.)

## Next Steps

After setup:

1. ✅ Wait for the first scheduled run or trigger manually
2. ✅ Verify the results are committed to the repository
3. ✅ Check the updated README for benchmark tables
4. ✅ Review the workflow logs for any issues
5. ✅ Customize the schedule or Node.js versions if needed

## Support

For issues or questions:
- Check the [AUTOMATION.md](./AUTOMATION.md) documentation
- Review the workflow logs in the Actions tab
- Open an issue in the repository
- Consult the [GitHub Actions documentation](https://docs.github.com/en/actions)
