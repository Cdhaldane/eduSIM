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
        <div>
         {(count !== props.number)
         ? <button onClick={() => setCount(count + 1)}>Next</button>
         : <button onClick={() => setCount(1)}>Next</button>
       }
     </div>
    </div>
  </div>
  );
}

export default Level;
