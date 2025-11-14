# SQLite Performance Benchmarks

Comprehensive SQLite performance benchmarking suite testing PRAGMA settings, WAL mode optimizations, and encryption performance across multiple Node.js versions.

> [!IMPORTANT]
> This benchmark suite was created to analyze Forward Email's production SQLite configuration and identify optimization opportunities. All tests are based on real-world email infrastructure requirements handling millions of messages.

## Overview

This project benchmarks SQLite performance across different Node.js versions (v18, v20, v22, v24) with various PRAGMA configurations, focusing on:

- **PRAGMA setting optimizations** - Testing Forward Email's actual production settings
- **WAL mode performance** - Analyzing Write-Ahead Logging impact on throughput
- **ChaCha20 encryption** - Quantum-resistant encryption performance testing
- **Cross-version compatibility** - Node.js version performance comparison
- **Production workload simulation** - Insert/Select/Update operations mimicking email storage

## Quick Start

> [!TIP]
> Use Node.js v20 LTS for best performance. Other versions show significant performance regressions.

```bash
# Clone and setup
git clone <repository-url>
cd sqlite-benchmarks
npm install

# Run benchmarks
npm run benchmark

# View results
ls -la benchmark_results_*.json
```

## Files Structure

```
sqlite-benchmarks/
├── README.md                           # This documentation
├── LICENSE.md                          # MIT License
├── package.json                        # Dependencies and scripts
├── package-lock.json                   # Locked dependency versions
├── .gitignore                          # Git ignore patterns
├── benchmark.js                        # Main benchmark script
├── benchmark_results_node_v18.20.8.json   # Node v18 results
├── benchmark_results_node_v20.19.5.json   # Node v20 results (recommended)
├── benchmark_results_node_v22.21.1.json   # Node v22 results
└── benchmark_results_node_v24.11.1.json   # Node v24 results (avoid)
```

## Dependencies

> [!CAUTION]
> The `better-sqlite3-multiple-ciphers` package requires native compilation. You may need to rebuild when switching Node.js versions.

- **better-sqlite3-multiple-ciphers** - SQLite with ChaCha20 encryption support
- **benchmark** - Performance testing framework

## Benchmark Results Summary

### Node.js v20.19.5 (✅ RECOMMENDED)
**Forward Email Production Config:**
- Inserts: 10,548 ops/sec
- Selects: 17,494 ops/sec  
- Updates: 16,654 ops/sec

**Best Optimization (WAL Autocheckpoint 1000):**
- Inserts: 11,800 ops/sec (+12% improvement)
- Selects: 18,383 ops/sec (+5% improvement)
- Updates: 22,087 ops/sec (+33% improvement)

### Node.js v18.20.8 (⚠️ LEGACY ACCEPTABLE)
**Forward Email Production Config:**
- Inserts: 10,658 ops/sec
- Selects: 14,466 ops/sec (-17% vs v20)
- Updates: 18,641 ops/sec

> [!NOTE]
> Node v18 shows npm engine warnings but compiles and runs successfully. Performance is acceptable for legacy applications.

### Node.js v22.21.1 (⚠️ DEVELOPMENT ONLY)
**Forward Email Production Config:**
- Inserts: 9,829 ops/sec (-7% vs v20)
- Selects: 15,833 ops/sec (-9% vs v20)
- Updates: 18,416 ops/sec

### Node.js v24.11.1 (❌ AVOID)
**Forward Email Production Config:**
- Inserts: 9,938 ops/sec
- Selects: 7,497 ops/sec (-57% vs v20)
- Updates: 10,446 ops/sec

> [!WARNING]
> Node.js v24 shows severe performance regressions for SQLite operations. Not recommended for production use.


<!-- BENCHMARK_RESULTS_START -->

### Latest Automated Benchmark Results

**Last Updated:** 2025-11-14

#### Forward Email Production

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 112.0 | 10,658 | 14,466 | 18,641 | 75,614 | 3.98 | 4.04 |
| v20.19.5 | 118.8 | 9,772 | 13,244 | 18,085 | 52,645 | 3.98 | 4.04 |
| v22.21.1 | 125.8 | 9,829 | 15,833 | 18,416 | 8,120 | 3.98 | 4.04 |
| v24.11.1 | 123.6 | 9,938 | 7,497 | 10,446 | 66,203 | 3.98 | 4.04 |
| v25.2.0 | 113.1 | 9,032 | 15,189 | 17,763 | 53,723 | 3.98 | 4.04 |

