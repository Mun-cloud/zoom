import http from "http";
import express from "express";
import { WebSocket } from "ws";

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

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
// http와 websocket은 프로토콜이 다르기 때문에 각각의 서버를 열어줘야 함
// http 서버 열기
const server = http.createServer(app);
// websocket 서버 열기
const wss = new WebSocket.Server({ server }); // server를 넣어줌은 두 개의 서버를 다 돌리기 위함(필수 아님)

server.listen(PORT, handleListen);
