import React, { useEffect, useState } from "react";
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
    // setCount(count + 1);
    handleLevel(count + 1);
  }
  
  const handleBack = () => {
    if (count > 0) handleLevel(count - 1);
  }

  useEffect(() => {
    if (props.levelVal) {
      setCount(props.levelVal);
    }
  }, [props.levelVal]);

  const createSelectItems = () => {
    // Replace empty names with Untitled#
    let pageNames = [...props.pages];
    let untitledNum = 1;
    for (let i = 0; i < pageNames.length; i++) {
      if (pageNames[i] === "") {
        pageNames[i] = "Untitled " + untitledNum;
        untitledNum++;
      }
    }
    for (let i = 0; i < props.number; i++) {
      items.push(
        <option key={i} value={i + 1}>
          {pageNames[i]}
        </option>
      );
    }
    return items;
  }

  const handleChange = (event) => {
    setCount(parseInt(event.target.value));
    handleLevel(parseInt(event.target.value));
  }

  const saveOnClose = () => {
    props.saveGame();
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
              pages={props.pages}
              handlePageTitle={props.handlePageTitle}
              handlePageNum={props.handlePageNum}
              numOfPages={props.numOfPages}
            />
          )}

          {props.freeAdvance && (
            <>
              <button
                onClick={handleBack}>
                Back
              </button>
              <button
                onClick={handleCount}>
                Next
              </button>
            </>
          )}
        </div>

        {!props.gamepage && (
          <Link onClick={saveOnClose} to="/dashboard" className="level-close">
            <i className="fas fa-times fa-3x"></i>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Level;
