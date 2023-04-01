const express = require("express");
const { checkRoom, userHistory } = require("../controller/roomController");
const router = express.Router();
const { validate } = require("express-validation");
// const { signUp, login, authUser } = require("../controller/authController");
const { checkRoomValidation } = require("../validation/roomValidation");

router.get("/:roomId", validate(checkRoomValidation), checkRoom);
router.get("/history/:player", userHistory);

module.exports = router;
