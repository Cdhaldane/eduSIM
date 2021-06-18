import React, { useState } from "react";
import "./Level.css"

function Level(props) {
  const [count, setCount] = useState(1);
  return (
  <div>
      <img className= {"ball" + count}  src={"ball.png"} alt="level counter"/>
    <div className = "level">
      <img id={"img" + props.number} src={"levelbar.png"} />
      <p>It's day {count}! </p>

         {(count !== props.number)
         ? <button onClick={() => setCount(count + 1)}>Next</button>
         : <button onClick={() => setCount(1)}>Next</button>
       }
       <select id="levels">
         <option value="pg1">Page 1</option>
         <option value="pg2">Page 2</option>
         <option value="pg3">Page 3</option>
         <option value="pg4">Page 4</option>
       </select>
    </div>
  </div>
  );
}

export default Level;
