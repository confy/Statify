const dataController = require("../controllers/dataController")
const constants = {
    wordList: ["Testing", "is", "important", "it", "seriously", "is", "important"],
    wordCount: { Testing: 1, is: 2, important: 2, it: 1, seriously: 1 },
    errorList: ["Testing", "is", "important", "until", 1, 2, "it", "breaks"]
}

// Count Occurrences
test("Count occurences of a list of strings", () => {
    expect(dataController.countOccurences(constants.wordList)).toEqual(constants.wordCount)
})

test("Received argument should be a list", () => {
    expect(() => {
        dataController.countOccurences(5)
    }).toThrow(TypeError)
})

test("List should only contain strings", () => {
    expect(() => {
        dataController.countOccurences(constants.errorList)
    }).toThrow(TypeError)
})