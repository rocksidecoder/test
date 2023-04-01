const mongoose = require("mongoose");
const user = require("./user");

const gameSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      allowNull: false
    },
    host: { type: String },
    mode: String,
    playerTurn: {
      type: String,
      default: null
    },
    hideCardUser: {
      type: String,
      default: null
    },
    hideCard: {
      type: String,
      default: null
    },
    hukam: String,
    teams: {
      team1: {
        hands: { type: Number, default: 0 },
        mindi: [String]
      },
      team2: {
        hands: { type: Number, default: 0 },
        mindi: [String]
      }
    },
    table: [
      {
        _id: false,
        player: String,
        card: String,
        position: {
          type: Number
        }
      }
    ],
    players: [
      {
        _id: false,
        position: {
          type: Number,
          default: 1
        },
        user: { type: mongoose.Schema.ObjectId, ref: "User" },
        username: { type: String },
        cards: [{ type: String }],
        team: {
          type: String,
          default: ""
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Game", gameSchema, "game");
