const express = require("express");
const router = express.Router();
const passport = require("../middleware/passport");


router.get('/spotify', passport.authenticate('spotify', {
    scope: ['user-read-private', 'user-read-email', 'user-library-read', 'user-read-recently-played', 'user-top-read'],
    showDialog: true
}));


router.get(
    '/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    }
);


// logout
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;