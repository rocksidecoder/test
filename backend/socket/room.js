// const uuid = require("uuid");

const {
  addRoom,
  joinRoom,
  leaveRoom
} = require("../controller/roomController");

module.exports = (io, socket) => {
  // socket.on("create:room", (data, res) => addRoom(io, socket, data, res));
  socket.on("create:room", addRoom);
  socket.on("join:room", joinRoom);
  socket.on("leave:room", leaveRoom);
};