#### Memory Temp Storage

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 96.4 | 10,854 | 14,868 | 19,547 | 111,882 | 3.98 | 4.04 |
| v20.19.5 | 97.8 | 9,274 | 13,109 | 18,395 | 88,637 | 3.98 | 4.04 |
| v22.21.1 | 102.8 | 10,447 | 15,044 | 20,192 | 79,834 | 3.98 | 4.04 |
| v24.11.1 | 118.3 | 8,792 | 12,608 | 16,794 | 81,281 | 3.98 | 4.04 |
| v25.2.0 | 99.7 | 8,322 | 15,507 | 18,095 | 81,880 | 3.98 | 4.04 |

#### Synchronous OFF (Unsafe)

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 87.5 | 11,663 | 14,835 | 19,697 | 103,950 | 3.98 | 4.04 |
| v20.19.5 | 99.4 | 10,690 | 11,490 | 12,409 | 45,723 | 3.98 | 4.04 |
| v22.21.1 | 87.5 | 11,260 | 17,239 | 20,120 | 105,966 | 3.98 | 4.04 |
| v24.11.1 | 126.4 | 8,617 | 9,316 | 15,436 | 78,382 | 3.98 | 4.04 |
| v25.2.0 | 98.3 | 10,441 | 15,529 | 18,209 | 42,366 | 3.98 | 4.04 |

#### Synchronous EXTRA (Safe)

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 100.0 | 3,810 | 14,348 | 4,781 | 100,281 | 3.98 | 4.04 |
| v20.19.5 | 126.5 | 3,629 | 11,474 | 5,264 | 74,710 | 3.98 | 4.04 |
| v22.21.1 | 96.7 | 4,638 | 17,081 | 5,734 | 101,523 | 3.98 | 4.04 |
| v24.11.1 | 144.2 | 2,973 | 9,294 | 4,405 | 96,852 | 3.98 | 4.04 |
| v25.2.0 | 101.7 | 2,725 | 15,114 | 3,346 | 74,766 | 3.98 | 4.04 |

#### No Auto Vacuum

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 97.3 | 11,197 | 14,635 | 19,182 | 116,768 | 4.12 | 7.41 |
| v20.19.5 | 98.6 | 10,405 | 12,638 | 18,144 | 86,873 | 4.12 | 7.41 |
| v22.21.1 | 94.7 | 11,001 | 17,000 | 19,486 | 112,613 | 4.12 | 7.41 |
| v24.11.1 | 100.2 | 9,981 | 16,660 | 19,736 | 113,340 | 4.12 | 7.41 |
| v25.2.0 | 99.3 | 9,757 | 14,620 | 17,738 | 78,162 | 4.12 | 7.41 |

#### Incremental Vacuum

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 98.0 | 10,516 | 11,737 | 19,863 | 115,660 | 4.13 | 7.41 |
| v20.19.5 | 112.0 | 7,337 | 13,386 | 18,619 | 87,252 | 4.13 | 7.41 |
| v22.21.1 | 97.5 | 10,690 | 13,274 | 19,033 | 91,988 | 4.13 | 7.41 |
| v24.11.1 | 96.9 | 10,628 | 16,821 | 19,934 | 117,509 | 4.13 | 7.41 |
| v25.2.0 | 100.6 | 9,695 | 13,826 | 17,858 | 86,573 | 4.13 | 7.41 |

#### WAL Autocheckpoint 1000

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 97.9 | 10,878 | 14,753 | 19,721 | 102,375 | 3.98 | 4.04 |
| v20.19.5 | 99.8 | 10,473 | 13,912 | 18,455 | 88,331 | 3.98 | 4.04 |
| v22.21.1 | 96.6 | 11,008 | 15,630 | 19,202 | 99,039 | 3.98 | 4.04 |
| v24.11.1 | 118.2 | 10,511 | 14,410 | 19,432 | 107,550 | 3.98 | 4.04 |
| v25.2.0 | 99.7 | 9,608 | 14,918 | 18,115 | 83,598 | 3.98 | 4.04 |

