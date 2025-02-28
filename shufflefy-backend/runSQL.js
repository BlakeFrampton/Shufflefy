const pool = require('./db');

const runSQL = async () => {
  const query = `
    SELECT *
    FROM songweight
    WHERE songid='spotify:track:4JfpJrrGNXRj2yXm1fYV23';

  `;

  try {
    const data = await pool.query(query);
    console.table(data.rows);
    console.log('Query completed successfully ');
  } catch (err) {
    console.error('Query failed', err);
  } finally {
    pool.end();
  }
};

runSQL();
