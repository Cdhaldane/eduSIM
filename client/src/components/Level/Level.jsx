import React, { useState } from "react";
import { times } from "lodash";
import { Link } from "react-router-dom";
import Pencil from "../Pencils/Pencil"

import "./Level.css"

const Level = (props) => {
  const [count, setCount] = useState(1);
  let items = [];

  const handleLevel = (e) => {
    props.level(e);
  }

  const handleCount = () => {
    if (count > props.number - 1) {
      setCount(1)
      handleLevel(1)
    } else {
      setCount(count + 1);
      handleLevel(count + 1);
    }
  }

  const createSelectItems = () => {
    for (let i = 0; i < props.number; i++) {
      items.push(
        <option key={i} value={i+1}>
          {props.pages[i]}
        </option>
      );
    }
    return items;
  }

  const handleChange = (event) => {
    setCount(parseInt(event.target.value));
    handleLevel(parseInt(event.target.value));
  }

  return (
    <div id="levelContainer">
      <div className={`level ${props.gamepage ? 'level-gamepage' : ''}`}>
        {!props.gamepage && <h1 id="editModeTitle">Edit Mode</h1>}
        <div className="level-nav">
          {!props.gamepage && (
            <select className="level-select" onChange={handleChange} value={count}>
              {createSelectItems()}
            </select>
          )}

          <div className="level-bar">
            {times(props.number, (num) => ( // dynamically scaling level bar
              <div key={num} className="level-bar-section">
                <div className={`level-bar-node ${num + 1 == count ? "level-bar-node-active" : ""}`} />
                {num != props.number - 1 && (<div className="level-bar-line" />)}
              </div>
            ))}
          </div>

          {props.handlePageNum && (
            <Pencil
              id="Timeline"
              psize="3"
              type="info"
              handlePageTitle={props.handlePageTitle}
              handlePageNum={props.handlePageNum}
              numOfPages={props.numOfPages}
            />
          )}

          <button
            onClick={handleCount}>
            Next
          </button>
        </div>

        <Link to="/dashboard" className="level-close">
          <i className="fas fa-times fa-3x"></i>
        </Link>
      </div>
    </div>
  );
}

export default Level;
