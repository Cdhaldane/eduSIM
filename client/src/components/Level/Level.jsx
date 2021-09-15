import React, { useState } from "react";
import "./Level.css"
import { times } from "lodash";
import { Link } from "react-router-dom";

function Level(props) {
  const [count, setCount] = useState(1);
  let items = [];

  function handleLevel(e) {
    props.level(e);
  }
  function handleCount() {
    if (count > props.number - 1) {
      setCount(1)
      handleLevel(1)
    } else {
      setCount(count + 1)
      handleLevel(count + 1)
    }
  }
  function createSelectItems() {
    for (let i = 1; i <= props.number; i++) {
      items.push(<option value={i}>{props.ptype} {i}</option>);
      //here I will be creating my options dynamically based on
      //what props are currently passed to the parent component
    }
    return items;
  }
  function handleChange(event) {
    setCount(parseInt(event.target.value))
    handleLevel(parseInt(event.target.value))
  }

  return (
    <div id="all">
      <div className={`level ${props.gamepage ? 'level-gamepage' : ''}`}>
        {!props.gamepage && <h1>Edit Mode</h1>}
        <div className="level-nav">
          <select className="level-select" onChange={handleChange} value={count}>
            {createSelectItems()}
          </select>
          
          <div className="level-bar">
              {times(props.number, (num) => ( // dynamically scaling level bar
                <div className="level-bar-section">
                  <div className={`level-bar-node ${num+1 == count ? "level-bar-node-active" : ""}`}/>
                  {num!=props.number-1 && (<div className="level-bar-line"/>)}
                </div>
              ))}
          </div>
          {/* <p>It's {props.ptype} {count}! </p> */}
          <button onClick={handleCount}>Next</button>
        </div>
        <Link to="/dashboard" className="level-close">
          <i class="fas fa-times fa-3x"></i>
        </Link>
      </div>
    </div>
  );
}

export default Level;
