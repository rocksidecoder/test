const passport = require("passport");
const { secretKeys } = require("../config");
const localStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const userModel = require("../model/user");

const localStrategyOptions = {
  usernameField: "email",
  passwordField: "password"
};

const JwtStrategyOptions = {
  secretOrKey: secretKeys,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

const loginStrategy = async (email, password, done) => {
  try {
    let user = await userModel.findOne({ email });

    if (!user) return done(new Error("Invalid email and password !!"));

    if (!(await user.isValidPassword(password))) {
      return done(new Error("Invalid email and password !!"));
    }

    return done(null, user, { message: "Logged in Successfully !!" });
  } catch (error) {
    console.log(error);
    return done(error);
  }
};

const authenticateJwtStrategy = async (jwtPayload, done) => {
  try {
    let user = await userModel.findOne({ email: jwtPayload.user["email"] });

    if (user) return done(false, user);
    return done({ message: "Invalid access token !!" }, false);
  } catch (error) {
    console.log(error);
    return done(error);
  }
};

passport.use("login", new localStrategy(localStrategyOptions, loginStrategy));
passport.use(
  "authentication",
  new JwtStrategy(JwtStrategyOptions, authenticateJwtStrategy)
);
