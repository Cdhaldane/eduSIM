
import React from "react";
import {Link } from "react-router-dom";
import "./Note.css";

function Note(props) {
return (
  <Link to={props.url}>
  <button  className={props.class} type="button" alt="sim background" onClick={props.onClick} >
    <h1>{props.title}</h1>
    <img src={props.img}/>  
  </button>
  </Link>
);
}

export default Note;
