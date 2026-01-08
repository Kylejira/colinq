const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('Please provide DATABASE_URL as environment variable or argument');
  process.exit(1);
}

async function migrate() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove comments about database creation (Neon handles this)
    schema = schema.replace(/--.*$/gm, '');
    schema = schema.replace(/COMMENT ON DATABASE.*?;/g, '');
    
    // Split by semicolon and filter empty statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Running ${statements.length} statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
          process.stdout.write('.');
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists') && !err.message.includes('duplicate key')) {
            console.error(`\nError on statement ${i + 1}:`, statement.substring(0, 100));
            console.error('Error:', err.message);
          }
        }
      }
    }
    
    console.log('\n\nMigration complete!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => console.log('  ✓', row.table_name));
    
    client.release();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();



