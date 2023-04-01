const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      allowNull: false
    },
    mode: String,
    winnerTeam: String,
    teams: {
      team1: {
        hands: { type: Number, default: 0 },
        mindi: [String],
        players: [String]
      },
      team2: {
        hands: { type: Number, default: 0 },
        mindi: [String],
        players: [String]
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Winner", winnerSchema, "winner");
