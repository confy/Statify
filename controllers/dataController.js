const dataController = {
    countOccurences: (words) => {
        // Takes in a list of strings, returns an object with the count of each word
        const output = {}
        if (!(Array.isArray(words))) {
            throw new TypeError
        }
        words.forEach((word) => {
            if (typeof word != 'string') {
                throw new TypeError
            }
            if (!(word in output)) {
                output[word] = 1
            } else {
                output[word] += 1
            }

        })
        return output
    },
    features: ['acousticness', 'danceability', 'duration_ms',
        'energy', 'instrumentalness', 'key',
        'liveness', 'loudness', 'mode',
        'speechiness', 'tempo', 'time_signature'
    ],

    getTopTracksWithFeature: (tracks, feature, number) => {
        if (typeof tracks !== 'object') {
            throw new TypeError
        }
        if (typeof feature !== 'string') {
            throw new TypeError
        }
        if (typeof number !== 'number'){
            throw new TypeError
        }
        if (number < 1) {
            throw new RangeError
        }
        if (!(dataController.features.includes(feature))) {
            throw new RangeError
        }
        return tracks.sort((a, b) => a.features[feature] < b.features[feature] ? 1 : -1).splice(0, 1)
    },

    getTopTracksAllFeatures: (tracks, number) => {
        if (typeof tracks !== 'object') {
            throw new TypeError
        }
        if (typeof number !== 'number'){
            throw new TypeError
        }
        if (number < 1) {
            throw new RangeError
        }
        sortedTracks = {}
        dataController.features.forEach((feature) => {
            sortedTracks[feature] = dataController.getTopTracksWithFeature(tracks, feature, number)
        })
        return sortedTracks
    }
}

module.exports = dataController