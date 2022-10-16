const socket = io({
  auth: {
    token: "abcd"
  }
});

let game_mode;
let board_uuid;

const onBoxClick = (x, y) => {
  console.log("CLICK");
  console.log(x + " " + y + " " + board_uuid);

  socket.emit('box_click', { row: x, column: y, uuid: board_uuid });
}

const getPlayerSign = (player_number) => {
  if (player_number === 10)
    return 'X';
  else if (player_number === 20)
    return 'O';
  return '';
}

const startSinglePlayer = () => {
  socket.emit('singleplayer');
}

const startMultiPlayerGame = () => {
  socket.emit('multiplayer');
}

socket.on('set_board', function (board) {

  console.log(board);
  board_uuid = board.uuid;
  game_mode = board.mode;
  let html = ``;

  for (let i = 0; i < board.board.length; i++) {
    for (let j = 0; j < board.board[i].length; j++) {
      html = html + `<div onclick="onBoxClick(${i}, ${j}, this)" class="box">${getPlayerSign(board.board[i][j])}</div>`;
    }

    $('.game-board').empty().append(html);

  }

});


socket.on(board_uuid, function (board) {
  console.log("mp socket");
});

