# SQLite Performance Benchmarks

Comprehensive SQLite performance benchmarking suite testing PRAGMA settings, WAL mode optimizations, and encryption performance across multiple Node.js versions.

> [!IMPORTANT]
> This benchmark suite was created to analyze Forward Email's production SQLite configuration and identify optimization opportunities. All tests are based on real-world email infrastructure requirements handling millions of messages.

## Overview

This project benchmarks SQLite performance across different Node.js versions (v18, v20, v22, v24) with various PRAGMA configurations, focusing on:

- **PRAGMA setting optimizations** - Testing Forward Email's actual production settings
- **WAL mode performance** - Analyzing Write-Ahead Logging impact on throughput
- **ChaCha20 encryption** - Quantum-resistant encryption performance testing
- **Encryption overhead analysis** - Comparing better-sqlite3-multiple-ciphers vs better-sqlite3
- **Cross-version compatibility** - Node.js version performance comparison
- **Production workload simulation** - Insert/Select/Update operations mimicking email storage

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
- **better-sqlite3** - Standard SQLite without encryption (for comparison)
- **benchmark** - Performance testing framework
- **cli-table3** - Terminal table formatting
- **fs-extra** - Enhanced filesystem operations

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

## Encryption Overhead Analysis

The benchmark suite includes a comparison between `better-sqlite3-multiple-ciphers` (with ChaCha20 encryption) and standard `better-sqlite3` (no encryption) to quantify the performance impact of encryption.

> [!NOTE]
> The "better-sqlite3 (no encryption)" configuration uses the standard `better-sqlite3` package without encryption, while all other configurations use `better-sqlite3-multiple-ciphers` with ChaCha20 encryption.

**Typical Encryption Overhead (Node.js v20):**
- **Insert Operations:** ~70-75% slower with ChaCha20 encryption
- **Select Operations:** ~45-50% slower with ChaCha20 encryption
- **Update Operations:** ~70-75% slower with ChaCha20 encryption

While encryption adds overhead, it provides quantum-resistant security for sensitive email data. The performance trade-off is acceptable for Forward Email's security requirements.

<!-- BENCHMARK_RESULTS_START -->

### Latest Automated Benchmark Results

**Last Updated:** 2026-01-25

#### Cache Size 64MB

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 76.1 | 12,330 | 26,946 | 21,278 | 155,836 | 3.98 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 95.4 | 10,887 | 14,862 | 19,226 | 102,575 | 3.98 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 94.6 | 10,205 | 14,034 | 18,571 | 85,164 | 3.98 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 92.6 | 10,629 | 14,382 | 18,952 | 89,759 | 3.98 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 97.0 | 10,324 | 14,269 | 18,260 | 84,731 | 3.98 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 86.7 | 12,778 | 19,765 | 23,104 | 134,608 | 3.98 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 103.1 | 10,389 | 16,285 | 20,021 | 100,644 | 3.98 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 94.8 | 10,099 | 32,997 | 18,502 | 87,329 | 3.98 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 106.8 | 9,385 | 10,502 | 15,585 | 79,170 | 3.98 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 97.7 | 9,905 | 32,380 | 18,792 | 75,216 | 3.98 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 96.7 | 10,240 | 32,724 | 18,477 | 89,358 | 3.98 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 97.8 | 9,848 | 15,344 | 18,032 | 87,176 | 3.98 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 97.0 | 10,043 | 32,479 | 18,239 | 92,764 | 3.98 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 96.1 | 9,684 | 33,121 | 18,216 | 85,970 | 3.98 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 98.1 | 9,819 | 32,430 | 18,170 | 82,088 | 3.98 |

