const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("conneted to Browser");
});

socket.addEventListener("message", (message) => {
  console.log(`Just got this: ${message.data}`);
});

socket.addEventListener("close", () => {
  console.log(`Disconneted from Server`);
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  console.log(input.value);
  socket.send(input.value);
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
