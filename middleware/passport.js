const userController = require('../controllers/userController').userController

const passport = require("passport");

const SpotifyStrategy = require('passport-spotify').Strategy;




strategy =  new SpotifyStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/auth/spotify/callback',
  },

  function (accessToken, refreshToken, expires_in, profile, done) {
    console.log(accessToken, refreshToken)
    // asynchronous verification, for effect...
    process.nextTick(function () {
      userController.findOrCreate(profile, accessToken, refreshToken)
      console.log(profile)
      return done(null, profile);
    });
  }
)
passport.use(strategy);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  let user = userController.getUserById(id);
  if (user) {
    done(null, user);
  } else {
    done({ message: "User not found" }, null);
  }
});

module.exports = passport.use(SpotifyStrategy)
  