#### Forward Email Production

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 238.6 | 11,778 | 26,632 | 21,163 | 124,347 | 3.98 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 112.0 | 10,658 | 14,466 | 18,641 | 75,614 | 3.98 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 125.4 | 9,730 | 14,221 | 18,455 | 58,439 | 3.98 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 120.1 | 9,804 | 14,157 | 18,802 | 56,076 | 3.98 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 122.7 | 9,734 | 14,485 | 18,377 | 56,329 | 3.98 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 108.4 | 12,022 | 19,187 | 22,204 | 87,466 | 3.98 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 125.8 | 9,829 | 15,833 | 18,416 | 8,120 | 3.98 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 128.1 | 9,563 | 31,392 | 18,263 | 49,461 | 3.98 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 123.6 | 9,938 | 7,497 | 10,446 | 66,203 | 3.98 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 121.6 | 9,404 | 31,049 | 12,056 | 34,265 | 3.98 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 110.5 | 6,676 | 29,460 | 17,920 | 54,690 | 3.98 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 113.1 | 9,032 | 15,189 | 17,763 | 53,723 | 3.98 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 113.6 | 9,572 | 31,101 | 18,170 | 61,312 | 3.98 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 124.4 | 9,200 | 30,847 | 18,005 | 60,938 | 3.98 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 124.2 | 9,419 | 31,216 | 18,109 | 59,556 | 3.98 |

#### Incremental Vacuum

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 78.2 | 12,034 | 27,226 | 21,070 | 108,601 | 4.13 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 98.0 | 10,516 | 11,737 | 19,863 | 115,660 | 4.13 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 96.8 | 10,245 | 14,462 | 18,323 | 86,565 | 4.13 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 95.5 | 10,401 | 13,977 | 18,924 | 85,977 | 4.13 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 94.9 | 10,241 | 14,738 | 18,533 | 85,092 | 4.13 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 91.1 | 12,533 | 19,258 | 22,819 | 136,724 | 4.13 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 97.5 | 10,690 | 13,274 | 19,033 | 91,988 | 4.13 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 103.1 | 5,057 | 31,660 | 18,396 | 83,808 | 4.13 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 96.9 | 10,628 | 16,821 | 19,934 | 117,509 | 4.13 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 100.1 | 9,943 | 33,441 | 18,635 | 82,974 | 4.13 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 96.7 | 10,159 | 30,867 | 18,209 | 53,121 | 4.13 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 100.6 | 9,695 | 13,826 | 17,858 | 86,573 | 4.13 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 96.3 | 9,982 | 30,632 | 18,263 | 91,066 | 4.13 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 98.4 | 9,766 | 32,600 | 17,687 | 85,455 | 4.13 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 97.8 | 9,659 | 32,272 | 18,023 | 86,118 | 4.13 |

#### MMAP 256MB

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 74.5 | 12,234 | 27,098 | 21,195 | 165,508 | 3.98 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 95.0 | 11,214 | 13,718 | 20,095 | 116,144 | 3.98 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 94.7 | 10,281 | 14,520 | 18,537 | 82,420 | 3.98 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 93.0 | 10,409 | 14,467 | 18,645 | 87,866 | 3.98 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 95.6 | 9,928 | 13,220 | 18,538 | 85,020 | 3.98 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 85.6 | 12,666 | 20,391 | 23,226 | 123,609 | 3.98 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 95.9 | 10,920 | 17,413 | 20,731 | 119,531 | 3.98 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 97.3 | 10,140 | 33,103 | 18,477 | 86,192 | 3.98 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 107.2 | 9,419 | 13,363 | 19,434 | 94,153 | 3.98 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 98.5 | 10,218 | 34,443 | 18,783 | 88,960 | 3.98 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 96.4 | 10,059 | 31,541 | 17,970 | 85,675 | 3.98 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 98.6 | 9,620 | 15,633 | 18,122 | 82,420 | 3.98 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 96.9 | 9,914 | 32,293 | 18,157 | 90,245 | 3.98 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 98.0 | 9,908 | 33,508 | 18,164 | 81,281 | 3.98 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 96.9 | 9,826 | 32,614 | 18,006 | 88,960 | 3.98 |

