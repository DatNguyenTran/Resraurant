const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../app/models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            password: await bcrypt.hash("random_password", 10),
            phoneNumber: "",
            address: "",
            gender: null,
            avatar: profile.photos[0].value,
            role: "CUSTOMER",
            status: "ACTIVE",
            provider: "google",
            googleId: profile.id,
          });

          await user.save();
        }

        return done(null, { ...user.toObject() });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((userId, done) => {
  done(null, userId);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findById(userId);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
