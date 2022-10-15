const io = require("socket.io")();
const { v4: uuidv4 } = require('uuid');
const TicTacToeBoard = require(".././helpers/tictactoe_logic.js");
const { client } = require("../helpers/redis-client.js");


io.on('connection', (socket) => {
  console.log("User connected on chat socket", socket.id);

  const req = socket.request;

  socket.use((__, next) => {
    req.session.reload((err) => {
      if (err) {
        socket.disconnect();
      } else {
        next();
      }
    });
  });

  socket.on('singleplayer', async () => {
    console.log("User clicked on sp", socket.id);
    const new_board = new TicTacToeBoard();
    //const cache_exists = await client.exists('categories');

    const { uuid } = new_board.getBoardInfo();

    await client.set(uuid, JSON.stringify(new_board.getBoardInfo()));
    io.emit('set_board', new_board.getBoardInfo());
  });

  socket.on('box_click', async (move) => {
    console.log(move);
    let game = await client.get(move.uuid);
    game = JSON.parse(game);
    const game_board = new TicTacToeBoard();
    game_board.board = game.board;
    game_board.current_player_turn = game.current_player_turn;
    game_board.uuid = game.uuid;

    const move_done = game_board.makeMove(move);
    const { uuid, finished } = game_board.getBoardInfo();

    if (finished) {
      console.log("game ended");
      return io.emit('set_board', game_board.getBoardInfo());
    }

    await client.set(uuid, JSON.stringify(game_board.getBoardInfo()));
    io.emit('set_board', game_board.getBoardInfo());
    console.log(game);
  });



});


const getIO = () => {
  return io;
}


module.exports = { getIO };