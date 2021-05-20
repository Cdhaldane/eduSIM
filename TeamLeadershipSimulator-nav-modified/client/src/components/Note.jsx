import React from "react";
import {Link } from "react-router-dom";






function Note(props) {
  return (
    <Link to={props.url}>
    <button className={props.class} onClick="location.href={props.url}" type="button" style={{ backgroundImage: `url(${props.backimg})` }}>
    <div>
      <h1>{props.title}</h1>
      <img src={props.img}/>
      </div>
    </button>
    </Link>
  );
}

export default Note;
