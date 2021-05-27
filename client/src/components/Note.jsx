import React from "react";
import {Link } from "react-router-dom";

function Note(props) {
  return (
    <Link to={props.url}>
    <button  className={props.class} type="button" onClick={props.onClick} >
      <div>
      <h1>{props.title}</h1>
      <img src={props.img}/>
      </div>
    </button>
    </Link>
  );
}

export default Note;
