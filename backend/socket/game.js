const {
  assignPositions,
  distributeCard,
  sendUser,
  initialGameDetail,
  handleTurn,
  showHukam
} = require("../controller/gameController");
const game = require("../model/game");

module.exports = (io, socket) => {
  socket.on("assign:position", assignPositions);
  socket.on("sorting:sendUser", (data, res) => sendUser(io, data, res));
  socket.on("initial:gameDetail", (data, res) =>
    initialGameDetail(io, socket, data, res)
  );
  socket.on("assign:randomTurn", (data, res) => sendUser(io, data, res));
  socket.on("handle:turn", (data, res) => handleTurn(io, data, res));
  socket.on("show:hukam", showHukam);
};
