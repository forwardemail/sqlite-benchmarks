#!/usr/bin/env node

/**
 * SQLite PRAGMA Performance Benchmarks
 * Based on Forward Email's actual implementation
 */

const Database = require('better-sqlite3-multiple-ciphers');
const Benchmark = require('benchmark');
const Table = require('cli-table3');
const fs = require('fs-extra');
const path = require('path');

// Test configurations based on Forward Email's actual setup
const FORWARD_EMAIL_CONFIG = {
  cipher: 'chacha20',
  journal_mode: 'WAL',
  secure_delete: 'ON',
  auto_vacuum: 'FULL',
  busy_timeout: 30000,
  synchronous: 'NORMAL',
  foreign_keys: 'ON',
  encoding: 'UTF-8',
  optimize: '0x10002',
  temp_store: 1  // Forward Email uses disk, not memory
};

// Test variations to benchmark
const TEST_CONFIGS = {
  'Forward Email Production': FORWARD_EMAIL_CONFIG,
  'Memory Temp Storage': { ...FORWARD_EMAIL_CONFIG, temp_store: 2 },
  'Synchronous OFF (Unsafe)': { ...FORWARD_EMAIL_CONFIG, synchronous: 'OFF' },
  'Synchronous EXTRA (Safe)': { ...FORWARD_EMAIL_CONFIG, synchronous: 'EXTRA' },
  'No Auto Vacuum': { ...FORWARD_EMAIL_CONFIG, auto_vacuum: 'NONE' },
  'Incremental Vacuum': { ...FORWARD_EMAIL_CONFIG, auto_vacuum: 'INCREMENTAL' },
  'WAL Autocheckpoint 1000': { ...FORWARD_EMAIL_CONFIG, wal_autocheckpoint: 1000 },
  'Cache Size 64MB': { ...FORWARD_EMAIL_CONFIG, cache_size: -64000 },
  'MMAP 256MB': { ...FORWARD_EMAIL_CONFIG, mmap_size: 268435456 }
};

class SQLiteBenchmark {
  constructor() {
    this.results = {};
    this.dbDir = path.join(__dirname, 'test_dbs');
    this.tempDir = path.join(__dirname, 'tmp');
  }

  async setup() {
    await fs.ensureDir(this.dbDir);
    await fs.ensureDir(this.tempDir);

    // Set SQLITE_TMPDIR environment variable like Forward Email does
    process.env.SQLITE_TMPDIR = this.tempDir;

    console.log('🚀 Starting SQLite PRAGMA Performance Benchmarks');
    console.log(`📊 Testing ${Object.keys(TEST_CONFIGS).length} configurations`);
    console.log(`🔧 Node.js version: ${process.version}`);
    console.log('');
  }

  setupPragma(db, config, testPassword = 'test-password-123') {
    // Mimic Forward Email's setup-pragma.js implementation
    if (!db.open) throw new TypeError('Database is not open');

    // Encryption setup
    db.pragma(`cipher='${config.cipher || 'chacha20'}'`);
    if (typeof db.key === 'function') {
      db.key(Buffer.from(testPassword));
    } else {
      db.pragma(`key="${testPassword}"`);
    }

    // Core PRAGMA settings
    db.pragma(`journal_mode=${config.journal_mode || 'WAL'}`);

    if (config.secure_delete) {
      db.pragma(`secure_delete=${config.secure_delete}`);
    }

    if (config.auto_vacuum) {
      db.pragma(`auto_vacuum=${config.auto_vacuum}`);
    }

    if (config.busy_timeout) {
      db.pragma(`busy_timeout=${config.busy_timeout}`);
    }

    if (config.synchronous) {
      db.pragma(`synchronous=${config.synchronous}`);
    }

    if (config.foreign_keys) {
      db.pragma(`foreign_keys=${config.foreign_keys}`);
    }

    if (config.encoding) {
      db.pragma(`encoding='${config.encoding}'`);
    }

    if (config.optimize) {
      db.pragma(`optimize=${config.optimize}`);
    }

    if (config.temp_store) {
      db.pragma(`temp_store=${config.temp_store}`);
    }

    if (config.wal_autocheckpoint) {
      db.pragma(`wal_autocheckpoint=${config.wal_autocheckpoint}`);
    }

    if (config.cache_size) {
      db.pragma(`cache_size=${config.cache_size}`);
    }

    if (config.mmap_size) {
      db.pragma(`mmap_size=${config.mmap_size}`);
    }

    // Set temp directory like Forward Email does
    try {
      const tempStoreDirectory = path.join(path.dirname(db.name), 'tmp');
      fs.ensureDirSync(tempStoreDirectory);
      db.pragma(`temp_store_directory='${tempStoreDirectory}'`);
    } catch (err) {
      console.warn('Could not set temp_store_directory:', err.message);
    }
  }

