const users = require("../database").users;

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
            name: user.displayName,
            profileUrl: user.profileUrl,
            profilePic: user.photos[0].value,
            accessToken: accessToken,
            refreshToken: refreshToken
        }
        return users[user.id]
    }
}

module.exports = userModel;