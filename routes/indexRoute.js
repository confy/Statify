const express = require("express");
const router = express.Router();
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
        "limit": 50,
        "time_range": "long_term"
    })
        .then(function (data) {
            userController.addField(req.user.id, data.body.items, 'artists')
            // user["artists"] = data.body.items
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
        "limit": 50,
        "time_range": "long_term"
    })
        .then(function (data) {
            userController.addField(req.user.id, data.body.items, 'tracks')
            // user["tracks"] = data.body.items
            return data.body.items.map(function (track) {
                return track.id
            })
        })
        .then(function (trackIDs) {
            return spotifyApi.getAudioFeaturesForTracks(trackIDs)
        })
        .then(function (data) {

            userController.bindTrackFeatures(req.user.id, data.body.audio_features, 'tracks')
            userController.addSummaryTrackStats(req.user.id)
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
        res.render('artist', { artist: data[0], artistTopTracks: data[1].tracks, artistAlbums: data[2].items })

    })
})

router.get('/track/:trackID', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken)
    let trackInfo = spotifyApi.getTrack(req.params.trackID)
        .then(function (data) {
            return data.body
        })
    let trackFeatures = spotifyApi.getAudioFeaturesForTrack(req.params.trackID)
        .then(function (data) {
            return data.body

        }, function (err) {
            console.log(err);
        });
    Promise.all([trackInfo, trackFeatures]).then((data) => {
        data['1'].key = dataController.getSongKey(data['1'].key)
        res.render('track', { trackInfo: data['0'], trackFeatures: data['1'] })

    })
})

router.get('/profile/tracks', ensureAuthenticated, function (req, res) {
    res.render('tracks', { tracks: req.user.tracks })

})

router.get('/profile/top_features', ensureAuthenticated, function (req, res) {
    let sorted_tracks = dataController.getTopTracksAllFeatures(req.user.tracks, 5)
    res.render('topFeatures', {features: sorted_tracks})
    //res.render('topFeatures', {tracks: tracks})
})

router.get('/profile/playlists', ensureAuthenticated, function (req, res) {
    res.render('playlists', { playlists: req.user.playlists })
})

router.get('/playlist/:playlistID', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken)
    let playlist, playlistInfo
    spotifyApi.getPlaylist(req.params.playlistID)
        .then(function (data) {
            playlistInfo = data.body
        })

    spotifyApi.getPlaylistTracks(req.params.playlistID, { limit: 100 })
        .then(function (data) {
            playlist = data.body.items
            return data.body.items.map(function (item) {
                return item.track.id
            })
        })
        .then(function (trackIDs) {
            return spotifyApi.getAudioFeaturesForTracks(trackIDs)
        }).then(function (data) {
            let playlistTracks = playlist.map((item, idx) => {
                item = item.track
                item.features = data.body.audio_features[idx]
                return item
            })
            summary = dataController.avgTrackFeatures(playlistTracks)
            res.render('playlist', { playlistInfo: playlistInfo, playlist: playlistTracks, summary: summary })
        })

})

router.get('/album/:albumID', ensureAuthenticated, function (req, res) {
    spotifyApi.setAccessToken(req.user.accessToken)
    let album
    spotifyApi.getAlbum(req.params.albumID)
        .then(function (data) {
            album = data.body
            return data.body.tracks.items.map(function (track) {
                return track.id
            })
        })
        .then(function (trackIDs) {
            return spotifyApi.getAudioFeaturesForTracks(trackIDs)
        }).then(function (data) {

            album.tracks = album.tracks.items
            album.tracks = album.tracks.map((item, idx) => {
                item.features = data.body.audio_features[idx]
                return item
            })

            summary = dataController.avgTrackFeatures(album.tracks)
            res.render('album', { album: album, summary: summary })
        })

})

router.get('/profile/wordcloud', ensureAuthenticated, function (req, res) {
    userGenres = userController.getGenresList(req.user.id)
    wordCount = dataController.countOccurences(userGenres)
    wordCloudList = dataController.convertCountForWordcloud(wordCount)
    res.render('wordcloud', {wordCounts: wordCloudList})
})

router.get('/profile/sort', ensureAuthenticated, function (req, res) {
    res.render('table')
})

module.exports = router