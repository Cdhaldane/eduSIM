import React, { useState} from 'react'
import ReactDOM from 'react-dom'
import './TicTacToe.css'
import calculateWinner from './calculate-winner'
import Draggable from 'react-draggable'; // The default

function getStatus(squares, xIsNext) {
  const winner = calculateWinner(squares)
  if (winner) {
    return `Winner: ${winner}`
  } else if (squares.every(Boolean)) {
    return `Scratch: Cat's game`
  } else {
    return `Player ${xIsNext ? 'X' : '0'}`
  }
}

function gameReducer(state, action) {
  const {squares, xIsNext} = state
  switch (action.type) {
    case 'SELECT_SQUARE': {
      const {square} = action
      const winner = calculateWinner(squares)
      if (winner || squares[square]) {
        return state
      }
      const squaresCopy = [...squares]
      squaresCopy[square] = xIsNext ? 'X' : '0'
      return {
        squares: squaresCopy,
        xIsNext: !xIsNext,
      }
    }
    case 'RESET': {
      return {squares: Array(9).fill(null)}
    }
    default: {
      throw new Error(
        `Unhandled action type: ${action.type}. Please fix it. Thank you.`,
      )
    }
  }
}

function Board(props) {

  const [state, dispatch] = React.useReducer(gameReducer, {
    squares: Array(9).fill(null),
    xIsNext: true,
  })
  const {squares, xIsNext} = state

  function renderSquare(index) {
    return (
      <button className="squaretic" onClick={() => selectSquare(index)}>
        {squares[index]}
      </button>
    )
  }
  function handleReset(){
    for(let i = 0; i < 9; i++){
      dispatch({type: 'RESET', i})
  }
  }

  function selectSquare(square) {
    dispatch({type: 'SELECT_SQUARE', square})
  }

  const status = getStatus(squares, xIsNext)
  var show = true;

  return (
    <div>
      <div className="statustic">{status}</div>
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
      <button id="resetbutton" onClick={handleReset}>Reset</button>
      <button id="ticeditbutton" onClick={props.handleShow}>Edit</button>
      {props.show && <div className="edit-container">
      <button onClick={props.handleTicDelete}>Delete</button>
        </div>
      }
    </div>
  )
}

function Game(props) {
  const [show, setShow] = useState(false)
  function handleShow(){
    setShow(!show)
  }
  function handleDelete(){
    props.handleTicDelete(props.i);
  }
  return (
    <Draggable>
    <div className="gametic">
      <Board
      show={show}
      handleShow={handleShow}
      handleTicDelete={handleDelete}
      />
    </div>
  </Draggable>
  )
}

export default Game






// import React from "react";
// import {Link } from "react-router-dom";
// import Draggable from 'react-draggable'; // The default
// import "./TicTacToe.css";
//
// function TicTacToe(props) {
// return (
//   <Draggable>
//   <div className="tic-container">
//     <h1>hello</h1>
//   </div>
// </Draggable>
// );
// }
//
// export default TicTacToe;
