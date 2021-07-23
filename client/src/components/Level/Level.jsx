import React, { useState } from "react";
import "./Level.css"

function Level(props) {
  const [count, setCount] = useState(1);
  let items = [];

  function handleLevel(e){
    props.level(e);
  }

  function handleCount(){
    if(count > props.number -1){
      setCount(1)
      handleLevel(1)
    } else {
      setCount(count + 1)
      handleLevel(count + 1)
    }
  }

  function handleCount2(){
      handleLevel(count + 1)
  }

  function createSelectItems() {

    for (let i = 1; i <=  props.number ; i++) {
         items.push(<option value={i}>{props.ptype} {i}</option>);
         //here I will be creating my options dynamically based on
         //what props are currently passed to the parent component
    }
    return items;
}

  function handleChange(event){
    setCount(parseInt(event.target.value))
    handleLevel(parseInt(event.target.value))
  }

  return (
  <div id="all">
      <img className= {"ball" + count}  src={"ball.png"} alt="level counter"/>
    <div className = "level">
      <img id={"img" + props.number} src={"levelbar.png"} />
    <p>It's {props.ptype} {count}! </p>
  <button onClick={handleCount}>Next</button>
       <select id="levels" onChange={handleChange}>
         {createSelectItems()}
       </select>
    </div>
  </div>
  );
}

export default Level;