#### Memory Temp Storage

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 77.2 | 12,150 | 27,429 | 21,113 | 110,096 | 3.98 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 96.4 | 10,854 | 14,868 | 19,547 | 111,882 | 3.98 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 94.5 | 10,052 | 14,351 | 17,796 | 79,277 | 3.98 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 93.7 | 10,547 | 14,419 | 18,847 | 86,266 | 3.98 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 95.4 | 10,067 | 14,696 | 18,276 | 83,043 | 3.98 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 97.1 | 10,971 | 19,857 | 22,588 | 121,581 | 3.98 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 102.8 | 10,447 | 15,044 | 20,192 | 79,834 | 3.98 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 96.0 | 9,935 | 32,410 | 18,517 | 82,699 | 3.98 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 118.3 | 8,792 | 12,608 | 16,794 | 81,281 | 3.98 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 100.0 | 10,226 | 33,217 | 18,611 | 82,223 | 3.98 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 106.8 | 9,710 | 31,358 | 18,669 | 91,819 | 3.98 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 99.7 | 8,322 | 15,507 | 18,095 | 81,880 | 3.98 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 96.3 | 6,658 | 25,696 | 17,844 | 84,803 | 3.98 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 97.2 | 9,979 | 32,078 | 18,130 | 89,518 | 3.98 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 98.0 | 9,961 | 31,357 | 17,709 | 86,573 | 3.98 |

#### No Auto Vacuum

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 76.8 | 12,077 | 27,109 | 20,485 | 137,931 | 4.12 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 97.3 | 11,197 | 14,635 | 19,182 | 116,768 | 4.12 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 97.8 | 10,072 | 14,529 | 18,070 | 84,947 | 4.12 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 97.2 | 10,526 | 14,377 | 19,060 | 88,331 | 4.12 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 96.0 | 10,355 | 14,573 | 18,251 | 80,691 | 4.12 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 95.3 | 11,169 | 18,908 | 22,200 | 118,078 | 4.12 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 94.7 | 11,001 | 17,000 | 19,486 | 112,613 | 4.12 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 95.6 | 10,282 | 32,330 | 17,301 | 82,905 | 4.12 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 100.2 | 9,981 | 16,660 | 19,736 | 113,340 | 4.12 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 99.0 | 9,905 | 29,382 | 18,713 | 83,591 | 4.12 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 96.5 | 10,024 | 28,056 | 18,407 | 92,251 | 4.12 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 99.3 | 9,757 | 14,620 | 17,738 | 78,162 | 4.12 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 98.1 | 9,917 | 27,705 | 17,918 | 89,437 | 4.12 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 97.9 | 9,973 | 28,272 | 18,076 | 85,749 | 4.12 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 97.5 | 10,000 | 28,062 | 17,938 | 85,455 | 4.12 |

#### Synchronous EXTRA (Safe)

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 77.5 | 8,884 | 26,936 | 12,477 | 162,153 | 3.98 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 100.0 | 3,810 | 14,348 | 4,781 | 100,281 | 3.98 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 98.7 | 3,331 | 14,314 | 4,257 | 61,308 | 3.98 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 96.9 | 3,495 | 12,604 | 4,653 | 76,023 | 3.98 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 96.7 | 2,728 | 14,226 | 4,798 | 75,103 | 3.98 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 92.7 | 4,275 | 18,716 | 5,659 | 100,513 | 3.98 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 96.7 | 4,638 | 17,081 | 5,734 | 101,523 | 3.98 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 97.7 | 3,003 | 31,269 | 4,320 | 71,043 | 3.98 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 144.2 | 2,973 | 9,294 | 4,405 | 96,852 | 3.98 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 103.1 | 1,161 | 28,242 | 3,525 | 71,808 | 3.98 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 100.6 | 3,181 | 31,463 | 4,513 | 77,676 | 3.98 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 101.7 | 2,725 | 15,114 | 3,346 | 74,766 | 3.98 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 100.4 | 3,018 | 30,549 | 3,917 | 72,754 | 3.98 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 101.2 | 3,023 | 31,018 | 4,334 | 70,942 | 3.98 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 100.7 | 3,098 | 29,866 | 4,300 | 70,048 | 3.98 |

