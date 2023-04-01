const passport = require("passport");
const APIError = require("../utils/APIError");
const { capitalize } = require("../utils/helper");

const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  try {
    if (err || info || !user) {
      const error = err || info.message;
      throw new APIError({
        status: 422,
        message: error ? capitalize(error) : "unauthorized access"
      });
    }

    if (roles !== undefined) {
      roles = typeof roles === "string" ? [roles] : roles;
      if (!roles.includes(user.role_id.name))
        throw new APIError({
          status: 403,
          message: "you don't have sufficient access permission !!"
        });
    }
    req.user = user;
    return next();
  } catch (error) {
    next(error);
  }
};

exports.isAuth = (roles) => (req, res, next) => {
  passport.authenticate(
    "authentication",
    { session: true },
    handleJWT(req, res, next, roles)
  )(req, res, next);
};
