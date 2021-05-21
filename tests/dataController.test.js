const fs = require('fs');

const dataController = require("../controllers/dataController")
const constants = {
    wordList: ["Testing", "is", "important", "it", "seriously", "is", "important"],
    wordCount: { Testing: 1, is: 2, important: 2, it: 1, seriously: 1 },
    wordCloudCount: [['is', 2], ['important', 2], ['Testing', 1], ['it', 1], ['seriously', 1]],
    errorList: ["Testing", "is", "important", "until", 1, 2, "it", "breaks"],
    summarizedFeatures: {
        acousticness: '0.524',
        danceability: '0.512',
        energy: '0.441',
        instrumentalness: '0.338',
        liveness: '0.179',
        speechiness: '0.070',
        tempo: '127.162',
        valence: '0.436'
    }
}



// Count Occurrences
test("Count occurences of a list of strings", () => {
    expect(dataController.countOccurences(constants.wordList)).toEqual(constants.wordCount)
})

test("Count occurences - Error on bad values", () => {
    expect(() => {
        dataController.countOccurences(constants.errorList)
    }).toThrow(TypeError)
    expect(() => {
        dataController.countOccurences(5)
    }).toThrow(TypeError)
})

test("Convert occurences count to wordcloud format", () => {
    expect(dataController.convertCountForWordcloud(constants.wordCount)).toEqual(constants.wordCloudCount)
})

const mockUser = JSON.parse(fs.readFileSync('tests/data/user.json'))
const top_time_signature = JSON.parse(fs.readFileSync('tests/data/gizzard.json'))
const topTracksAllFeatures = JSON.parse(fs.readFileSync('tests/data/topTracksAllFeatures.json'))

test("Get top track with feature: time_signature", () => {
    expect(dataController.getTopTracksWithFeature(mockUser.tracks, 'time_signature', 1)).toEqual(top_time_signature)
})

test("Raise error on unknown track feature or number < 1", () => {
    expect(() => {
        dataController.getTopTracksWithFeature(mockUser.tracks, 'fake_feature', 1)
    }).toThrow(RangeError)
    expect(() => {
        dataController.getTopTracksWithFeature(mockUser.tracks, 'danceability', -1)
    }).toThrow(RangeError)
})

test("Get top tracks of all features", () => {
    const mockUser = JSON.parse(fs.readFileSync('tests/data/user.json'))
    expect(dataController.getTopTracksAllFeatures(mockUser.tracks, 1)).toEqual(topTracksAllFeatures)
})

test("Top Tracks of all features - Error on invalid types or number", () => {
    expect(() => {
        dataController.getTopTracksAllFeatures('bad_type', 1)
    }).toThrow(TypeError)
    expect(() => {
        dataController.getTopTracksAllFeatures(mockUser.tracks, -1)
    }).toThrow(RangeError)
    expect(() => {
        dataController.getTopTracksAllFeatures(mockUser.tracks, 'bad_type')
    }).toThrow(TypeError)
})

test("Get Key from 0-12 function", () => {
    expect(dataController.getSongKey(0)).toEqual('C Maj or A Min')
    expect(dataController.getSongKey(2)).toEqual('D Maj or B Min')
    expect(dataController.getSongKey(11)).toEqual('B Maj or A♭ Min')
})

test("Get Key - Error on value out of range or bad type", () => {
    expect(() => {
        dataController.getSongKey(-1)
    }).toThrow(RangeError)
    expect(() => {
        dataController.getSongKey(12)
    }).toThrow(RangeError)
    expect(() => {
        dataController.getSongKey('bad_type')
    }).toThrow(TypeError)

})

test("Summarize Track stats", () => {
    expect(dataController.avgTrackFeatures(mockUser.tracks)).toEqual(constants.summarizedFeatures)
})
