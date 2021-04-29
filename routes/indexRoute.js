const express = require("express");
const router = express.Router();

const { ensureAuthenticated } = require("../middleware/checkAuth");




const SpotifyWebApi = require('spotify-web-api-node');


const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:8080/auth/spotify/callback'
});

module.exports = router;


router.get('/', function (req, res) {
    res.send("Homepage")
})

router.get('/profile', ensureAuthenticated, function (req, res) {
    res.render('profile', {user: req.user})
})
router.get('/profile/artists', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken);
    spotifyApi.getMyTopArtists({
        "limit": 50
    })
        .then(function (data) {
            topArtists = data.body.items;
            console.log(topArtists);
            let artistGenres = data.body.items.map(artist => artist.genres)
            let artists = data.body.items.map(artist => artist.name)
            artistGenres = artistGenres.flat(4)
            res.render("genres", { genres: artistGenres, artists: artists })
        }, function (err) {
            console.log('Something went wrong!', err);
        })


})

router.get('/profile/tracks', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken);
    let resData = null
    spotifyApi.getMyTopTracks()
        .then(function (data) {
            resData = data.body.items;
            console.log(resData);
            res.send(JSON.stringify(resData))
        }
            , function (err) {
                console.log('Something went wrong!', err);
            });

})

router.get('/table', ensureAuthenticated, function (req, res) {
    res.render('table')
})
module.exports = router