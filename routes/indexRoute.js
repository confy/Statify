const express = require("express");
const router = express.Router();

const { ensureAuthenticated } = require("../middleware/checkAuth");
const userController = require("../controllers/userController")



const SpotifyWebApi = require('spotify-web-api-node');


const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:8080/auth/spotify/callback'
});

module.exports = router;


router.get('/', function (req, res) {
    res.render('homepage')
})

router.get('/profile', ensureAuthenticated, function (req, res) {
    const user = userController.getUserById(req.user.id)
    let dataExists = Object.keys(user).includes("data")
    if (dataExists) {
        return res.render('profile', { user: req.user })
    } else {
        spotifyApi.setAccessToken(req.user.accessToken);
        spotifyApi.getMyTopArtists({
            "limit": 50
        })
            .then(function (data) {
                user["artists"] = data.body.items
                console.log(user);
                res.render("profile", { user: user })
            }, function (err) {
                console.log('Something went wrong fetching artist data!', err);
            })
    }
})

router.get('/profile/artists', ensureAuthenticated, function (req, res) {
    const user = userController.getUserById(req.user.id)
    res.render('artists', { artists: user.artists })
})


router.get('/artist/:artistid', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken)
    let artistID = req.params.artistid
    let artistInfo = spotifyApi.getArtist(artistID)
        .then(function (data) {
            return data.body
        })
    let artistTopTracks = spotifyApi.getArtistTopTracks(artistID, country='CA')
        .then(function (data) {
            return data.body
        })
    let artistAlbums = spotifyApi.getArtistAlbums(artistID)
        .then(function (data) {
            return data.body
        })
    Promise.all([artistInfo, artistTopTracks, artistAlbums]).then((data) => {
        console.log(data)
        res.render('artist', {artist: data[0], artistTopTracks: data[1].tracks, artistAlbums: data[2].items})

    })
})

router.get('/track/:trackid', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken)
    let trackInfo = spotifyApi.getTrack(req.params.trackid)
        .then(function (data) {
            return data.body
        })
    let trackFeatures = spotifyApi.getAudioFeaturesForTrack(req.params.trackid)
        .then(function (data) {
            return data.body

        }, function (err) {
            console.log(err);
        });
    Promise.all([trackInfo, trackFeatures]).then((data) => {
        console.log(data)
        res.render('track', { trackInfo: data['0'], trackFeatures: data['1'] })

    })


})

router.get('/profile/tracks', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken);
    let resData = null
    spotifyApi.getMyTopTracks({
        "limit": 50
    })
        .then(function (data) {
            resData = data.body.items;
            console.log(resData);
            //res.send(JSON.stringify(resData))
            res.render('tracks', { tracks: resData })
        }
            , function (err) {
                console.log('Something went wrong!', err);
            });

})

router.get('/table', ensureAuthenticated, function (req, res) {
    res.render('table')
})
module.exports = router