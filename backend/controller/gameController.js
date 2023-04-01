const game = require("../model/game");
const winner = require("../model/winner");
const room = require("../model/room");
const { string_sort, identifyDrawCard, getWinner } = require("../utils/helper");

// called through socket
async function assignPositions(data, res) {
  try {
    const { roomId, position, userId, username } = data;
    const setTeam = position % 2 === 0 ? "team2" : "team1";

    let gameData = await game.findOneAndUpdate(
      {
        roomId,
        players: { $elemMatch: { user: userId } }
      },
      {
        $set: { "players.$.position": position, "players.$.team": setTeam }
      },
      { new: true }
    );

    if (!gameData) {
      const playersData = [
        { user: userId, roomId, position, username, team: setTeam }
      ];
      gameData = await game.findOneAndUpdate(
        { roomId },
        {
          $push: { players: { $each: playersData } }
        },
        { new: true }
      );
    }

    // broadcast message in room except current user
    this.in(roomId).emit("broadCast:room", {
      status: true,
      message: "change position",
      user: username,
      data: gameData.players
    });

    res({
      status: true,
      gameData
    });
  } catch (error) {
    res({
      status: false,
      error: error.message
    });
  }
}

async function sendUser(io, data, res) {
  try {
    let cardRes = await distributeCard(data);

    const { roomId, timer } = data;

    const backUsers = await game.findOne({
      roomId
    });

    io.in(roomId).emit("sorting:backUser", {
      data: backUsers,
      start: true,
      timer
    });

    res({
      status: true,
      data: backUsers
    });
  } catch (error) {
    console.log("🚀 ~ error", error);
    res({
      status: false,
      error: error.message
    });
  }
}

async function initialGameDetail(io, socket, data, res) {
  const { roomId, username } = data;

  const gameData = await game.findOne({
    roomId
  });

  io.in(roomId).emit("response:initialGameDetail", {
    status: true,
    message: "cards fetch successfully",
    cards: gameData?.players,
    start: !!gameData?.players?.[0].cards.length,
    turn: gameData?.playerTurn,
    table: gameData?.table
  });

  res({
    status: true,
    message: "cards fetch successfully",
    cards: gameData?.players,
    start: !!gameData?.players[0].cards.length,
    turn: gameData?.playerTurn,
    table: gameData?.table
  });
}

async function handleTurn(io, data, res) {
  try {
    const { roomId, turn, card, teamOne, teamTwo, isCut } = data;
    let winnerTeam = null;

    const updateUserCard = await game.findOneAndUpdate(
      {
        roomId,
        "players.username": turn
      },
      {
        $pull: { "players.$.cards": card }
      }
    );

    const findUserTurnPosition = updateUserCard.players.find(
      (ele) => ele.username === turn
    );

    const gameData = await game.findOneAndUpdate(
      {
        roomId
      },
      {
        $push: {
          table: { player: turn, card, position: findUserTurnPosition.position }
        }
      },
      {
        new: true
      }
    );

    // set the hukam if game mode is cut
    if (isCut) {
      const hukamName = card.split("/src/assets/cards/")[1].split(".")[0][0];

      gameData.hideCard = card;
      gameData.hideCardUser = turn;
      gameData.hukam = hukamName;
      await gameData.save();
      // const updateHideCard = await game.updateOne(
      //   {
      //     roomId
      //   },
      //   {
      //     hideCard: card,
      //     hideCardUser: turn,
      //     hukam: hukamName
      //   }
      // );
    }

    if (gameData.players.every((i) => i.cards.length === 0)) {
      // find the winner
      if (
        gameData.teams.team1.mindi.length > gameData.teams.team2.mindi.length
      ) {
        winnerTeam = "team1";
      } else if (
        gameData.teams.team1.mindi.length < gameData.teams.team2.mindi.length
      ) {
        winnerTeam = "team2";
      } else {
        if (gameData.teams.team1.hands > gameData.teams.team2.hands) {
          winnerTeam = "team1";
        } else {
          winnerTeam = "team2";
        }
      }

      if (winnerTeam) {
        await winner.create({
          roomId: gameData.roomId,
          mode: gameData.mode,
          winnerTeam,
          teams: {
            team1: { ...gameData.teams.team1, players: teamOne },
            team2: { ...gameData.teams.team2, players: teamTwo }
          }
        });
      }
    }

    //find the team who win in single round of cards
    if (gameData.table.length === gameData.players.length) {
      const resWinner = getWinner(gameData.table, gameData.hukam);

      const findWinner = gameData.table
        .reverse()
        .find((ele) => ele.card === resWinner.val);

      //winner player team
      const winnerPlayerTeam =
        findWinner.position % 2 === 0 ? "team2" : "team1";
      gameData.teams[winnerPlayerTeam].hands += 1;

      if (resWinner.mindiArr.length) {
        gameData.teams[winnerPlayerTeam].mindi.push(...resWinner.mindiArr);
      }

      // set player turn
      gameData.playerTurn = findWinner.player;

      io.in(roomId).emit("response:handleTurn", {
        start: true,
        success: true,
        data: gameData,
        winner: winnerTeam
      });

      // set table to empty
      gameData.table = [];

      await gameData.save();

      if (winnerTeam) {
        await room.deleteOne({ roomId }); // delete room
        await game.deleteOne({ roomId }); // delete game
      }

      setTimeout(() => {
        io.in(roomId).emit("response:handleTurn", {
          start: true,
          success: true,
          data: gameData,
          winner: winnerTeam
        });

        res({
          start: true,
          success: true,
          data: gameData,
          winner: winnerTeam
        });
      }, 2000);
    } else {
      const { position } = gameData.players.find(
        (ele) => ele.username === turn
      );

      const setPlayerTurn =
        position + 1 > gameData.players.length ? 1 : position + 1;

      const setNewPlayerTurn = gameData.players.find(
        (ele) => ele.position === setPlayerTurn
      );

      const updatePlayerTurn = await game.findOneAndUpdate(
        {
          roomId
        },
        {
          playerTurn: setNewPlayerTurn.username
        },
        {
          new: true
        }
      );

      io.in(roomId).emit("response:handleTurn", {
        start: true,
        success: true,
        data: updatePlayerTurn,
        winner: winnerTeam
      });

      res({
        start: true,
        success: true,
        data: updatePlayerTurn,
        winner: winnerTeam
      });
    }
  } catch (error) {
    res({
      start: false,
      success: false,
      error: error.message
    });
  }
}