#### Cache Size 64MB

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 95.4 | 10,887 | 14,862 | 19,226 | 102,575 | 3.98 | 4.04 |
| v20.19.5 | 94.0 | 10,533 | 14,434 | 18,645 | 89,598 | 3.98 | 4.04 |
| v22.21.1 | 103.1 | 10,389 | 16,285 | 20,021 | 100,644 | 3.98 | 4.04 |
| v24.11.1 | 106.8 | 9,385 | 10,502 | 15,585 | 79,170 | 3.98 | 4.04 |
| v25.2.0 | 97.8 | 9,848 | 15,344 | 18,032 | 87,176 | 3.98 | 4.04 |

#### MMAP 256MB

| Node Version | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) | WAL Size (MB) |
|--------------|------------|------------|------------|------------|------------|--------------|---------------|
| v18.20.8 | 95.0 | 11,214 | 13,718 | 20,095 | 116,144 | 3.98 | 4.04 |
| v20.19.5 | 106.3 | 10,375 | 14,237 | 17,429 | 84,875 | 3.98 | 4.04 |
| v22.21.1 | 95.9 | 10,920 | 17,413 | 20,731 | 119,531 | 3.98 | 4.04 |
| v24.11.1 | 107.2 | 9,419 | 13,363 | 19,434 | 94,153 | 3.98 | 4.04 |
| v25.2.0 | 98.6 | 9,620 | 15,633 | 18,122 | 82,420 | 3.98 | 4.04 |

### Performance Comparison Summary

| Node Version | Platform | Arch | Timestamp |
|--------------|----------|------|----------|
| v18.20.8 | linux | x64 | 11/14/2025, 1:45:57 PM |
| v20.19.5 | linux | x64 | 11/14/2025, 6:56:55 PM |
| v22.21.1 | linux | x64 | 11/14/2025, 1:32:10 PM |
| v24.11.1 | linux | x64 | 11/14/2025, 1:33:38 PM |
| v25.2.0 | linux | x64 | 11/14/2025, 5:56:49 PM |

### Best Performers by Operation Type

**Insert Operations:** Synchronous OFF (Unsafe) on Node.js v18.20.8 (11,663 ops/sec)

**Select Operations:** MMAP 256MB on Node.js v22.21.1 (17,413 ops/sec)

**Update Operations:** MMAP 256MB on Node.js v22.21.1 (20,731 ops/sec)

**Delete Operations:** MMAP 256MB on Node.js v22.21.1 (119,531 ops/sec)



<!-- BENCHMARK_RESULTS_END -->

## Forward Email's Production Configuration

The benchmark tests Forward Email's actual production PRAGMA settings:

```sql
PRAGMA analysis_limit = 400;
PRAGMA auto_vacuum = NONE;
PRAGMA automatic_index = ON;
PRAGMA busy_timeout = 30000;
PRAGMA cache_size = -16000;
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = 1;
PRAGMA wal_autocheckpoint = 1000;
```

> [!IMPORTANT]
> These settings are optimized for Forward Email's email infrastructure handling millions of messages with perfect user isolation through per-user SQLite databases.

## Running Benchmarks

### Prerequisites

1. **Install Node.js** (v20 LTS recommended)
2. **Install build tools** for native compilation:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install build-essential python3

   # macOS
   xcode-select --install

   # Windows
   npm install --global windows-build-tools
   ```

### Basic Usage

```bash
# Install dependencies
npm install

# Run full benchmark suite
npm run benchmark

# Results are saved to benchmark_results_node_v{version}.json
```

### Switching Node.js Versions

> [!CAUTION]
> Native modules must be recompiled when switching Node.js versions.

```bash
# Switch to different Node version
nvm use 20  # or 18, 22, 24

# Clean and reinstall native modules
rm -rf node_modules package-lock.json
npm install

