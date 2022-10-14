class TicTacToeBoard {
  board;
  current_player_turn;
  winner;

  EMPTY_BOX = 0;
  PLAYER_1 = 10;
  PLAYER_2 = 20;
  ROWS = 3;
  COLUMNS = 3;

  constructor() {
    this.board = [
      [this.EMPTY_BOX, this.EMPTY_BOX, this.EMPTY_BOX],
      [this.EMPTY_BOX, this.EMPTY_BOX, this.EMPTY_BOX],
      [this.EMPTY_BOX, this.EMPTY_BOX, this.EMPTY_BOX]
    ];
    this.current_player_turn = this.PLAYER_1;
    this.winner = 0;
  }

  gameFinished() {

    // rows
    for (let i = 0; i < this.ROWS; i++) {
      let score_row = 0;
      let score_col = 0;
      for (let j = 0; j < this.COLUMNS; j++) {
        if (this.board[i][j] === this.PLAYER_1) {
          score++;
        } else if (this.board[i][j] === this.PLAYER_2) {
          score--;
        }
      }
      if (score_row === ROWS || score_col === COLUMNS) {
        this.winner = this.PLAYER_1;
      }
      else if (score_row === -ROWS || score_col === -COLUMNS) {
        this.winner = this.PLAYER_2;
      }
    }

    // diagonals
    let d1 = 0;
    let d2 = 0;
    for (let i = 0; i < this.ROWS; i++) {
      if (this.board[i][i] === this.PLAYER_1) {
        d1++;
      } else if (this.board[i][i] === this.PLAYER_2) {
        d1--;
      }

      if (this.board[this.ROWS - i - 1][this.ROWS - i - 1] === this.PLAYER_1) {
        d2++;
      } else if (this.board[this.ROWS - i - 1][this.ROWS - i - 1] === this.PLAYER_2) {
        d2--;
      }
    }

    return (this.winner !== 0);
  }

  isMoveLegal(move) {
    if (move.row < 0 || move.row > (rows - 1) || move.column < 0 || move.column > (COLUMNS - 1)) {
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
    if (this.isMoveLegal(move)) {
      this.board[move.row][move.column] = this.current_player_turn;
      if (gameFinished())
        return true;

      this.changeTurn();
      return true;
    }
    return false;
  }

  getBoardInfo() {
    return { board: this.board, current_player_turn: this.current_player_turn };
  }


}

module.exports = TicTacToeBoard;