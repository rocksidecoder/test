const game = require("../model/game");
const room = require("../model/room");
const winner = require("../model/winner");
const APIError = require("../utils/APIError");

// called through socket
// async function addRoom(io, socket, data, res) {
async function addRoom(data, res) {
  try {
    const { host, roomId, players, playerId, mode } = data;
    const resRoom = await room.create({
      roomId,
      createdBy: host,
      users: [host],
      players
    });

    console.log("response of room === >", resRoom)
``
    // create room
    this.username = host;
    this.join(roomId);

    const gameRes = await game.create({
      roomId: roomId,
      host,
      mode,
      players: [
        {
          position: 1,
          user: playerId,
          username: host,
          cards: [],
          team: "team1"
        }
      ]
    });

    console.log("response of game ====>",gameRes)
    // broadcast message in room expect sender
    // io.in(roomId).emit("broadCast:room", {
    //   status: true,
    //   message: "Room created successfully!"
    // });

    res({
      status: true,
      message: "Room created successfully !"
    });
  } catch (error) {
    res({
      status: false,
      error: error.message
    });
  }
}

async function joinRoom(data, res) {
  try {
    const { host, roomId, playerId } = data;
    let findRoom = await room.findOne({
      roomId: roomId
    });

    const findGameMode = await game.findOne({
      roomId
    });
    // await game.updateOne({
    //   roomId: roomId,
    //   players: [
    //     {
    //       [playerId]: []
    //     }
    //   ]
    // });

    // const findUser = await room.findOne({
    //   users: host
    // });

    if (!findRoom)
      throw new APIError({
        status: 409,
        message: "Please enter valid room id !"
      });

    // if (findUser)
    //   throw new APIError({
    //     status: 409,
    //     message: "sorry, you are already joined!"
    //   });

    findRoom = await room.findOneAndUpdate(
      { _id: findRoom._id },
      {
        $addToSet: { users: host }
      },
      {
        new: true
      }
    );

    const socketResponse = {
      status: true,
      message: "Joined!",
      data: findRoom,
      mode: findGameMode.mode
    };

    // join room
    this.join(roomId);

    // broadcast message in room expect sender
    this.broadcast
      .to(roomId)
      .emit("broadCast:room", { ...socketResponse, user: host, data: null });

    res(socketResponse);
  } catch (error) {
    res({
      status: false,
      error: error.message
    });
  }
}

async function leaveRoom(data, res) {
  try {
    const { host, roomId } = data;

    const updateRoom = await room.findOneAndUpdate(
      {
        roomId: roomId
      },
      {
        $pull: { users: host }
      },
      {
        new: true
      }
    );

    const updateGame = await game.findOneAndUpdate(
      {
        roomId
      },
      {
        $pull: {
          players: {
            username: host
          }
        }
      },
      {
        new: true
      }
    );

    if (!updateRoom.users.length) {
      await updateRoom.delete();
      await updateGame.delete();
    }

    const socketResponse = {
      status: true,
      message: "Left!"
    };

    // leave the room
    this.leave(roomId);

    // broadcast message in room except current user
    this.in(roomId).emit("broadCast:room", {
      ...socketResponse,
      user: host,
      data: updateGame.players
    });

    res(socketResponse);
  } catch (error) {
    res({
      status: false,
      error: error.message
    });
  }
}

// called through api
const checkRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    if (!roomId)
      throw new APIError({
        status: 400,
        message: "Please enter room id!"
      });

    const findRoom = await room.findOne({
      roomId: roomId
    });

    if (findRoom?.roomId) {
      return res.send({ data: findRoom });
    }
    throw new APIError({
      status: 400,
      message: "fail"
    });
  } catch (error) {
    next(error);
  }
};

const userHistory = async (req, res, next) => {
  try {
    const { player } = req.params;
    let findPlayerTeam;

    let historyData = await winner
      .find({
        $or: [
          { "teams.team1.players": player },
          { "teams.team2.players": player }
        ]
      })
      .lean();

    historyData = historyData.map((ele) => {
      ele.teams.team1.mindi = ele.teams.team1.mindi.join(" ");
      ele.teams.team2.mindi = ele.teams.team2.mindi.join(" ");

      findPlayerTeam = ele.teams.team1.players[0].includes(player)
        ? "team1"
        : "team2";

      return { ...ele, playerTeam: findPlayerTeam };
    });

    return res.send(historyData);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  addRoom,
  joinRoom,
  checkRoom,
  leaveRoom,
  userHistory
};

// useEffect(() => {
//   socket.on("broadCast:room", ({ data, message }) => {
//     toastMessage(`${data} ${message}`, toastTypes.success);
//   });
// }, []);
