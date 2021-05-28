import React from "react";
import {Link } from "react-router-dom";


function SimNote(props) {
  function handleClick() {
    {if (window.confirm('Are you sure you wish to delete this simulation?'))
      props.onDelete(props.id)
    }
  }

  return (
    <div className="notesim">
      <img src={props.img} />
      <h1><strong>{props.title}</strong></h1>
      <button onClick={handleClick}>DELETE</button>
    </div>
  );
}

export default SimNote;
