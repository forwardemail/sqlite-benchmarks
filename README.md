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
