import React, { useState } from "react";
import "./Level.css"

function Level(props) {
  const [count, setCount] = useState(1);
  let items = [];
  console.log(props)

  function createSelectItems() {

    for (let i = 1; i <=  props.number ; i++) {
         items.push(<option>{props.ptype} {i}</option>);
         //here I will be creating my options dynamically based on
         //what props are currently passed to the parent component
    }
    return items;
    console.log(items);
}

  return (
  <div id="all">
      <img className= {"ball" + count}  src={"ball.png"} alt="level counter"/>
    <div className = "level">
      <img id={"img" + props.number} src={"levelbar.png"} />
    <p>It's {props.ptype} {count}! </p>

         {(count > props.number -1 )
         ? <button onClick={() => setCount(1)}>Next</button>
         : <button onClick={() => setCount(count + 1)}>Next</button>

       }
       <select id="levels">
         {createSelectItems()}
       </select>
    </div>
  </div>
  );
}

export default Level;
