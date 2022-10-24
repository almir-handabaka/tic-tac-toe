const socket = io({});

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "preventDuplicates": true,
  "showDuration": "1000",
  "hideDuration": "3000",
  "timeOut": "10000",
  "extendedTimeOut": "3000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

let board;

const onBoxClick = (x, y) => {
  if (board.game_mode === 'sp') {
    socket.emit('box_click', { row: x, column: y, uuid: board.uuid });
  }
  else if (getPlayerTurn()) {
    socket.emit('box_click', { row: x, column: y, uuid: board.uuid });
  }
}

const getPlayerTurn = () => {
  if ((board.current_player_turn === 10 && socket.id === board.p1_socket_id) || (board.current_player_turn === 20 && socket.id === board.p2_socket_id)) {
    return true;
  }
  return false;
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

const playAgainstAFriend = () => {
  const friend_username = $('#friend_username').val();
  console.log(friend_username);
  socket.emit('play_against_friend', { friend_username });
}

socket.on('set_board', function (new_board) {
  board = new_board;
  let html = ``;

  for (let i = 0; i < board.board.length; i++) {
    for (let j = 0; j < board.board[i].length; j++) {
      html = html + `<div onclick="onBoxClick(${i}, ${j}, this)" class="box">${getPlayerSign(board.board[i][j])}</div>`;
    }

    $('.game-board').empty().append(html);

    setScorebox();

  }

});


socket.on('set_winner', function (new_board) {
  if (board.current_player_turn === 10) {
    $('.scorebox').empty().append("X is the winner");
  }

  else if (board.current_player_turn === 20) {
    $('.scorebox').empty().append("O is the winner");
  }
});


const setScorebox = () => {
  if (board.current_player_turn === 10) {
    $('.scorebox').empty().append("X");
    $(".scorebox").css("border-color", "green");
  }

  else if (board.current_player_turn === 20) {
    $('.scorebox').empty().append("O");
    $(".scorebox").css("border-color", "green");
  }
}

socket.on('player_not_online', function () {
  console.log("player not online");
  toastr["error"]("Player is not online!")
});

socket.on('friend_invite', function (friend) {
  console.log(friend);
  toastr["success"](`</br>
    <div>
    <button type="button" id="surpriseBtn" class="btn" style="margin: 0 8px 0 8px" onclick="acceptFriendInvite('${friend.friend_username}')" >Accept invite</button>
    </div> `, `${friend.friend_username} invited you to a game!`)
});

socket.on('accepted_invite', function (friend) {
  console.log("player accepted");
  toastr["success"](`${friend.friend_username} accepted your invite.`)

});

const acceptFriendInvite = (friend) => {
  socket.emit('accept_friend_invite', { friend });
}