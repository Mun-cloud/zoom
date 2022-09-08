import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/*", (req, res) => {
  res.redirect("/");
});

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName.emit("ice", ice));
  });
});

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
httpServer.listen(PORT, handleListen);

// instrument(wsServer, {
//   auth: false,
// });

// function publicRooms() {
//   const {
//     sockets: {
//       adapter: { sids, rooms },
//     },
//   } = wsServer;
//   const publicRooms = [];
//   rooms.forEach((_, key) => {
//     if (sids.get(key) === undefined) {
//       publicRooms.push(key);
//     }
//   });
//   return publicRooms;
// }

// function countRoom(roomName) {
//   return wsServer.sockets.adapter.rooms.get(roomName).size;
// }

// wsServer.on("connection", (socket) => {
//   // 닉네임 초기화
//   socket["nickname"] = "Anon";

//   // socketIo 미들웨어
//   socket.onAny((event) => {
//     console.log(`Socket Event: ${event}`);
//   });

//   socket.on("enter_room", (roomName, done) => {
//     socket.join(roomName);
//     done(roomName);
//     socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//     wsServer.sockets.emit("room_change", publicRooms());
//   });

//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((room) =>
//       socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
//     );
//   });

//   socket.on("disconnect", () => {
//     wsServer.sockets.emit("room_change", publicRooms());
//   });

//   socket.on("new_message", (msg, room, done) => {
//     socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//     done();
//   });

//   socket.on("nickname", (nickname) => {
//     console.log("hi");
//     console.log(nickname);
//     socket["nickname"] = nickname;
//   });
// });

// httpServer.listen(PORT, handleListen);

// http와 websocket은 프로토콜이 다르기 때문에 각각의 서버를 열어줘야 함
// http 서버 열기
// const server = http.createServer(app);
// websocket 서버 열기
// const wss = new WebSocket.Server({ server }); // server를 넣어줌은 두 개의 서버를 다 돌리기 위함(필수 아님)

// const sockets = [];
// const NICKNAME = "nickname";
// const NEW_MESSAGE = "new_message";

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket[NICKNAME] = "Anon";
//   console.log("Connected to Browser✅");
//   socket.on("close", () => console.log("Disconneted from the Browser"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case NEW_MESSAGE:
//         console.log(message);
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//       case NICKNAME:
//         socket[NICKNAME] = message.payload;
//     }
//   });
// });
//
// server.listen(PORT, handleListen);
