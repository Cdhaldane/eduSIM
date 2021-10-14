import React from "react";
import { Link } from "react-router-dom";
import "./SimNote.css";
import { Image } from "cloudinary-react";

const SimNote = (props) => {

  return (
    <div className="notesim">
      <div className="notesim-thumbnail">
        <Image
          cloudName="uottawaedusim"
          publicId={
            "https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img
          }
          alt="backdrop"
        />
        <div className="notesim-name">
          <h1>{props.title}</h1>
        </div>
      </div>
      <div className="notesim-icons">
        <i
          id="garbage"
          className="fa fa-trash fa-2x notesim-icon"
          aria-hidden="true"
          onClick={() => props.setConfirmationModal(true, props.id)}
        ></i>
        <Link
          to={{
            pathname: "/editpage",
            img: props.img,
            title: props.title,
            gameinstance: props.gameid,
            adminid: props.adminid,
          }}
        >
          <i id="pencil" className="fa fa-pencil fa-2x notesim-icon" aria-hidden="true"></i>
        </Link>
        <Link
          to={{
            pathname: "/join",
            img: props.img,
            title: props.title,
            gameinstance: props.gameid,
            adminid: props.adminid,
          }}
        >
          <i
            id="play"
            className="fas fa-play-circle fa-2x notesim-icon"
            onClick={() => localStorage.setItem("gameid", props.gameid)}
          ></i>
        </Link>
      </div>
    </div>
  );
}

export default SimNote;
