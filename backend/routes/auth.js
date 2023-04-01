const express = require("express");
const { validate } = require("express-validation");
const { signUp, login, authUser } = require("../controller/authController");
const {
  signupValidation,
  loginValidation
} = require("../validation/authValidation");

const router = express.Router();

router.post("/signup", validate(signupValidation), signUp);
router.post("/login", validate(loginValidation), login);
router.get("/authUser", authUser);

module.exports = router;
