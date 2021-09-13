import React from "react";
import {Link } from "react-router-dom";
import "./SimNote.css";
import axios from "axios";
import {Image} from "cloudinary-react";

function SimNote(props) {
  console.log(props)
  function handleClick() {
    console.log(props.gameid)
    if (window.confirm('Are you sure you wish to delete this simulation?')){
      props.onDelete(props.id)
      console.log(props.gameid)
      var body = {
        id: props.gameid
      }
      axios.put(process.env.REACT_APP_API_ORIGIN+'/api/gameinstances/delete/:id', body)
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
      <Image cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img}  alt="backdrop"/>
      <div id="simicons">
      <i id="garbage" class="fa fa-trash fa-2x" aria-hidden="true" onClick={handleClick}></i>
    <Link to={{
        pathname:"/editpage",
        img: props.img,
        title: props.title,
        gameinstance: props.gameid,
        adminid: props.adminid
      }}>
        <i id="pencil" class="fa fa-pencil fa-2x" aria-hidden="true"></i>
      </Link>
        <Link to={{
        pathname:"/join",
        img: props.img,
        title: props.title,
        gameinstance: props.gameid,
        adminid: props.adminid
        }}>
        <i id="play" class="fas fa-play-circle fa-2x" onClick={() => localStorage.setItem('gameid', props.gameid)}></i>
      </Link>
    </div>
    </div>
  );
}

export default SimNote;
