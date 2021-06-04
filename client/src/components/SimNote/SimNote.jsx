import React from "react";
import "./SimNote.css";

function SimNote(props) {
  function handleClick() {
    {if (window.confirm('Are you sure you wish to delete this simulation?'))
      props.onDelete(props.id)
    }
  }

  return (
    <div className="notesim">
      <img src={props.img} alt="backdrop"/>
      <h1><strong>{props.title}</strong></h1>
      <button onClick={handleClick}>DELETE</button>
    </div>
  );
}

export default SimNote;
