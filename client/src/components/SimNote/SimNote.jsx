import React from "react";
import { Link } from "react-router-dom";
import "./SimNote.css";
import axios from "axios";
import { Image } from "cloudinary-react";

function SimNote(props) {
  
  function handleClick() {
    if (window.confirm('Are you sure you wish to delete this simulation?')) {
      props.onDelete(props.id);

      let body = {
        id: props.gameid
      }

      axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/delete/:id', body).then((res) => {
        const allData = res.data;
        console.log(allData);
      }).catch(error => {
        console.log(error);
      });
    }
  }

  return (
    <div className="notesim">
      <h1><strong>{props.title}</strong></h1>
      <Image cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img} alt="backdrop" />
      <div id="simicons">
        <i id="garbage" className="fa fa-trash fa-2x" aria-hidden="true" onClick={handleClick}></i>
        <Link to={{
          pathname: "/editpage",
          img: props.img,
          title: props.title,
          gameinstance: props.gameid,
          adminid: props.adminid
        }}>
          <i id="pencil" className="fa fa-pencil fa-2x" aria-hidden="true"></i>
        </Link>
        <Link to={{
          pathname: "/join",
          img: props.img,
          title: props.title,
          gameinstance: props.gameid,
          adminid: props.adminid
        }}>
          <i id="play" className="fas fa-play-circle fa-2x" onClick={() => localStorage.setItem('gameid', props.gameid)}></i>
        </Link>
      </div>
    </div>
  );
}

export default SimNote;
