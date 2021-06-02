import React, { useState } from "react";
import "./Level.css"

function Level() {
  const [count, setCount] = useState(1);
  return (
  <div>
      <img className= {"ball" + count}  src="ball.png" alt="level counter"/>
    <div className = "level">
      <img src="levelbar.png" />
      <p>It's day {count}! </p>
        <div>
         {(count !== 6)
         ? <button onClick={() => setCount(count + 1)}>Next</button>
         : <button onClick={() => setCount(1)}>Next</button>
       }
     </div>
    </div>
  </div>
  );
}

export default Level;
