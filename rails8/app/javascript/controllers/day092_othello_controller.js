import { Controller } from "@hotwired/stimulus";

const STORAGE_KEY = "day092-othello-state";
const BOARD_SIZE = 8;
const BLACK = "black";
const WHITE = "white";
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export default class extends Controller {
  static targets = [
    "board",
    "blackScore",
    "whiteScore",
    "turnLabel",
    "statusMessage",
    "passButton",
  ];

  connect() {
    this.state = this.loadState();
    this.render();
  }

  placeStone(event) {
    const row = Number(event.params.row);
    const col = Number(event.params.col);
    const flips = this.flipsForMove(this.state.board, row, col, this.state.currentPlayer);

    if (flips.length === 0 || this.state.finished) return;

    this.state.board[row][col] = this.state.currentPlayer;
    flips.forEach(([flipRow, flipCol]) => {
      this.state.board[flipRow][flipCol] = this.state.currentPlayer;
    });

    const player = this.state.currentPlayer;
    const nextPlayer = this.opponentFor(player);
    const nextMoves = this.validMovesFor(nextPlayer);
    const currentMoves = this.validMovesFor(player);

    if (nextMoves.length > 0) {
      this.state.currentPlayer = nextPlayer;
      this.state.message = `${this.labelFor(player)} が ${flips.length} 枚ひっくり返しました。`;
    } else if (currentMoves.length > 0) {
      this.state.message = `${this.labelFor(nextPlayer)} は打てないのでパスです。${this.labelFor(player)} が続けて打ちます。`;
    } else {
      this.finishGame(`${this.labelFor(player)} の一手で両者とも打てなくなりました。`);
    }

    this.persistAndRender();
  }

  passTurn() {
    if (this.state.finished) return;

    const passer = this.state.currentPlayer;
    const currentMoves = this.validMovesFor(this.state.currentPlayer);
    const opponent = this.opponentFor(this.state.currentPlayer);
    const opponentMoves = this.validMovesFor(opponent);

    if (currentMoves.length > 0 || opponentMoves.length === 0) return;

    this.state.currentPlayer = opponent;
    this.state.message = `${this.labelFor(passer)} がパスしました。${this.labelFor(opponent)} の手番です。`;
    this.persistAndRender();
  }

  resetGame() {
    this.state = this.initialState();
    this.persistAndRender();
  }

  render() {
    const validMoves = this.state.finished ? [] : this.validMovesFor(this.state.currentPlayer);
    const blackScore = this.scoreFor(BLACK);
    const whiteScore = this.scoreFor(WHITE);

    this.blackScoreTarget.textContent = String(blackScore);
    this.whiteScoreTarget.textContent = String(whiteScore);
    this.turnLabelTarget.textContent = this.state.finished
      ? this.winnerLabel(blackScore, whiteScore)
      : `${this.labelFor(this.state.currentPlayer)} to move`;
    this.statusMessageTarget.textContent = this.state.finished
      ? this.state.message
      : this.statusText(validMoves);
    this.passButtonTarget.disabled = this.state.finished || !(validMoves.length === 0 && this.validMovesFor(this.opponentFor(this.state.currentPlayer)).length > 0);
    this.boardTarget.innerHTML = this.boardMarkup(validMoves);
  }

  boardMarkup(validMoves) {
    return this.state.board
      .map((row, rowIndex) =>
        row
          .map((cell, colIndex) => {
            const validMove = validMoves.some(([validRow, validCol]) => validRow === rowIndex && validCol === colIndex);
            const stoneMarkup = cell
              ? `<span class="block h-[78%] w-[78%] rounded-full ${cell === BLACK ? "bg-slate-950 shadow-[inset_0_4px_10px_rgba(255,255,255,0.08)]" : "bg-white shadow-[inset_0_-8px_14px_rgba(15,23,42,0.12),0_2px_10px_rgba(255,255,255,0.3)]"}"></span>`
              : validMove
                ? `<span class="block h-3 w-3 rounded-full bg-emerald-200/90"></span>`
                : "";

            return `
              <button
                type="button"
                class="flex aspect-square items-center justify-center rounded-[1rem] border ${validMove ? "border-emerald-200 bg-emerald-500/50 hover:bg-emerald-500/65" : "border-white/10 bg-emerald-700/80"} transition disabled:cursor-default"
                ${validMove ? "" : "disabled"}
                data-action="click->day092-othello#placeStone"
                data-day092-othello-row-param="${rowIndex}"
                data-day092-othello-col-param="${colIndex}"
                aria-label="row ${rowIndex + 1} column ${colIndex + 1}"
              >
                ${stoneMarkup}
              </button>
            `;
          })
          .join(""),
      )
      .join("");
  }

  statusText(validMoves) {
    if (validMoves.length === 0) {
      return `${this.labelFor(this.state.currentPlayer)} は置ける場所がありません。Pass を押してください。`;
    }

    return `${this.state.message} 合法手は ${validMoves.length} 箇所です。`;
  }

  initialState() {
    const board = Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));

    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;

    return {
      board,
      currentPlayer: BLACK,
      finished: false,
      message: "合法手をクリックすると石が置かれます。",
    };
  }

  loadState() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return this.initialState();

    try {
      return this.normalizeState(JSON.parse(raw));
    } catch (_error) {
      return this.initialState();
    }
  }

  normalizeState(state) {
    const initial = this.initialState();
    const board = Array.from({ length: BOARD_SIZE }, (_, rowIndex) =>
      Array.from({ length: BOARD_SIZE }, (_, colIndex) => {
        const value = state?.board?.[rowIndex]?.[colIndex];
        return value === BLACK || value === WHITE ? value : null;
      }),
    );

    return {
      board,
      currentPlayer: state?.currentPlayer === WHITE ? WHITE : BLACK,
      finished: Boolean(state?.finished),
      message: typeof state?.message === "string" ? state.message : initial.message,
    };
  }

  persistAndRender() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.render();
  }

  validMovesFor(player) {
    const moves = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (this.flipsForMove(this.state.board, row, col, player).length > 0) {
          moves.push([row, col]);
        }
      }
    }

    return moves;
  }

  flipsForMove(board, row, col, player) {
    if (board[row][col] !== null) return [];

    const opponent = this.opponentFor(player);
    const flips = [];

    DIRECTIONS.forEach(([rowStep, colStep]) => {
      let currentRow = row + rowStep;
      let currentCol = col + colStep;
      const line = [];

      while (this.onBoard(currentRow, currentCol) && board[currentRow][currentCol] === opponent) {
        line.push([currentRow, currentCol]);
        currentRow += rowStep;
        currentCol += colStep;
      }

      if (
        line.length > 0 &&
        this.onBoard(currentRow, currentCol) &&
        board[currentRow][currentCol] === player
      ) {
        flips.push(...line);
      }
    });

    return flips;
  }

  finishGame(prefix) {
    this.state.finished = true;

    const blackScore = this.scoreFor(BLACK);
    const whiteScore = this.scoreFor(WHITE);
    const winner = this.winnerLabel(blackScore, whiteScore);

    this.state.message = `${prefix} 最終結果は Black ${blackScore} - White ${whiteScore}。${winner}。`;
  }

  scoreFor(player) {
    return this.state.board.flat().filter((cell) => cell === player).length;
  }

  winnerLabel(blackScore, whiteScore) {
    if (blackScore === whiteScore) return "Draw";
    return blackScore > whiteScore ? "Black wins" : "White wins";
  }

  opponentFor(player) {
    return player === BLACK ? WHITE : BLACK;
  }

  labelFor(player) {
    return player === BLACK ? "Black" : "White";
  }

  onBoard(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }
}
