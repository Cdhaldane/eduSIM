
import React from "react";
import { Link } from "react-router-dom";
import "./Note.css";

function Note(props) {
  return (
    props.onClick ? (
      <button className={props.class} type="button" alt="sim background" onClick={props.onClick} >
        <h1>{props.title}</h1>
        <img src={props.img} alt="note background"/>  
      </button>
    ) : (
      <Link to={props.url} className={props.class} >
        <h1>{props.title}</h1>
        <img src={props.img} alt="note background"/>  
      </Link>
    )
  );
}

export default Note;
