const mongoose = require("mongoose");
const { db_url } = require("../config");
const game = require("../model/game");

const db_connect = async () => {
  try {
    const connection = mongoose.connect(db_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // autoIndex: true
    });

    if (connection) console.log("Database Connected Successfully !!");
  } catch (error) {
    console.log("Error in Database Connection !!", error.message);
  }
};

module.exports = db_connect;
