const io = require("socket.io")();
const { v4: uuidv4 } = require('uuid');
const TicTacToeBoard = require(".././helpers/tictactoe_logic.js");
const { client } = require("../helpers/redis-client.js");

let waiting_list = [];


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
    const new_board = new TicTacToeBoard("sp", "player 1", "player 2");
    const { uuid } = new_board.getBoardInfo();
    await client.set(uuid, JSON.stringify(new_board.getBoardInfo()));
    socket.join(uuid);
    io.to(uuid).emit('set_board', new_board.getBoardInfo());
    console.log("user joined sp room", uuid);
    //io.emit('set_board', new_board.getBoardInfo());
  });

  /*
    mp zahtjev dodje
    provjerimo ima li koga u nizu, ako ima spojimo ih
    ako nema dodamo ga u niz i nek ceka neko da se poveze
    objekat koji dodajemo u listu imena iz sesije

    kad se povezuju igraci tek se kreira nova igra, s istim uuidom na koji se salju socket poruke
  */


  socket.on('multiplayer', async () => {
    console.log("User clicked on mp", socket.id);
    //const new_board = new TicTacToeBoard();
    if (waiting_list.length === 0) {
      const uuid = uuidv4();
      waiting_list.push({ uuid: uuid, username: req.session.user.username })

      console.log("user waiting on mp", req.session.user.username);
      return socket.join(uuid);
    }

    first_player = waiting_list[0];
    waiting_list.shift();

    const new_board = new TicTacToeBoard("mp", first_player.username, req.session.user.username);
    new_board.uuid = first_player.uuid;

    await client.set(new_board.uuid, JSON.stringify(new_board.getBoardInfo()));
    socket.join(new_board.uuid);
    io.to(new_board.uuid).emit('set_board', new_board.getBoardInfo());
    console.log("user joined mp", req.session.user.username)
  });

  socket.on('box_click', async (move) => {
    console.log(move);
    let game = await client.get(move.uuid);
    game = JSON.parse(game);


    const game_board = new TicTacToeBoard(game.game_mode, game.p1_name, game.p2_name);
    game_board.board = game.board;
    game_board.current_player_turn = game.current_player_turn;
    game_board.uuid = game.uuid;
    game_board.winner = game.winner;

    if (game.winner !== 0) {
      console.log("game is over");
      return io.to(game.uuid).emit('set_board', game_board.getBoardInfo());
    }

    const move_done = game_board.makeMove(move);
    const { uuid, winner } = game_board.getBoardInfo();

    await client.set(uuid, JSON.stringify(game_board.getBoardInfo()));
    io.to(uuid).emit('set_board', game_board.getBoardInfo());

  });



});

const getIO = () => {
  return io;
}






module.exports = { getIO };