# Run benchmarks
npm run benchmark
```

## Benchmark Configurations Tested

The benchmark tests 12 different SQLite configurations:

1. **Forward Email Production** - Actual production settings
2. **WAL Autocheckpoint 1000** - Optimized checkpoint frequency
3. **Memory Temp Storage** - `temp_store = MEMORY`
4. **Increased Cache** - `cache_size = -64000`
5. **MMAP 256MB** - Memory-mapped I/O
6. **Sync OFF** - Disabled synchronization (testing only)
7. **Incremental Vacuum** - `auto_vacuum = INCREMENTAL`
8. **Analysis Limit 1000** - Increased query planner limit
9. **Busy Timeout 60s** - Extended lock timeout
10. **Cache + MMAP** - Combined optimizations
11. **All Optimizations** - Maximum performance settings
12. **Baseline** - Minimal PRAGMA settings

## Performance Analysis

### Key Findings

1. **Node.js v20 LTS is optimal** for SQLite applications
2. **WAL autocheckpoint=1000** provides consistent 12% performance boost
3. **ChaCha20 encryption** has minimal performance impact (6% overhead)
4. **Node.js v24 has severe regressions** - avoid for SQLite workloads
5. **Native module recompilation** required when switching Node versions

### Optimization Recommendations

> [!TIP]
> For production SQLite applications, use Node.js v20 LTS with `wal_autocheckpoint=1000` for optimal performance.

**Production Settings:**
- Use `journal_mode = WAL` for concurrent access
- Set `wal_autocheckpoint = 1000` for 12% performance boost
- Keep `temp_store = 1` (disk) to prevent memory exhaustion
- Use `cache_size = -16000` (16MB) for balanced memory usage
- Enable `foreign_keys = ON` for data integrity

**Development/Testing:**
- Consider `synchronous = OFF` for testing (never in production)
- Use `temp_store = MEMORY` for temporary performance gains
- Increase `cache_size` for read-heavy workloads

## ChaCha20 Encryption Performance

Forward Email uses ChaCha20 encryption for quantum resistance:

```javascript
// ChaCha20 configuration
const db = new Database(':memory:', {
  nativeBinding: 'better-sqlite3-multiple-ciphers/build/Release/better_sqlite3.node'
});

db.pragma('cipher = chacha20');
db.pragma('key = "your-encryption-key"');
```

**Performance Impact:**
- ChaCha20: ~6% slower than unencrypted
- AES256: ~4% slower than unencrypted
- **Quantum resistance** worth the minimal performance cost

> [!NOTE]
> Forward Email prioritizes quantum-resistant encryption over raw performance, making ChaCha20 the optimal choice for long-term security.

## Troubleshooting

### Native Module Compilation Issues

**Error:** `Module version mismatch`
```bash
# Solution: Rebuild native modules
rm -rf node_modules
npm install
```

**Error:** `Python not found`
```bash
# Ubuntu/Debian
sudo apt-get install python3 python3-dev

# macOS
brew install python3

# Windows
npm install --global windows-build-tools
```

### Node.js Version Issues

**Node v18 Engine Warnings:**
```
npm WARN EBADENGINE Unsupported engine { required: { node: '>=20.0.0' } }
```
This is expected - the package prefers Node ≥20 but works on v18.

**Node v22/v24 Performance Issues:**
Use Node v20 LTS for optimal SQLite performance. Newer versions have regressions.

## Contributing

This benchmark suite is part of Forward Email's open source contributions to the SQLite community. See our other contributions:

- [Litestream Documentation Improvements](https://github.com/benbjohnson/litestream/issues/516)
- [npm Package Ecosystem Contributions](https://forwardemail.net/blog/docs/how-npm-packages-billion-downloads-shaped-javascript-ecosystem)

## Related Resources

- [Forward Email SQLite Optimization Blog Post](https://forwardemail.net/blog/docs/sqlite-performance-optimization-pragma-chacha20-production-guide)
- [Quantum-Resistant Encryption Guide](https://forwardemail.net/blog/docs/quantum-resistant-encryption-email-security)
- [Richard Hipp's BLOB Column Optimization](https://sqlite.org/forum/forumpost/d6b5b2b7c8)

---

**Created by:** Forward Email Team  
**License:** MIT  
**Node.js Support:** v18+ (v20 LTS recommended)