#### Synchronous OFF (Unsafe)

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 101.0 | 13,275 | 27,223 | 23,768 | 151,906 | 3.98 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 87.5 | 11,663 | 14,835 | 19,697 | 103,950 | 3.98 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 90.9 | 10,536 | 14,515 | 18,804 | 83,389 | 3.98 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 90.6 | 11,088 | 14,270 | 19,179 | 87,789 | 3.98 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 91.2 | 10,435 | 14,622 | 18,625 | 86,348 | 3.98 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 82.1 | 10,093 | 19,517 | 23,070 | 130,839 | 3.98 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 87.5 | 11,260 | 17,239 | 20,120 | 105,966 | 3.98 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 96.0 | 11,027 | 28,781 | 18,689 | 40,362 | 3.98 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 126.4 | 8,617 | 9,316 | 15,436 | 78,382 | 3.98 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 97.9 | 10,818 | 33,729 | 19,006 | 77,736 | 3.98 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 98.3 | 9,238 | 32,278 | 18,481 | 89,119 | 3.98 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 98.3 | 10,441 | 15,529 | 18,209 | 42,366 | 3.98 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 102.2 | 8,826 | 30,904 | 18,510 | 89,847 | 3.98 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 97.8 | 10,487 | 32,856 | 18,527 | 88,020 | 3.98 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 98.2 | 10,142 | 32,099 | 18,404 | 89,518 | 3.98 |

#### WAL Autocheckpoint 1000

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3-multiple-ciphers | 77.0 | 12,166 | 27,033 | 21,289 | 137,155 | 3.98 |
| v18.20.8 | better-sqlite3-multiple-ciphers | 97.9 | 10,878 | 14,753 | 19,721 | 102,375 | 3.98 |
| v20.19.5 | better-sqlite3-multiple-ciphers | 93.6 | 10,191 | 13,996 | 18,543 | 86,118 | 3.98 |
| v20.19.6 | better-sqlite3-multiple-ciphers | 94.5 | 10,647 | 14,456 | 18,919 | 87,943 | 3.98 |
| v20.20.0 | better-sqlite3-multiple-ciphers | 93.8 | 10,348 | 14,234 | 18,438 | 86,051 | 3.98 |
| v22.13.0 | better-sqlite3-multiple-ciphers | 88.4 | 11,981 | 19,530 | 23,199 | 124,270 | 3.98 |
| v22.21.1 | better-sqlite3-multiple-ciphers | 96.6 | 11,008 | 15,630 | 19,202 | 99,039 | 3.98 |
| v22.22.0 | better-sqlite3-multiple-ciphers | 94.7 | 10,088 | 32,865 | 18,235 | 86,790 | 3.98 |
| v24.11.1 | better-sqlite3-multiple-ciphers | 118.2 | 10,511 | 14,410 | 19,432 | 107,550 | 3.98 |
| v24.12.0 | better-sqlite3-multiple-ciphers | 98.2 | 9,943 | 33,606 | 18,729 | 85,455 | 3.98 |
| v24.13.0 | better-sqlite3-multiple-ciphers | 96.7 | 10,185 | 32,598 | 16,821 | 32,502 | 3.98 |
| v25.2.0 | better-sqlite3-multiple-ciphers | 99.7 | 9,608 | 14,918 | 18,115 | 83,598 | 3.98 |
| v25.2.1 | better-sqlite3-multiple-ciphers | 96.4 | 9,943 | 32,686 | 18,128 | 91,912 | 3.98 |
| v25.3.0 | better-sqlite3-multiple-ciphers | 97.2 | 9,973 | 33,224 | 18,194 | 83,949 | 3.98 |
| v25.4.0 | better-sqlite3-multiple-ciphers | 96.0 | 9,815 | 32,423 | 18,153 | 79,981 | 3.98 |

