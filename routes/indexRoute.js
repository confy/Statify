const express = require("express");
const router = express.Router();
const fs = require('fs');

const { ensureAuthenticated } = require("../middleware/checkAuth");
const userController = require("../controllers/userController")
const dataController = require("../controllers/dataController")



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
    let dataExists = Object.keys(user).includes("artists")
    if (dataExists) {
        return res.render('profile', { user: req.user })
    }
    spotifyApi.setAccessToken(req.user.accessToken);
    spotifyApi.getMyTopArtists({
        "limit": 50
    })
        .then(function (data) {
            user["artists"] = data.body.items
            console.log(user);

        }, function (err) {
            console.log('Something went wrong fetching artist data!', err);
        })
    spotifyApi.getUserPlaylists(req.user.id, {
        "limit": 50
    }).then(function (data) {
        user["playlists"] = data.body.items
    }, function (err) {
        console.log('Something went wrong fetching playlists!', err);
    });

    spotifyApi.getMyTopTracks({
        "limit": 100
    })
        .then(function (data) {
            user["tracks"] = data.body.items
            return data.body.items.map(function (track) {
                return track.id
            })
        })
        .then(function (trackIDs) {
            return spotifyApi.getAudioFeaturesForTracks(trackIDs)
        })
        .then(function (data) {

            userController.bindTrackFeatures(req.user.id, data.body.audio_features)
            res.render("profile", { user: user })
        })

})

router.get('/profile/artists', ensureAuthenticated, function (req, res) {
    res.render('artists', { artists: req.user.artists })
})


router.get('/artist/:artistid', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken)
    let artistID = req.params.artistid
    let artistInfo = spotifyApi.getArtist(artistID)
        .then(function (data) {
            return data.body
        })
    let artistTopTracks = spotifyApi.getArtistTopTracks(artistID, country = 'CA')
        .then(function (data) {
            return data.body
        })
    let artistAlbums = spotifyApi.getArtistAlbums(artistID)
        .then(function (data) {
            return data.body
        })
    Promise.all([artistInfo, artistTopTracks, artistAlbums]).then((data) => {
        console.log(data)
        res.render('artist', { artist: data[0], artistTopTracks: data[1].tracks, artistAlbums: data[2].items })

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
        data['1'].key = dataController.getSongKey(data['1'].key)
        res.render('track', { trackInfo: data['0'], trackFeatures: data['1'] })

    })
})

router.get('/profile/tracks', ensureAuthenticated, function (req, res) {
    res.render('tracks', { tracks: req.user.tracks })

})

router.get('/profile/top_features', ensureAuthenticated, function (req, res) {
    tracks = dataController.getTopTracksAllFeatures(req.user.tracks)
    res.send(JSON.stringify(tracks, null, 2))
    //res.render('topFeatures', {tracks: tracks})
})

router.get('/profile/playlists', ensureAuthenticated, function (req, res) {
    res.render('playlists', { playlists: req.user.playlists })
})

router.get('/table', ensureAuthenticated, function (req, res) {
    res.render('table')
})
module.exports = router