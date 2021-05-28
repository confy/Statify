const userController = require('../controllers/userController');
const passport = require("passport");
const SpotifyStrategy = require('passport-spotify').Strategy;

strategy =  new SpotifyStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'https://statifyy.herokuapp.com/auth/spotify/callback',
  },

  function (accessToken, refreshToken, expires_in, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      userController.findOrCreate(profile, accessToken, refreshToken)
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
  
