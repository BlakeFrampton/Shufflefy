const pool = require('./db');

const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS UserPlaylist (
        UserPlaylistID SERIAL PRIMARY KEY,
        UserID TEXT NOT NULL,
        PlaylistID TEXT NOT NULL,
        CONSTRAINT UNIQUE (UserID, PlaylistID)
    );

    CREATE TABLE IF NOT EXISTS SongWeight (
        SongID TEXT NOT NULL,
        UserPlaylistID INT NOT NULL,
        Weight INT DEFAULT 1,
        PRIMARY KEY (SongID, UserPlaylistID),
        FOREIGN KEY (UserPlaylistID) REFERENCES UserPlaylist(UserPlaylistID) ON DELETE CASCADE
    );
  `;

  try {
    await pool.query(query);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables', err);
  } finally {
    pool.end();
  }
};

createTables();
