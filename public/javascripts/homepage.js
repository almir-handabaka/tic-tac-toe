var socket = io();

const onBoxClick = (x, y) => {
  console.log("CLICK");
  console.log(x + " " + y);
  socket.emit('box_click', { x, y });
}

socket.on('start_game', function (board) {
  console.log(board);
});

const startSinglePlayer = () => {
  socket.emit('singleplayer');
}

