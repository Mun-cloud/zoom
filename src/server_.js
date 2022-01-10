import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

// http서버를 만듦
const httpserver = http.createServer(app);
// http서버에 ws(웹소켓)서버를 얹어줌 (따로해도 상관 없음)
// admin ui 얹어줌
const wsServer = new Server(httpserver, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});

// 소켓아이디와 룸(비밀방+공개방)을 비교해서 겹치지 않는 퍼블릭 룸을 리턴해줌
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// ws서버가 연결되면 실행되는 기능
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  // 프론트엔드에서 보내는 이벤트이름과 인자들을 받음.
  // 이벤트의 이름과 상응하는 기능이 실행되며
  // 인자의 갯수는 제한없고
  // ★마지막 인자는 백엔드가 프론트엔드에서 정의된 function을 실행시킴★
  socket.on("enter_room", (roomName, done) => {
    // 소켓의 room을 만들어줌
    socket.join(roomName);
    done(); // -> 프론트엔드의 function의 실행버튼을 누른다 생각하면 쉬움
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // roomName방에 welcome이벤트를 프론트엔드로 보냄
    wsServer.sockets.emit("room_chage", publicRooms());
  });

  // 방에서 나갈때 발생하는 이벤트 정의
  socket.on("disconnecting", () => {
    console.log(socket.rooms);
    console.log(typeof socket.rooms);
    // forEach로 각각의 room에 bye이벤트를 실행시킴
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("discoonnect", () => {
    wsServer.sockets.emit("room_chage", publicRooms());
  });

  // 프론트에서 메세지 전송 버튼 누르면 실행되는 이벤트
  socket.on("new_message", (msg, room, done) => {
    // 인자로 받은 방에 있는 참가자들에게 new_message이벤트를 전송한다
    // 이벤트 이름이 같아도 상관없음.
    // 다른 사람들에게 보여질 메세지 내용
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const wss = new WebSocket.Server({ server });
// const sockets = []
// wss.on("connection", (socket) => {
//   sockets.push(socket)
//   socket["nickname"] = "Anon"
//   console.log("Connected to Browser ✅");
//   socket.on("close", () => console.log("Disconnected from the Browser ❌"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg)
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`))
//       case "nickname" :
//         socket["nickname"] =message.payload
//     }
//   })
// });

httpserver.listen(3000, handleListen);