  createTestData(db) {
    // Create tables similar to Forward Email's email storage
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY,
        mailbox_id INTEGER NOT NULL,
        uid INTEGER NOT NULL,
        date INTEGER NOT NULL,
        flags TEXT,
        subject TEXT,
        from_addr TEXT,
        to_addr TEXT,
        message_id TEXT,
        raw BLOB,
        FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id)
      );

      CREATE TABLE IF NOT EXISTS mailboxes (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        uidvalidity INTEGER NOT NULL,
        uidnext INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_messages_mailbox_date ON messages(mailbox_id, date DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_uid ON messages(mailbox_id, uid);
      CREATE INDEX IF NOT EXISTS idx_messages_flags ON messages(mailbox_id, flags) WHERE flags IS NOT NULL;
    `);

    // Insert test mailbox
    const insertMailbox = db.prepare(`
      INSERT OR IGNORE INTO mailboxes (id, name, path, uidvalidity, uidnext)
      VALUES (1, 'INBOX', 'INBOX', 1234567890, 1)
    `);
    insertMailbox.run();

    // Insert test messages
    const insertMessage = db.prepare(`
      INSERT INTO messages (mailbox_id, uid, date, flags, subject, from_addr, to_addr, message_id, raw)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const batchInsert = db.transaction((messages) => {
      for (const message of messages) {
        insertMessage.run(...message);
      }
    });

    // Generate test data
    const messages = [];
    const now = Date.now();
    for (let i = 1; i <= 1000; i++) {
      messages.push([
        1, // mailbox_id
        i, // uid
        now - (i * 60000), // date (1 minute intervals)
        i % 10 === 0 ? '\\Seen' : '', // flags
        `Test Subject ${i}`,
        `sender${i}@example.com`,
        `recipient${i}@example.com`,
        `<message-${i}@example.com>`,
        Buffer.from(`Raw message content for message ${i}`.repeat(100)) // ~3KB per message
      ]);
    }

    batchInsert(messages);
  }

  async benchmarkConfiguration(configName, config) {
    const dbPath = path.join(this.dbDir, `${configName.replace(/\s+/g, '_').toLowerCase()}.db`);

    // Clean up previous test
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    const results = {
      configName,
      setup_time: 0,
      insert_ops_per_sec: 0,
      select_ops_per_sec: 0,
      update_ops_per_sec: 0,
      delete_ops_per_sec: 0,
      vacuum_time: 0,
      db_size_mb: 0,
      wal_size_mb: 0
    };

    try {
      // Setup timing
      const setupStart = process.hrtime.bigint();

      const db = new Database(dbPath, { 
        cipher: config.cipher || 'chacha20'
      });

      this.setupPragma(db, config);
      this.createTestData(db);

      const setupEnd = process.hrtime.bigint();
      results.setup_time = Number(setupEnd - setupStart) / 1000000; // Convert to milliseconds

      // Benchmark operations
      await this.benchmarkInserts(db, results);
      await this.benchmarkSelects(db, results);
      await this.benchmarkUpdates(db, results);
      await this.benchmarkDeletes(db, results);

      // Test VACUUM performance if auto_vacuum is not FULL
      if (config.auto_vacuum !== 'FULL') {
        await this.benchmarkVacuum(db, results);
      }

      // Get file sizes
      const stats = fs.statSync(dbPath);
      results.db_size_mb = (stats.size / 1024 / 1024).toFixed(2);

      const walPath = `${dbPath}-wal`;
      if (fs.existsSync(walPath)) {
        const walStats = fs.statSync(walPath);
        results.wal_size_mb = (walStats.size / 1024 / 1024).toFixed(2);
      }

      db.close();

    } catch (error) {
      console.error(`❌ Error benchmarking ${configName}:`, error.message);
      results.error = error.message;
    }

    return results;
  }

  async benchmarkInserts(db, results) {
    const insertStmt = db.prepare(`
      INSERT INTO messages (mailbox_id, uid, date, flags, subject, from_addr, to_addr, message_id, raw)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const start = process.hrtime.bigint();
    const iterations = 100;

    for (let i = 2000; i < 2000 + iterations; i++) {
      insertStmt.run(
        1,
        i,
        Date.now(),
        '',
        `Benchmark Subject ${i}`,
        `bench${i}@example.com`,
        `test${i}@example.com`,
        `<bench-${i}@example.com>`,
        Buffer.from(`Benchmark message ${i}`.repeat(50))
      );
    }

    const end = process.hrtime.bigint();
    const timeMs = Number(end - start) / 1000000;
    results.insert_ops_per_sec = Math.round((iterations / timeMs) * 1000);
  }

  async benchmarkSelects(db, results) {
    const selectStmt = db.prepare(`
      SELECT id, subject, from_addr, date 
      FROM messages 
      WHERE mailbox_id = ? AND date > ? 
      ORDER BY date DESC 
      LIMIT 50
    `);

    const start = process.hrtime.bigint();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      selectStmt.all(1, Date.now() - (86400000 * 30)); // Last 30 days
    }

    const end = process.hrtime.bigint();
    const timeMs = Number(end - start) / 1000000;
    results.select_ops_per_sec = Math.round((iterations / timeMs) * 1000);
  }

  async benchmarkUpdates(db, results) {
    const updateStmt = db.prepare(`
      UPDATE messages 
      SET flags = ? 
      WHERE id = ?
    `);

    const start = process.hrtime.bigint();
    const iterations = 100;

    for (let i = 1; i <= iterations; i++) {
      updateStmt.run('\\Seen \\Flagged', i);
    }

    const end = process.hrtime.bigint();
    const timeMs = Number(end - start) / 1000000;
    results.update_ops_per_sec = Math.round((iterations / timeMs) * 1000);
  }

  async benchmarkDeletes(db, results) {
    const deleteStmt = db.prepare(`DELETE FROM messages WHERE id > ?`);

    const start = process.hrtime.bigint();
    deleteStmt.run(1500); // Delete newer messages
    const end = process.hrtime.bigint();

    const timeMs = Number(end - start) / 1000000;
    results.delete_ops_per_sec = Math.round((1 / timeMs) * 1000); // Single operation
  }

  async benchmarkVacuum(db, results) {
    const start = process.hrtime.bigint();
    db.exec('VACUUM');
    const end = process.hrtime.bigint();

    results.vacuum_time = Number(end - start) / 1000000; // milliseconds
  }

  async runAllBenchmarks() {
    await this.setup();

    for (const [configName, config] of Object.entries(TEST_CONFIGS)) {
      console.log(`🔄 Benchmarking: ${configName}`);
      const result = await this.benchmarkConfiguration(configName, config);
      this.results[configName] = result;
    }

    this.displayResults();
    await this.saveResults();
  }

  displayResults() {
    console.log('\n📊 SQLite PRAGMA Performance Results\n');

    const table = new Table({
      head: [
        'Configuration',
        'Setup (ms)',
        'Insert/sec',
        'Select/sec', 
        'Update/sec',
        'Delete/sec',
        'DB Size (MB)',
        'WAL Size (MB)'
      ],
      colWidths: [25, 12, 12, 12, 12, 12, 12, 12]
    });

    Object.values(this.results).forEach(result => {
      if (result.error) {
        table.push([
          result.configName,
          'ERROR',
          result.error.substring(0, 40) + '...',
          '', '', '', '', ''
        ]);
      } else {
        table.push([
          result.configName,
          result.setup_time.toFixed(1),
          result.insert_ops_per_sec.toLocaleString(),
          result.select_ops_per_sec.toLocaleString(),
          result.update_ops_per_sec.toLocaleString(),
          result.delete_ops_per_sec.toLocaleString(),
          result.db_size_mb,
          result.wal_size_mb || '0'
        ]);
      }
    });

    console.log(table.toString());

    // Performance analysis
    this.analyzeResults();
  }

  analyzeResults() {
    console.log('\n🔍 Performance Analysis\n');

    const validResults = Object.values(this.results).filter(r => !r.error);
    if (validResults.length === 0) return;

    // Find best performers
    const bestInsert = validResults.reduce((a, b) => a.insert_ops_per_sec > b.insert_ops_per_sec ? a : b);
    const bestSelect = validResults.reduce((a, b) => a.select_ops_per_sec > b.select_ops_per_sec ? a : b);
    const bestUpdate = validResults.reduce((a, b) => a.update_ops_per_sec > b.update_ops_per_sec ? a : b);

    console.log(`🏆 Best Insert Performance: ${bestInsert.configName} (${bestInsert.insert_ops_per_sec.toLocaleString()} ops/sec)`);
    console.log(`🏆 Best Select Performance: ${bestSelect.configName} (${bestSelect.select_ops_per_sec.toLocaleString()} ops/sec)`);
    console.log(`🏆 Best Update Performance: ${bestUpdate.configName} (${bestUpdate.update_ops_per_sec.toLocaleString()} ops/sec)`);

    // Forward Email comparison
    const forwardEmailResult = this.results['Forward Email Production'];
    if (forwardEmailResult && !forwardEmailResult.error) {
      console.log(`\n📈 Forward Email Production Performance:`);
      console.log(`   Insert: ${forwardEmailResult.insert_ops_per_sec.toLocaleString()} ops/sec`);
      console.log(`   Select: ${forwardEmailResult.select_ops_per_sec.toLocaleString()} ops/sec`);
      console.log(`   Update: ${forwardEmailResult.update_ops_per_sec.toLocaleString()} ops/sec`);
      console.log(`   Database Size: ${forwardEmailResult.db_size_mb} MB`);
    }
  }

  async saveResults() {
    const resultsFile = path.join(__dirname, `benchmark_results_node_${process.version}.json`);
    await fs.writeJson(resultsFile, {
      timestamp: new Date().toISOString(),
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      results: this.results
    }, { spaces: 2 });

    console.log(`\n💾 Results saved to: ${resultsFile}`);
  }

  async cleanup() {
    // Clean up test databases
    await fs.remove(this.dbDir);
    await fs.remove(this.tempDir);
  }
}

// Run benchmarks
async function main() {
  const benchmark = new SQLiteBenchmark();

  try {
    await benchmark.runAllBenchmarks();
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
  } finally {
    await benchmark.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SQLiteBenchmark;
