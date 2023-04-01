const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Home");
});

router.use("/auth", require("./auth"));
router.use("/room", require("./room"));
router.use("/game", require("./game"));

module.exports = router;
