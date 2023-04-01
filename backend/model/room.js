const mongoose = require("mongoose");
const APIError = require("../utils/APIError");

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String
      // unique: true,
      // allowNull: false
    },
    createdBy: {
      type: String,
      allowNull: false
    },
    users: [
      {
        type: String
      }
    ],
    players: Number
  },
  {
    timestamps: true
  }
);

roomSchema.pre("save", async function (next) {
  const existsRoom = await mongoose.models["Room"].find({
    roomId: this.roomId
  });

  if (existsRoom.length)
    return next(
      new APIError({
        status: 409,
        message: "Room already exists !!"
      })
    );

  return next();
});

module.exports = mongoose.model("Room", roomSchema, "room");
