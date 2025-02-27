const pool = require('./db');

const viewTables = async () => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    
    console.log('Tables:', result.rows);

    for (let row of result.rows) {
      console.log(`Fetching contents of table: ${row.table_name}`);
      const tableData = await pool.query(`SELECT * FROM ${row.table_name}`);
      console.table(tableData.rows);
    }
  } catch (err) {
    console.error('Error retrieving database:', err);
  } finally {
    pool.end();
  }
};

viewTables();
