// const { users } = require('database')
const dataController = require("../controllers/dataController")
const users = require('../database').users
const userModel = require("../models/userModel")
const userController = {
    findOrCreate: (id, accessToken, refreshToken) => {
        let user = userModel.findUserByID(id)
        if (user) {
            return user
        }
        return userModel.createUser(id, accessToken, refreshToken)
    },

    getUserById: (id) => {
        if (id in users) {
            return users[id]
        }
        return null
    },
    bindTrackFeatures: (id, features, key) => {
        let user = userController.getUserById(id)
        for (let i = 0; i < features.length; i++) {
            user[key][i].features = features[i]
        }
    },
    addSummaryTrackStats: (id) => {
        let user = userController.getUserById(id)
        if (user === null) {
            return null
        }
        user.summary = dataController.avgTrackFeatures(user.tracks)
    },
    getGenresList: (id) => {
        let user = userController.getUserById(id)
        if (user === null) {
            return null
        }
        let output = user.artists.map(artist => artist.genres)
        console.log(output)
        return output.flat(4)        
    }
}
module.exports = userController;