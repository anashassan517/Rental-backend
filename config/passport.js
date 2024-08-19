const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust the path as necessary

module.exports = function (passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://2lkz6gq8-5002.inc1.devtunnels.ms/auth/google/callback'
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in your database
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // If user doesn't exist, create a new one
          // user = new User({
          //   googleId: profile.id,
          //   displayName: profile.displayName,
          //   name: profile.name.givenName,


          // });
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        console.error(err);
        done(err, false);
      }
    }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.error(err);
      done(err, false);
    }
  });
};
