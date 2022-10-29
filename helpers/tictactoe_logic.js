const { v4: uuidv4 } = require('uuid');

class TicTacToeBoard {
  board;
  board_sums;
  current_player_turn;
  winner;
  uuid;
  move_count;


  game_mode;

  p1_socket_id;
  p2_socket_id;

  EMPTY_BOX = 0;
  PLAYER_1 = 10;
  PLAYER_2 = 20;
  NO_WINNER = 30;
  SIZE = 3; // matrix size * size

  constructor(game_mode, p1_socket_id, p2_socket_id) {
    this.board = [];
    for (let i = 0; i < this.SIZE; i++) {
      const arr = Array(this.SIZE).fill(this.EMPTY_BOX);
      this.board.push(arr);
    }

    this.board_sums = Array((this.SIZE * 2) + 2).fill(0);

    this.current_player_turn = this.PLAYER_1;
    this.winner = 0;
    this.uuid = uuidv4();
    this.game_mode = game_mode;

    this.move_count = 0;

    this.p1_socket_id = p1_socket_id;
    this.p2_socket_id = p2_socket_id;
  }

  isGameFinished() {
    return (this.winner !== 0);
  }

  isMoveLegal(move) {
    if (move.row < 0 || move.row > (this.ROWS - 1) || move.column < 0 || move.column > (this.COLUMNS - 1)) {
      return false;
    }
    else if (this.board[move.row][move.column] !== this.EMPTY_BOX) {
      return false;
    }
    return true;
  }

  changeTurn() {
    if (this.current_player_turn === this.PLAYER_1) {
      this.current_player_turn = this.PLAYER_2;
      return;
    }
    this.current_player_turn = this.PLAYER_1;
  }

  makeMove(move) {
    if (this.isGameFinished())
      return false;

    if (!this.isMoveLegal(move))
      return false;

    this.board[move.row][move.column] = this.current_player_turn;

    if (this.current_player_turn === this.PLAYER_1) {
      // update row sum
      this.board_sums[move.row]++;
      // update col sum
      this.board_sums[this.SIZE + move.column]++;
      // diag 1
      if (move.row - move.column === 0) {
        this.board_sums[this.SIZE * 2]++;
      }
      // diag 2
      if (move.row + move.column === this.SIZE - 1) {
        this.board_sums[(this.SIZE * 2) + 1]++;
      }
    }
    else {
      // update row sum
      this.board_sums[move.row]--;
      // update col sum
      this.board_sums[this.SIZE + move.column]--;
      // diag 1
      if (move.row - move.column === 0) {
        this.board_sums[this.SIZE * 2]--;
      }
      // diag 2
      if (move.row + move.column === this.SIZE - 1) {
        this.board_sums[(this.SIZE * 2) + 1]--;
      }
    }

    if (this.board_sums[move.row] === this.SIZE || this.board_sums[this.SIZE + move.column] === this.SIZE || this.board_sums[this.SIZE * 2] === this.SIZE || this.board_sums[(this.SIZE * 2) + 1] === this.SIZE) {
      this.winner = this.PLAYER_1;
    }
    else if (this.board_sums[move.row] === -this.SIZE || this.board_sums[this.SIZE + move.column] === -this.SIZE || this.board_sums[this.SIZE * 2] === -this.SIZE || this.board_sums[(this.SIZE * 2) + 1] === -this.SIZE) {
      this.winner = this.PLAYER_2;
    }

    this.move_count++;

    if (!this.isGameFinished())
      this.changeTurn();

    if (!this.isGameFinished() && this.winner === 0 && this.move_count === (this.SIZE * this.SIZE)) {
      this.winner = this.NO_WINNER;
    }

    return true;
  }

  getBoardInfo() {
    return { board: this.board, current_player_turn: this.current_player_turn, uuid: this.uuid, winner: this.winner, game_mode: this.game_mode, p1_socket_id: this.p1_socket_id, p2_socket_id: this.p2_socket_id, board_sums: this.board_sums, move_count: this.move_count };
  }

}

module.exports = TicTacToeBoard;