async function showHukam(data, res) {
  try {
    const { roomId } = data;

    const findRoom = await game.findOne({
      roomId: roomId
    });

    const hukamName = findRoom.hideCard
      .split("/src/assets/cards/")[1]
      .split(".")[0][0];

    findRoom.players.map((ele) => {
      if (ele.username === findRoom.hideCardUser) {
        ele.cards.push(findRoom.hideCard);
        ele.cards = string_sort(ele.cards);
        findRoom.hukam = hukamName;
      }
      return ele;
    });
    await findRoom.save();

    this.to(roomId).emit("response:showHukam", {
      success: true,
      data: findRoom
    });

    res({
      success: true,
      data: findRoom
    });
  } catch (error) {
    res({
      success: false,
      error: error.message
    });
  }
}

// called by api
async function gameDetails(req, res, next) {
  try {
    const { id } = req.params;

    const gameData = await game.findOne({
      roomId: id
    });

    return res.send({
      gameData
    });
  } catch (error) {
    next(error);
  }
}

async function distributeCard(data) {
  try {
    const { roomId, cardData } = data;
    let hideCard = null;

    let findRoom = await game
      .findOne({
        roomId
      })
      .lean();

    let playerTurn = findRoom.playerTurn;

    // set playerTurn
    if (!playerTurn) {
      let temp = 0;
      const includeTemp = ["J", "Q", "K", "A"];
      cardData.forEach((ele) => {
        const val = ele.replace("/src/assets/cards/K", "").replace(".svg", "");
        if (includeTemp.includes(val)) {
          if (includeTemp.includes(temp)) {
            if (includeTemp.indexOf(temp) < includeTemp.indexOf(val)) {
              temp = val;
            }
          } else {
            temp = val;
          }
        } else {
          if (temp < val) temp = Number(val);
        }
      });

      playerTurn = cardData.indexOf(`/src/assets/cards/K${temp}.svg`);
    }

    // assing cards to players
    const playersData = findRoom.players.map((player, index) => {
      if (typeof cardData[0] === "string") {
        player.cards = [cardData[index]];
      } else {
        player.cards = string_sort(cardData[index]);
      }

      // assign mode of game
      if (
        findRoom.mode === "Hide" &&
        player.cards.length > 1 &&
        player.username === playerTurn
      ) {
        hideCard = player.cards.splice(
          Math.floor(Math.random() * player.cards.length - 1) + 1,
          1
        );
      }
      return player;
    });

    // update game details
    findRoom = await game.findOneAndUpdate(
      { roomId },
      {
        $set: {
          hideCardUser: findRoom.mode === "Hide" ? playerTurn : "",
          players: playersData,
          playerTurn:
            typeof playerTurn === "number"
              ? findRoom.players[playerTurn].username
              : playerTurn,
          hideCard: hideCard?.[0]
        }
      },
      { new: true }
    );

    return findRoom;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  gameDetails,
  assignPositions,
  distributeCard,
  sendUser,
  initialGameDetail,
  handleTurn,
  showHukam
};
