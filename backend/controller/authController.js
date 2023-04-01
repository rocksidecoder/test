const user = require("../model/user");
const { removeFields, generateJwt, toObject } = require("../utils/helper");
const passport = require("passport");
const APIError = require("../utils/APIError");

const signUp = async (req, res, next) => {
  try {
    const { body: payload } = req;

    await user.create(payload);

    return res.send({
      message: "Sign up successfully !!"
    });
  } catch (error) {
    console.log("Error ::", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if ((err || info) && !user) {
        throw new APIError({
          status: 422,
          message: err ? err.message : "unauthorized access"
        });
      }

      req.login(user, { session: true }, async (err) => {
        const body = {
          _id: user._id,
          email: user.email,
          password: user.passport
        };

        const token = generateJwt({ user: body });
        user = toObject(user);
        user.token = `Bearer ${token}`;

        // console.log("user ====", user);

        return res.send({
          message: info.message,
          data: removeFields(user, ["password"])
        });
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

const authUser = async (req, res, next) => {
  try {
    passport.authenticate("authentication", (err, user) => {
      if (!err && user)
        return res.send({
          message: "User validate successfully !!",
          token: req.headers.authorization
        });
      else
        throw new APIError({
          status: 401,
          message: "Invalid access token !!"
        });
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};
module.exports = { signUp, login, authUser };
