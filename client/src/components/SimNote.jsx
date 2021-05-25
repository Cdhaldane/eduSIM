import React from "react";
import {Link } from "react-router-dom";


function SimNote(props) {
  function handleClick() {
    props.onDelete(props.id);

  }

  return (
    <div className="notesim">
      <img src="temp.png" />
      <h1><strong>{props.title}</strong></h1>
      <button onClick={handleClick}>DELETE</button>
    </div>
  );
}

export default SimNote;





//
// function SimNote(props) {
//   function handleClick(){
//     props.onDelete();
//   }
//   return (
//
//     <Link to={props.url}>
//     <button className={props.class} type="button" >
//       <div>
//       <h1>{props.title}</h1>
//       <img src={props.img}/>
//       <button className="delete" >
//         <img src="delete.png" onClick={handleClick}/>
//       </button>
//       </div>
//
//     </button>
//     </Link>
//
//
//   );
// }

// export default SimNote;
