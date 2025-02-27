const pool = require('./db');

const runSQL = async () => {
  const query = `
    ALTER TABLE songweight
    ADD CONSTRAINT unique_playist_song UNIQUE (SongID, UserPlaylistID);

  `;

  try {
    await pool.query(query);
    console.log('Query completed successfully ');
  } catch (err) {
    console.error('Query failed', err);
  } finally {
    pool.end();
  }
};

runSQL();
