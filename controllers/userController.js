// const { users } = require('database')
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
        if (id in users){
            return users[id]
        }
        return null
    }
}
module.exports = {userController: userController}