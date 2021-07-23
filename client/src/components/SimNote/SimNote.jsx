import React from "react";
import {Link } from "react-router-dom";
import "./SimNote.css";
import axios from "axios";
import ImageLoader from 'react-image-file';
import {Image} from "cloudinary-react";

function SimNote(props) {
  console.log("https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img + ".jpg")
  function handleClick() {
    console.log(props.gameid)
    {if (window.confirm('Are you sure you wish to delete this simulation?'))
      props.onDelete(props.id)
      console.log(props.gameid)
      let data = {
        id: props.gameid
      }
      axios.put('http://localhost:5000/gameinstances/delete/:id', data)
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
      <Link to="/gamepage" >
        <i id="play" class="fas fa-play-circle fa-2x"></i>
      </Link>
    </div>
  );
}

export default SimNote;
