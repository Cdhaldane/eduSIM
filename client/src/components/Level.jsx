import React, { useState } from "react";

function Level() {
  const [count, setCount] = useState(1);
  return (
  <div className="gamepage">
      <img className= {"ball" + count}  src="ball.png" />
    <div className = "level">
      <img src="levelbar.png" />
        <div>
           <p>It's Day {count}! </p>
       {(count != 6)
         ? <button onClick={() => setCount(count + 1)}>Next</button>
         : <button onClick={() => setCount(1)}>Next</button>
       }
     </div>
    </div>
  </div>
  );
}

export default Level;

// <button onClick={() => setCount(count + 1)}>Next</button>
