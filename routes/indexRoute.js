const express = require("express");
const router = express.Router();
const passport = require("../middleware/passport");
require('dotenv').config()

const { ensureAuthenticated } = require("../middleware/checkAuth");


var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:8080/auth/spotify/callback'
});





router.get('/auth/spotify', passport.authenticate('spotify', {
    scope: ['user-read-private', 'user-read-email', 'user-library-read', 'user-read-recently-played', 'user-top-read'],
    showDialog: true
}));


router.get(
    '/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    }
);


// logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});


module.exports = router;


router.get('/', function (req, res) {
    res.send("Homepage")
})

router.get('/profile', ensureAuthenticated, function (req, res) {
    res.send(req.user)
})
router.get('/profile/artists', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken);
    let topArtists = null
    spotifyApi.getMyTopArtists()
        .then(function (data) {
            topArtists = data.body.items;
            console.log(topArtists);
            res.send(JSON.stringify(topArtists))
        }, function (err) {
            console.log('Something went wrong!', err);
        });
    
})

router.get('/profile/tracks', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken);
    let resData = null
    spotifyApi.getMyTopTracks()
        .then(function (data) {
            resData = data.body.items;
            console.log(resData);
            res.send(JSON.stringify(resData))
        }, function (err) {
            console.log('Something went wrong!', err);
        });
    
})
module.exports = router