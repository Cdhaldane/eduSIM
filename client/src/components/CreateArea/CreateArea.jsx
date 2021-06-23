import React, { useState } from "react";
import Switch from "react-switch"
import {Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios"
import "./CreateArea.css";

  function CreateArea(props) {
    const [save, setSave] = useState("");
    const [note, setNote,] = useState([]);
    const [showNote, setShowNote] = useState(false);
    const [img, setImg] = useState();
    const [title, setTitle] = useState();
    const [checked, setChecked] = useState(false);
    const [state, setState] = useState("");
    const [gamedata, getGamedata] = useState([]);
    const [value, setValue] = React.useState(
    localStorage.getItem('adminid') || ''
  );
  // sets all const


  //adds note to dahsboard by setting notes and sending to app
  function submitNote(event) {
    event.preventDefault();
    props.onDelete(showNote);
    let data = {
      gameinstance_name: title,
      gameinstance_photo_path: 'temp.png',
      game_parameters: {
        "status": "created"
      },
      createdby_adminid: localStorage.adminid,
      invite_url: 'value'
    }
      axios.post('http://localhost:5000/gameinstances/createGameInstance', data)
         .then((res) => {
            console.log(res)
           })
          .catch(error => console.log(error.response));
         console.log(data);
      props.onAdd(note);
      // window.location.reload();
  }

  function setNotes(event) {
   setNote({
     title: title,
     img: img
   });
   event.preventDefault();
 }

  //handles selection of img from file
  function onChange(event){
    setNote({
      title: title,
      img: URL.createObjectURL(event.target.files[0])
    });
  }

  //handle input and adds title and img to notes array
  function handleChange(event) {
    setTitle(event.target.value);
  }

  //handles showing of img overlay
  function handleImg(event){
     event.preventDefault();
     setImg(!img)
  }

  return (
      <div class="area" >
        <Container>
      <form>
        <p class="gradient-border" id="box">
        Add New Simulation
        </p>
        <label for="Game">Choose a game</label>
        <select id="games">
          <option value="Team Leadership">Team Leadership</option>
          <option value="Project Management">Project Management</option>
          <option value="">...</option>
          <option value="blank">Create a blank simulation</option>
        </select>
        <p class="gradient-border" id="box1">
          Duplicate a previous simulation
          <label id="switch">
          <Switch
            onChange={() => setChecked(!checked)}
            checked={checked}
            className="react-switch"
          />
        </label>
        </p>

        {checked && <div>
        <label for="PrevGame" id="prevgame">Select a previous simulation</label>
        <select id="prevgames">
          {gamedata.map(gamedata =>
            <option value={gamedata.gameinstanceid}>{gamedata.gameinstance_name}</option>
          )};
        </select>
          </div>}

          <p class="gradient-border" id="box3">
            Enter a ‎name‎‏‏‎ ‎
          <input
            tpye="text"
            id="namei"
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="                         "
          />
          </p>

        <p class="gradient-border" id="box2" >
        Choose an image
        <img id="plus" src="plus.png" onClick={handleImg}/>

        {(note.img)
        ?<img id="preview" src={note.img} />
        :<img id="previewno" src={note.img} />
        }
        </p>
        <p>
        <button id="add" onClick={submitNote}>Add</button>
        </p>
        </form>

        {img && <div>
          <form id="imgs">
            <p id="box4" >
              <img src="temp.png" onClick={() => setNote({title:title, img:"temp.png"})}/>
              <img src="temp1.png" onClick={() => setNote({title:title, img:"temp1.png"})}/>
              <img src="temp.png" onClick={() => setNote({title:title, img:"temp.png"})}/>
              <img src="temp1.png" onClick={() => setNote({title:title, img:"temp1.png"})}/>
              <img src="temp.png" onClick={() => setNote({title:title, img:"temp.png"})}/>
              <img src="temp1.png" onClick={() => setNote({title:title, img:"temp1.png"})}/>
              <input
                 type="file"
                 name="img"
                 id="file"
                 onChange={onChange}
                 />
               <label for="file">From file</label>
            </p>
          </form>
          </div>
        }
        </Container>
    </div>
  );
}

export default CreateArea;
