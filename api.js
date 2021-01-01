const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

dotenv.config({path: './config/config.env'})
const PORT = process.env.PORT || 2400;

var GoogleStrategy = require('passport-google-oauth20').Strategy;
let user;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// parse application/json
app.use(bodyParser.json());


// cookie-session
app.use(cookieSession({
    name: 'user-profile-data',
    keys: ['key1', 'key2']
}))

const isLoggedIn = (req, res, next) => {
    console.log(req.user)
    if(req.user){
        next();
    }else{
        res.sendStatus(401)
    }
}

// Start Passport
app.use(passport.initialize());
// Start Session
app.use(passport.session());

app.set('view engine', 'ejs')

passport.serializeUser(function(user, done){
    console.log('passport.serializeUser   --------> running')
    done(null, user)
})

passport.deserializeUser(function(user, done){
    console.log('passport.deserializerUser --------> running')
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    function(token, tokenSecret, profile, done){
        user = profile;
        console.log(user)
        return done(null, user)
    }

));

app.use(session({
    resave:false,
    saveUninitialized: true,
    secret: 'SECRET'
}))

// default route
app.get('/', (req, res) => {
    res.render('pages/login')
})


// Error
app.get('/error', (req, res) => res.send("Error while login"))

// Profile
app.get('/profile', isLoggedIn,  (req, res) => {
    res.render('pages/profile', {user})
})


app.get('/auth/google', passport.authenticate('google', {scope:['profile', 'email']}));

app.get('/auth/google/callback', 
    passport.authenticate('google', {failureRedirect: '/error'}),
    function(req, res){
        res.redirect('/profile')
    }
)

// logout user
app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/')
})

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
})