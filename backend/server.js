//@ts-check
require("dotenv").config();
require("./middleware/passport");
const express = require("express");
const app = express();
const cors = require("cors");
const db_connect = require("./middleware/database");
const error = require("./middleware/error");
const routes = require("./routes");
const roomHandler = require("./socket/room");
const gameHandler = require("./socket/game");
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const { socket_url, port } = require("./config");

const io = new Server(server, {
  cors: {
    origin: socket_url,
    methods: "*"
  }
});

io.on("connection", (socket) => {
  console.log("socket connected...")
  roomHandler(io, socket);
  gameHandler(io, socket);
});

io.on("disconnect", (socket) => {
  console.log("disconnected.....");
});

// connect to database
db_connect();

// body parser
app.use(
  express.urlencoded({
    extended: true
  })
);

//cors
app.use(cors());

app.use(express.json());

// routes
app.use("/", routes);

// Handling global error
app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);

// start the server
server.listen(port || 5001, () => {
  console.log(`Server is runnig on http://localhost:${port}`);
});
