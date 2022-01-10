const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 먼저 룸을 가려줌
room.hidden = true;
// 방 이름 변수 선언
let roomName;

// 메세지를 화면에 띄우는 기능
function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 메세지 전송 버튼 누르면 실행되는 기능
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  // new_message이벤트를 백엔드에서 실행시키고
  // 입력값과 방 이름을 인자로 보내면서 addMessage를 실행받는다.
  socket.emit("new_message", input.value, roomName, () => {
    // 내 화면에 표시될 메세지 내용
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true; // 방 참가 창을 지움
  room.hidden = false; // 채팅 방을 띄움
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  // 채팅방의 메세지창 submit 이벤트 등록
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

// 방 만들기 기능
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  // 입력값을 받아서 백엔드에 enter_room 이벤트로 값을 보내고 showRoom을 실행시킴
  // 소켓io는 백엔드에 string뿐만 아니라 object등 모든 것을 보낼 수 있다.
  // ★마지막 인자는 백엔드에서 실행시키는 함수
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value; // 방 이름 정의
  input.value = "";
}

// 방 만들기
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ㅠㅠ`);
});

// 백엔드에서 new_message를 받고 응답으로 new_message이벤트를 보냄
// (이름이 중복되도 상관 없음)
socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
