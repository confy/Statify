const userController = require('../controllers/userController');
const passport = require("passport");
const SpotifyStrategy = require('passport-spotify').Strategy;

strategy =  new SpotifyStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },

  function (accessToken, refreshToken, expires_in, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      console.log(profile, accessToken, refreshToken)
      userController.findOrCreate(profile, accessToken, refreshToken)
      console.log('Finishing passport login')
      return done(null, profile);
    });
  }
)

passport.use(strategy);

passport.serializeUser(function (user, done) {
  console.log('Serializing')
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
  
