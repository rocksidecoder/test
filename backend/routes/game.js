const express = require("express");
const {
  gameDetails,
  assignPositions,
  distributeCard
} = require("../controller/gameController");
const router = express.Router();

router.get("/:id", gameDetails);
router.post("/position", assignPositions);

module.exports = router;
