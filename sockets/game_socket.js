const io = require("socket.io")();
const { v4: uuidv4 } = require('uuid');
const TicTacToeBoard = require(".././helpers/tictactoe_logic.js");
const { client } = require("../helpers/redis-client.js");
const { user_db_functions } = require('../database/database_functions.js');


let waiting_list = [];

io.on('connection', (socket) => {
  console.log("User connected on game socket", socket.id);
  const req = socket.request;

  socket.user_data = req.session.user;
  console.log(socket.user_data);

  socket.use((__, next) => {
    req.session.reload((err) => {
      if (err) {
        socket.disconnect();
      } else {
        next();
      }
    });
  });


  socket.on("disconnect", (reason) => {
    // kicking user out of waiting list
    waiting_list = waiting_list.filter(sc_id => sc_id !== socket.id);
  });

  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("user has left", `${socket.user_data.username} has left the game !`);
      }
    }
  });

  socket.on('singleplayer', async () => {
    console.log("User clicked on sp", socket.id);

    const new_board = new TicTacToeBoard("sp", socket.id, "player 2");
    const { uuid } = new_board.getBoardInfo();
    await client.set(uuid, JSON.stringify(new_board.getBoardInfo()));
    socket.join(uuid);
    io.to(uuid).emit('set_board', new_board.getBoardInfo());
    console.log("user joined sp room", uuid);
  });


  socket.on('multiplayer', async () => {
    console.log("User clicked on multiplayer", socket.id);
    waiting_list.push(socket.id);

    if (waiting_list.length < 2) {
      return;
    }


    first_player = waiting_list[0];
    second_player = waiting_list[1];
    waiting_list.shift();
    waiting_list.shift();

    const new_board = new TicTacToeBoard("mp", first_player, second_player);

    await client.set(new_board.uuid, JSON.stringify(new_board.getBoardInfo()));

    io.to(first_player).emit('set_user_sign', 'X');
    io.to(second_player).emit('set_user_sign', 'O');

    io.in(first_player).socketsJoin(new_board.uuid);
    io.in(second_player).socketsJoin(new_board.uuid);

    io.to(new_board.uuid).emit('set_board', new_board.getBoardInfo());
  });


  socket.on('play_against_friend', async (friend) => {
    friend_username = friend.friend_username;
    const all_sockets = await io.fetchSockets();

    //for (const socket of all_sockets) {
    //   console.log(socket.id);
    //   console.log(socket.handshake);
    //   console.log(socket.rooms);
    //   console.log(socket.data);
    //console.log(socket.user_data);
    //console.log("next socket iteration");
    //}

    const filtered_users = all_sockets.filter(soc => soc.user_data.username === friend_username);

    if (filtered_users.length === 0) {
      return socket.emit('player_not_online');
    }

    const target_users_id = filtered_users[0].id;
    socket.friend_game = friend_username;
    io.to(target_users_id).emit('friend_invite', { friend_username: req.session.user.username });

    console.log("User clicked on play against a friend", friend);
  });


  socket.on('accept_friend_invite', async (friend) => {
    const all_sockets = await io.fetchSockets();

    const filtered_users = all_sockets.filter(soc => soc.user_data.username === friend.friend);

    if (filtered_users.length === 0) {
      return socket.emit('player_not_online');
    }

    const friend_game = filtered_users[0].friend_game;
    const target_users_id = filtered_users[0].id;
    if (friend_game === req.session.user.username) {
      const new_board = new TicTacToeBoard("mp", target_users_id, socket.id);

      await client.set(new_board.uuid, JSON.stringify(new_board.getBoardInfo()));
      socket.join(new_board.uuid);

      io.in(target_users_id).socketsJoin(new_board.uuid);

      io.to(new_board.uuid).emit('set_board', new_board.getBoardInfo());
      console.log("game accepted");
      io.to(target_users_id).emit('accepted_invite', { friend_username: req.session.user.username });
    }
  });

  socket.on('box_click', async (move) => {
    let game = await client.get(move.uuid);
    game = JSON.parse(game);

    const game_board = new TicTacToeBoard(game.game_mode, game.p1_socket_id, game.p2_socket_id);
    game_board.board = game.board;
    game_board.current_player_turn = game.current_player_turn;
    game_board.uuid = game.uuid;
    game_board.winner = game.winner;
    game_board.board_sums = game.board_sums;
    game_board.move_count = game.move_count;

    if (game_board.isGameFinished()) {
      return io.to(game.uuid).emit('set_winner', game_board.getBoardInfo());
    }

    game_board.makeMove(move);

    await client.set(game_board.uuid, JSON.stringify(game_board.getBoardInfo()));

    io.to(game.uuid).emit('set_board', game_board.getBoardInfo());

    if (game_board.isGameFinished()) {
      if (game_board.game_mode === "mp") {
        const p1_socket = io.sockets.sockets.get(game_board.p1_socket_id);
        const p2_socket = io.sockets.sockets.get(game_board.p2_socket_id);
        let winner_str;

        if (game_board.winner === game_board.PLAYER_1) {
          winner_str = "p1";
        } else if (game_board.winner === game_board.PLAYER_2) {
          winner_str = "p2";
        } else {
          winner_str = "draw";
        }

        await user_db_functions.saveGameResults(p1_socket.user_data.user_id, p2_socket.user_data.user_id, winner_str);
      }
      return io.to(game.uuid).emit('set_winner', game_board.getBoardInfo());
    }
  });

});

const getIO = () => {
  return io;
}


module.exports = { getIO };