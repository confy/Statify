const users = require("../database").users;
const {flag, code, name, countries} = require('country-emoji');


const userModel = {
    findUserByID: (id) => {
        for (let user in users) {
            if (user.id === id) {
                return user;
            }
        }
        return null
    },
    createUser: (user, accessToken, refreshToken) => {
        users[user.id] = {
            id: user.id,
            country: name(user.country),
            flagEmoji: flag(user.flag),
            name: user.displayName,
            profileUrl: user.profileUrl,
            profilePic: user.photos[0],
            followers: user.followers,
            artists: {},
            tracks: {},
            
            //remove eventually
            accessToken: accessToken,
            refreshToken: refreshToken

        }
        return users[user.id]
    }
}

module.exports = userModel;