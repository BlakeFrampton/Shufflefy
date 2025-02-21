require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");
const session = require("express-session");
const path = require("path");

const app = express();
// app.use(cors({
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'], // Allow methods you want to support
//     allowedHeaders: ['Content-Type', 'Authorization', "Access-Control-Allow-Origin"], // Allow specific headers

// }));
app.use(cors);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;
console.log(PORT);

// Spotify API setup
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});


// Use session to store access token
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

// Step 1: Get authorisation code
app.get("/login", (req, res) => {
    console.log("login");
    // const authUrl = spotifyApi.createAuthorizeURL([
    //     "playlist-read-private",
    //     "streaming", //webplayback sdk scope
    //     "user-read-playback-state",
    //     "user-modify-playback-state"
    // ], null, false);
    const authUrl = spotifyApi.createAuthorizeURL([
        "playlist-read-private",
    ]);
    
    console.log("Authorization URL:", authUrl);
    console.log("Granted scopes: ", spotifyApi.getAccessToken());
    res.redirect(authUrl); // Redirect the user to the Spotify authorization page

});

// Step 2: Get Spotify Auth Token
app.get("/callback", async (req, res) => {
    const { code } = req.query; // Get the authorization code from the query params
    console.log("Authorization Code:", code);

    try {
        const data = await spotifyApi.authorizationCodeGrant(code); // Exchange the code for tokens
        const accessToken = data.body.access_token; // Access token
        const refreshToken = data.body.refresh_token; // Refresh token
        const expiresIn = data.body.expires_in; // Token expiration time
        
        console.log("Access Token: ", accessToken);
        // store accessToken in session
        req.session.accessToken = accessToken;
        
        //Store accessToken in frontend
        res.redirect(`http://localhost:5000/?accessToken=${accessToken}`);
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(400).json({ error: "Authentication failed" });
    }
});


// Step 2: Refresh Access Token
app.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    spotifyApi.setRefreshToken(refreshToken);
    try {
        const data = await spotifyApi.refreshAccessToken();
        res.json({ accessToken: data.body.access_token, expiresIn: data.body.expires_in });
    } catch (err) {
        console.error("Error refreshing token:", err);
        res.status(400).json({ error: "Could not refresh token" });
    }
});

// Step 3: Fetch User's Playlists
app.get("/playlists", async (req, res) => {
    console.log("Fetching playlists...");
    // Retrieve accessToken from session
    const accessToken = req.session.accessToken;

    if (!accessToken){
        console.error("No access token in /playlists");
    }

    spotifyApi.setAccessToken(accessToken);

    try {
        const data = await spotifyApi.getUserPlaylists();
        res.json(data.body.items); // Send the playlists data back
    } catch (err) {
        console.error("Error fetching playlists:", err);
        res.status(400).json({ error: "Could not fetch playlists" });
    }
});

app.get("/playlists/:playlistId/tracks", async (req, res) => {
    const {playlistId} = req.params;
    const accessToken = req.session.accessToken;

    if (!accessToken){
        return console.error("no access token in /playlists/:playlistId/tracks")
    }

    spotifyApi.setAccessToken(accessToken);

    try {
        const data = await spotifyApi.getPlaylistTracks(playlistId);
        res.json(data.body.items); //store tracks in playlist
    } catch (err) {
        console.error("Error fetching tracks: ", err);
    }
})


// Step 4: Smart Shuffle Algorithm (to be implemented)
app.post("/shuffle", async (req, res) => {
    const { playlistId } = req.body;
    try {
        // TODO: Implement ticket-based shuffle logic here
        res.json({ message: "Shuffle algorithm will go here" });
    } catch (err) {
        console.error("Error shuffling playlist:", err);
        res.status(500).json({ error: "Shuffle failed" });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
