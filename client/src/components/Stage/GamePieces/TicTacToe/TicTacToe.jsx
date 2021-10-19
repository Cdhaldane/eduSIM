import React, { useState, forwardRef } from 'react';
import './TicTacToe.css';
import calculateWinner from './calculate-winner';
import CustomWrapper from "../CustomWrapper";

const getStatus = (squares, xIsNext) => {
  const winner = calculateWinner(squares);

  if (winner) {
    return `Winner: ${winner}`;
  } else if (squares.every(Boolean)) {
    return `Scratch: Cat's game`;
  } else {
    return `Player ${xIsNext ? 'X' : '0'}`;
  }
}

const Board = (props) => {

  const {
    squares = new Array(9),
    xIsNext = true
  } = props.status;

  const renderSquare = (index) => {
    return (
      <button className="squaretic" onClick={() => selectSquare(index)}>
        {squares[index]}
      </button>
    )
  }

  const handleReset = () => {
    props.updateStatus({
      squares: new Array(9),
      xIsNext: true
    });
  }

  const selectSquare = (square) => {
    const winner = calculateWinner(squares);
    if (winner || squares[square]) {
      return;
    }
    const squaresCopy = [...squares];
    squaresCopy[square] = xIsNext ? 'X' : '0';
    props.updateStatus({
      squares: squaresCopy,
      xIsNext: !xIsNext
    });
  }

  const status = getStatus(squares, xIsNext);

  return (
    <div>
      <div className="statustic">{status}</div>
      <div className="ticTacToeButtons">
        <button id="resetbutton" onClick={handleReset}>Reset</button>
        <button id="ticeditbutton" onClick={props.handleShow}>Edit</button>
      </div>
      <div className="board-rowtic">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-rowtic">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-rowtic">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>

      {props.show && <div className="edit-container">
        <button onClick={props.handleTicDelete}>Delete</button>
      </div>
      }
    </div>
  );
}

const Game = forwardRef((props, ref) => {

  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(!show);
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      <div className="gametic">
        <Board
          show={show}
          handleShow={handleShow}
          status={props.status}
          updateStatus={props.updateStatus}
        />
      </div>
    </CustomWrapper>
  )
});

export default Game;
