require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");
const session = require("express-session");
const path = require("path");

const app = express();
app.use(cors());
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
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}&scope=streaming user-read-email user-read-private user-modify-playback-state&show_dialog=true`;
    
    console.log("Authorization URL:", authUrl);
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
        console.log("Scopes received: ", accessToken.scope)
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


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
