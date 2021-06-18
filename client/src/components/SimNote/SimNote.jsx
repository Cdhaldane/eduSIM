import React from "react";
import {Link } from "react-router-dom";
import "./SimNote.css";
import axios from "axios";

function SimNote(props) {
  function handleClick() {
    {if (window.confirm('Are you sure you wish to delete this simulation?'))
      props.onDelete(props.id)
      axios.delete('http://localhost:5000/gameinstances/delete/:id',{
        params: {
              id: props.gameid
          }
      })
      .then((res) => {
        const allData = res.data;
        console.log(allData);
      })
      .catch(error => console.log(error.response));
    }
  }

  return (
    <div className="notesim">
      <h1><strong>{props.title}</strong></h1>
      <img src={props.img} alt="backdrop"/>
      <i id="garbage" class="fa fa-trash fa-2x" aria-hidden="true" onClick={handleClick}></i>
      <Link to="/EditPage">
        <i id="pencil" class="fa fa-pencil fa-2x" aria-hidden="true"></i>
      </Link>
      <Link to="/gamepage">
        <i id="play" class="fas fa-play-circle fa-2x"></i>
      </Link>
    </div>
  );
}

export default SimNote;
