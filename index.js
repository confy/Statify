const express = require("express");
const path = require("path");
const session = require("express-session");
const ejsLayouts = require("express-ejs-layouts");
const app = express();

require('dotenv').config()

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.use(express.json());
app.set("view engine", "ejs");

app.use(
    session({
        secret: process.env.SESH_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 12 * 60 * 60 * 1000,
        },
    })
);

// Middleware for passport
const passport = require("./middleware/passport")
app.use(passport.initialize());
app.use(passport.session());


const indexRoute = require("./routes/indexRoute");
app.use("/", indexRoute)


app.listen(process.env.PORT, function() {
    console.log(
        `Server running. Visit: http://localhost:${process.env.PORT} in your browser 🎵`
    );
});