import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./Board.css";
import CustomWrapper from "../CustomWrapper";

const boardSettings = {
  rows: 8,
  columns: 10,
  dropAnimationRate: 50,
  flashAnimationRate: 600,
  colors: {
    empty: "white",
    p1: "#BB2222",
    p2: "#2222BB"
  }
};

const winTypes = {
  vertical: 0,
  horizontal: 1,
  forwardsDiagonal: 2,
  backwardsDiagonal: 3
};

const ConnectFour = forwardRef((props, ref) => {

  const getFirstPlayerTurn = () => {
    return boardSettings.colors.p1;
  }

  const createBoard = () => {
    return new Array(boardSettings.rows * boardSettings.columns).fill(
      boardSettings.colors.empty
    );
  }

  const {
    currentPlayer = getFirstPlayerTurn()
  } = props.status;

  const [board, setBoard] = useState(createBoard());
  const [win, setWin] = useState(null);
  const [flashTimer, setFlashTimer] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [firstRefresh, setFirstRefresh] = useState(true);
  const domBoard = useRef(null);

  /**
   * Helper function to get the index in the board using row and column.
   * @param {number} row - row in board
   * @param {number} column - column in board
   */
  const getIndex = (row, column) => {
    const index = row * boardSettings.columns + column;
    if (index > boardSettings.rows * boardSettings.colums) return null;
    return index;
  }

  const getRowAndColumn = (index) => {
    if (index > boardSettings.rows * boardSettings.colums) return null;
    const row = Math.floor(index / boardSettings.columns);
    const column = Math.floor(index % boardSettings.columns);
    return {
      row,
      column
    };
  }

  const restartGame = () => {
    props.updateStatus({
      board: createBoard(),
      currentPlayer: getFirstPlayerTurn()
    })
  }

  const getDomBoardCell = (index) => {
    if (!domBoard.current) return;
    const board = domBoard.current;
    const blocks = board.querySelectorAll(".board-block");
    return blocks[index];
  }

  const findFirstEmptyRow = (column) => {
    let { empty } = boardSettings.colors;
    let { rows } = boardSettings;
    for (let i = 0; i < rows; i++) {
      if (board[getIndex(i, column)] !== empty) {
        return i - 1;
      }
    }
    return rows - 1;
  }

  const handleDrop = async (column) => {
    if (dropping || win) return;
    const row = findFirstEmptyRow(column);
    if (row < 0) return;
    const newBoard = board.slice();
    newBoard[getIndex(row, column)] = currentPlayer;
    props.updateStatus({
      board: newBoard,
      currentPlayer: (
        currentPlayer === boardSettings.colors.p1
          ? boardSettings.colors.p2
          : boardSettings.colors.p1
      )
    });
  }

  useEffect(() => {
    if (props.status.board && board !== props.status.board) {
      (async () => {
        if (!firstRefresh) {
          let r = null, c = null, ii = null, clear = false;
          for (let i = 0; i < boardSettings.rows * boardSettings.columns; i++) {
            if (props.status.board[i] !== board[i]) {
              if (r || c) clear = true;
              ii = i;
              r = Math.floor(i / boardSettings.columns);
              c = i % boardSettings.columns;
            }
          }
          if (!clear) {
            setDropping(true);
            await animateDrop(r, c, props.status.board[ii]);
            setDropping(false);
          } else {
            setWin(null);
          }
        }
        setFirstRefresh(false);
        setBoard(props.status.board);
      })();
    }
  }, [props.status.board]);

  const animateDrop = async (row, column, color, currentRow) => {
    if (currentRow === undefined) {
      currentRow = 0;
    }
    return new Promise(resolve => {
      if (currentRow > row) {
        return resolve();
      }
      if (currentRow > 0) {
        let c = getDomBoardCell(getIndex(currentRow - 1, column));
        c.style.backgroundColor = boardSettings.colors.empty;
      }
      let c = getDomBoardCell(getIndex(currentRow, column));
      c.style.backgroundColor = color;
      setTimeout(
        () => resolve(animateDrop(row, column, color, ++currentRow)),
        boardSettings.dropAnimationRate
      );
    });
  }

  /**
   * End game animation.
   */
  useEffect(() => {
    if (!win) {
      return;
    }

    const flashWinningCells = (on) => {
      const { empty } = boardSettings.colors;
      const { winner } = win;
      for (let o of win.winningCells) {
        let c = getDomBoardCell(getIndex(o.row, o.column));
        if (!c) return;
        c.style.backgroundColor = on ? winner : empty;
      }
      setFlashTimer(
        setTimeout(
          () => flashWinningCells(!on),
          boardSettings.flashAnimationRate
        )
      );
    }

    flashWinningCells(false);
  }, [win, setFlashTimer]);

  /**
   * Clears the end game animation timeout when game is restarted.
   */
  useEffect(() => {
    if (!win) {
      if (flashTimer) clearTimeout(flashTimer);
    }
  }, [win, flashTimer]);

  /**
   * Check for win when the board changes.
   */
  useEffect(() => {
    if (dropping || win) return;

    const isWin = () => {
      return (
        isForwardsDiagonalWin() ||
        isBackwardsDiagonalWin() ||
        isHorizontalWin() ||
        isVerticalWin() ||
        null
      );
    }

    const createWinState = (start, winType) => {
      const win = {
        winner: board[start],
        winningCells: []
      };

      let pos = getRowAndColumn(start);

      while (true) {
        let current = board[getIndex(pos.row, pos.column)];
        if (current === win.winner) {
          win.winningCells.push({ ...pos });
          if (winType === winTypes.horizontal) {
            pos.column++;
          } else if (winType === winTypes.vertical) {
            pos.row++;
          } else if (winType === winTypes.backwardsDiagonal) {
            pos.row++;
            pos.column++;
          } else if (winType === winTypes.forwardsDiagonal) {
            pos.row++;
            pos.column--;
          }
        } else {
          return win;
        }
      }
    }

    const isHorizontalWin = () => {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column <= columns - 4; column++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let k = column + 1; k < column + 4; k++) {
            if (board[getIndex(row, k)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.horizontal);
            }
          }
        }
      }
    }

    const isVerticalWin = () => {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let column = 0; column < columns; column++) {
        for (let row = 0; row <= rows - 4; row++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let k = row + 1; k < row + 4; k++) {
            if (board[getIndex(k, column)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.vertical);
            }
          }
        }
      }
    }

    const isBackwardsDiagonalWin = () => {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let row = 0; row <= rows - 4; row++) {
        for (let column = 0; column <= columns - 4; column++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let i = 1; i < 4; i++) {
            if (board[getIndex(row + i, column + i)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.backwardsDiagonal);
            }
          }
        }
      }
    }

    const isForwardsDiagonalWin = () => {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let row = 0; row <= rows - 4; row++) {
        for (let column = 3; column <= columns; column++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let i = 1; i < 4; i++) {
            if (board[getIndex(row + i, column - i)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.forwardsDiagonal);
            }
          }
        }
      }
    }

    setWin(isWin());
  }, [board, dropping, win]);

  const createDropButtons = () => {
    const btns = [];
    for (let i = 0; i < boardSettings.columns; i++) {
      btns.push(
        <button
          key={i}
          className="cell drop-button"
          onClick={() => handleDrop(i)}
          style={{
            backgroundColor: currentPlayer
          }}
        />
      );
    }
    return btns;
  }

  const cells = board.map((c, i) => (
    <button
      key={"c" + i}
      className="cell board-block"
      style={{
        backgroundColor: c
      }}
    />
  ));

  const getGridTemplateColumns = () => {
    let gridTemplateColumns = "";
    for (let i = 0; i < boardSettings.columns; i++) {
      gridTemplateColumns += "auto ";
    }
    return gridTemplateColumns;
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      <div className="connectcontainer">
        <div
          className={`board ${currentPlayer === boardSettings.colors.p1 ? "p1-turn" : "p2-turn"
            } `}
          ref={domBoard}
          style={{
            gridTemplateColumns: getGridTemplateColumns()
          }}
        >
          {createDropButtons()}
          {cells}
        </div>
        {!win && (
          <h2 style={{ color: currentPlayer }}>
            {currentPlayer === boardSettings.colors.p1 ? "Player 1" : "Player 2"}
          </h2>
        )}
        {win && (
          <>
            <h1 style={{ color: win.winner }}>
              {" "}
              {win.winner === boardSettings.colors.p1
                ? "Player 1"
                : "Player 2"}{" "}
              WON!
            </h1>
            <button onClick={restartGame}>Play Again</button>
            <br />
            <br />
          </>
        )}
      </div>
    </CustomWrapper>
  );
});


export default ConnectFour;
