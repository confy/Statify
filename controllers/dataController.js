const dataController = {
    countOccurences: (words) => {
        // Takes in a list of strings, returns an object with the count of each word
        const output = {}
        if (!(Array.isArray(words))) {
            throw new TypeError
        }
        words.forEach((word) =>{
            if (typeof word != 'string'){
                throw new TypeError
            }
            if (!(word in output)) {
                output[word] = 1
            } else {
                output[word] += 1
            }

        })
        return output
    }
}

module.exports = dataController