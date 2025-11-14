#!/usr/bin/env node

/**
 * Update README.md with latest benchmark results
 * This script reads all benchmark_results_*.json files and updates the README
 * with a consolidated markdown table showing performance across Node.js versions
 */

const fs = require('fs-extra');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');
const RESULTS_DIR = path.join(__dirname, '..');

// Markers for where to insert benchmark results in README
const START_MARKER = '<!-- BENCHMARK_RESULTS_START -->';
const END_MARKER = '<!-- BENCHMARK_RESULTS_END -->';

async function main() {
  console.log('🔄 Updating README with latest benchmark results...\n');

  // Find all benchmark result files
  const files = await fs.readdir(RESULTS_DIR);
  const resultFiles = files
    .filter(f => f.startsWith('benchmark_results_node_') && f.endsWith('.json'))
    .sort();

  if (resultFiles.length === 0) {
    console.error('❌ No benchmark result files found!');
    process.exit(1);
  }

  console.log(`📊 Found ${resultFiles.length} benchmark result files:`);
  resultFiles.forEach(f => console.log(`   - ${f}`));
  console.log('');

  // Load all benchmark results
  const results = {};
  for (const file of resultFiles) {
    try {
      const data = await fs.readJson(path.join(RESULTS_DIR, file));
      const version = data.node_version;
      results[version] = data;
      console.log(`✅ Loaded results for Node.js ${version}`);
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error.message);
    }
  }

  if (Object.keys(results).length === 0) {
    console.error('❌ No valid benchmark results loaded!');
    process.exit(1);
  }

  // Generate benchmark results section
  const benchmarkSection = generateBenchmarkSection(results);

  // Read current README
  let readme = await fs.readFile(README_PATH, 'utf8');

  // Check if markers exist
  if (readme.includes(START_MARKER) && readme.includes(END_MARKER)) {
    // Replace content between markers
    const beforeMarker = readme.substring(0, readme.indexOf(START_MARKER) + START_MARKER.length);
    const afterMarker = readme.substring(readme.indexOf(END_MARKER));
    readme = beforeMarker + '\n\n' + benchmarkSection + '\n\n' + afterMarker;
  } else {
    // Add markers and content after "## Benchmark Results Summary" section
    const summaryIndex = readme.indexOf('## Benchmark Results Summary');
    if (summaryIndex !== -1) {
      // Find the next ## heading after the summary
      const nextHeadingIndex = readme.indexOf('\n## ', summaryIndex + 1);
      if (nextHeadingIndex !== -1) {
        const before = readme.substring(0, nextHeadingIndex);
        const after = readme.substring(nextHeadingIndex);
        readme = before + '\n\n' + START_MARKER + '\n\n' + benchmarkSection + '\n\n' + END_MARKER + '\n' + after;
      } else {
        // No next heading, append at the end
        readme += '\n\n' + START_MARKER + '\n\n' + benchmarkSection + '\n\n' + END_MARKER + '\n';
      }
    } else {
      // No summary section, append at the end
      readme += '\n\n## Automated Benchmark Results\n\n' + START_MARKER + '\n\n' + benchmarkSection + '\n\n' + END_MARKER + '\n';
    }
  }

  // Write updated README
  await fs.writeFile(README_PATH, readme, 'utf8');

  console.log('\n✅ README.md updated successfully!');
  console.log(`📝 Updated: ${README_PATH}`);
}

function generateBenchmarkSection(results) {
  const versions = Object.keys(results).sort();

  let section = `### Latest Automated Benchmark Results\n\n`;
  section += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n\n`;

  // Get all configuration names from the first result
  const firstResult = results[versions[0]];
  const configs = Object.keys(firstResult.results);

  // Create a table for each configuration
  for (const config of configs) {
    section += `#### ${config}\n\n`;
    section += `| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |\n`;
    section += `|--------------|------------|------------|------------|------------|------------|--------------|---------------|\n`;

    for (const version of versions) {
      const result = results[version].results[config];
      if (result && !result.error) {
        section += `| ${version} | ${result.setup_time.toFixed(1)} | ${result.insert_ops_per_sec.toLocaleString()} | ${result.select_ops_per_sec.toLocaleString()} | ${result.update_ops_per_sec.toLocaleString()} | ${result.delete_ops_per_sec.toLocaleString()} | ${result.db_size_mb} | ${result.wal_size_mb || '0'} |\n`;
      } else if (result && result.error) {
        section += `| ${version} | ERROR | - | - | - | - | - | - |\n`;
      }
    }

    section += `\n`;
  }

  // Add performance comparison section
  section += `### Performance Comparison Summary\n\n`;
  section += `| Node Version | Platform | Arch | Timestamp |\n`;
  section += `|--------------|----------|------|----------|\n`;

  for (const version of versions) {
    const data = results[version];
    const timestamp = new Date(data.timestamp).toLocaleString();
    section += `| ${version} | ${data.platform} | ${data.arch} | ${timestamp} |\n`;
  }

  section += `\n`;

  // Add best performers analysis
  section += `### Best Performers by Operation Type\n\n`;

  const operations = ['insert_ops_per_sec', 'select_ops_per_sec', 'update_ops_per_sec', 'delete_ops_per_sec'];
  const operationNames = {
    'insert_ops_per_sec': 'Insert Operations',
    'select_ops_per_sec': 'Select Operations',
    'update_ops_per_sec': 'Update Operations',
    'delete_ops_per_sec': 'Delete Operations'
  };

  for (const op of operations) {
    let bestValue = 0;
    let bestVersion = '';
    let bestConfig = '';

    for (const version of versions) {
      for (const config of configs) {
        const result = results[version].results[config];
        if (result && !result.error && result[op] > bestValue) {
          bestValue = result[op];
          bestVersion = version;
          bestConfig = config;
        }
      }
    }

    section += `**${operationNames[op]}:** ${bestConfig} on Node.js ${bestVersion} (${bestValue.toLocaleString()} ops/sec)\n\n`;
  }

  return section;
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
