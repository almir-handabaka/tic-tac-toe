const io = require("socket.io")();
const TicTacToeBoard = require(".././helpers/tictactoe_logic.js");

io.on('connection', (socket) => {
  console.log("User connected on chat socket", socket.id);

  //TicTacToeBoard

  socket.on('singleplayer', () => {
    console.log("User clicked on sp", socket.id);
    const new_board = new TicTacToeBoard();
    io.emit('start_game', new_board.getBoardInfo());
  });

  socket.on('box_click', (move) => {
    console.log("User clicked on field", move);
  });



});


module.exports = { io: io };