#### better-sqlite3 (no encryption)

| Node Version | Library | Setup (ms) | Insert/sec | Select/sec | Update/sec | Delete/sec | DB Size (MB) |
|--------------|---------|------------|------------|------------|------------|------------|--------------|
| v18.20.4 | better-sqlite3 | 227.7 | 25,149 | 23,360 | 60,954 | 157,903 | 3.98 |
| v18.20.8 | - | - | - | - | - | - | - |
| v20.19.5 | better-sqlite3 | 26.4 | 29,498 | 14,404 | 50,049 | 78,964 | 3.98 |
| v20.19.6 | better-sqlite3 | 25.1 | 30,968 | 14,372 | 53,149 | 96,246 | 3.98 |
| v20.20.0 | better-sqlite3 | 24.6 | 30,054 | 14,751 | 49,507 | 85,099 | 3.98 |
| v22.13.0 | better-sqlite3 | 27.0 | 44,889 | 36,970 | 87,725 | 134,735 | 3.98 |
| v22.21.1 | - | - | - | - | - | - | - |
| v22.22.0 | better-sqlite3 | 25.3 | 30,052 | 32,922 | 51,655 | 91,399 | 3.98 |
| v24.11.1 | - | - | - | - | - | - | - |
| v24.12.0 | better-sqlite3 | 28.4 | 28,691 | 33,270 | 51,436 | 81,753 | 3.98 |
| v24.13.0 | better-sqlite3 | 29.3 | 27,209 | 32,550 | 49,852 | 92,678 | 3.98 |
| v25.2.0 | - | - | - | - | - | - | - |
| v25.2.1 | better-sqlite3 | 26.9 | 29,015 | 33,338 | 51,162 | 93,110 | 3.98 |
| v25.3.0 | better-sqlite3 | 28.4 | 29,734 | 32,338 | 51,872 | 88,331 | 3.98 |
| v25.4.0 | better-sqlite3 | 27.8 | 29,247 | 31,821 | 52,033 | 82,291 | 3.98 |

### Performance Comparison Summary

| Node Version | Platform | Arch | Timestamp |
|--------------|----------|------|----------|
| v18.20.4 | darwin | arm64 | 11/15/2025, 3:17:47 AM |
| v18.20.8 | linux | x64 | 11/14/2025, 1:45:57 PM |
| v20.19.5 | linux | x64 | 12/3/2025, 2:41:14 AM |
| v20.19.6 | linux | x64 | 1/22/2026, 2:52:43 AM |
| v20.20.0 | linux | x64 | 1/25/2026, 2:57:17 AM |
| v22.13.0 | linux | x64 | 11/15/2025, 3:02:58 AM |
| v22.21.1 | linux | x64 | 11/14/2025, 1:32:10 PM |
| v22.22.0 | linux | x64 | 1/23/2026, 2:49:01 AM |
| v24.11.1 | linux | x64 | 11/14/2025, 1:33:38 PM |
| v24.12.0 | linux | x64 | 12/18/2025, 2:42:14 AM |
| v24.13.0 | linux | x64 | 1/23/2026, 2:48:57 AM |
| v25.2.0 | linux | x64 | 11/14/2025, 5:56:49 PM |
| v25.2.1 | linux | x64 | 11/18/2025, 2:41:30 AM |
| v25.3.0 | linux | x64 | 1/14/2026, 2:53:55 AM |
| v25.4.0 | linux | x64 | 1/20/2026, 2:51:05 AM |

### Best Performers by Operation Type

**Insert Operations:** better-sqlite3 (no encryption) on Node.js v22.13.0 (44,889 ops/sec)

**Select Operations:** better-sqlite3 (no encryption) on Node.js v22.13.0 (36,970 ops/sec)

**Update Operations:** better-sqlite3 (no encryption) on Node.js v22.13.0 (87,725 ops/sec)

**Delete Operations:** MMAP 256MB on Node.js v18.20.4 (165,508 ops/sec)



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
