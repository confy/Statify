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
    convertCountForWordcloud: (countObj) => {
        const output = []
        Object.entries(countObj).forEach((word) => {
            output.push([word[0], word[1]])
        })
        return output.sort((x, y) => { return y[1] - x[1] })
    }
    ,
    features: ['acousticness', 'danceability', 'duration_ms',
        'energy', 'instrumentalness', 'key',
        'liveness', 'loudness', 'mode',
        'speechiness', 'tempo', 'time_signature'
    ],

    getTopTracksWithFeature: (tracks, feature, number) => {
        if (typeof tracks !== 'object' | typeof feature !== 'string' | typeof number !== 'number') {
            throw new TypeError
        }
        if (number < 1 | !(dataController.features.includes(feature))) {
            throw new RangeError
        }
        return tracks.sort((a, b) => a.features[feature] < b.features[feature] ? 1 : -1).splice(0, number)
    },

    getTopTracksAllFeatures: (tracks, number) => {
        if (typeof tracks !== 'object' | typeof number !== 'number') {
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
    },

    keys: ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"],

    getSongKey: (keyNumber) => {
        let keys = dataController.keys
        if (typeof keyNumber != 'number') {
            throw new TypeError
        }
        if (keyNumber < 0 | keyNumber > 11) {
            throw new RangeError
        }
        let relativeMin = 0
        if (keyNumber < 3) {
            relativeMin = keyNumber + 9
        } else {
            relativeMin = keyNumber - 3
        }
        return `${keys[keyNumber]} Maj or ${keys[relativeMin]} Min`
    },

    avgTrackFeatures: (tracks) => {
        let summary = {
            'acousticness': 0, 'danceability': 0,
            'energy': 0, 'instrumentalness': 0,
            'liveness': 0, 'speechiness': 0, 'tempo': 0,
            'valence': 0,
        }
        Object.values(tracks).forEach((track) => {
            Object.entries(summary).forEach((feature) => {
                summary[feature[0]] += (track.features[feature[0]] / tracks.length)
            })
        })
        Object.entries(summary).forEach((feature) => {
            summary[feature[0]] = summary[feature[0]].toFixed(3)
        })
        return summary
    }
}

module.exports = dataController