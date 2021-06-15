import React, { useState } from "react";
import Switch from "react-switch"
import {Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios"
import "./CreateArea.css";

const api = axios.create({
  baseURL: "http://localhost:4000/gameinstance/createGameInstance"
})

const options = [
  {
    label: "Apple",
    value: "apple",
  },
  {
    label: "Mango",
    value: "mango",
  },
  {
    label: "Banana",
    value: "banana",
  },
  {
    label: "Pineapple",
    value: "pineapple",
  },
];

  function CreateArea(props) {
    const [save, setSave] = useState("");
    const [note, setNote,] = useState([]);
    const [showNote, setShowNote] = useState(false);
    const [img, setImg] = useState();
    const [title, setTitle] = useState();
    const [checked, setChecked] = useState(false);
    const [state, setState] = useState("");
    // sets all const


  function onCreateGame(){
    let gameinstance={
      gameinstanceid: this.refs.gameinstanceid.value
    };

    fetch("http://localhost:4000/gameinstance/createGameInstance",{
      method:"POST",
      headers:{"Content-type" : "application/json"},
      body:JSON.stringify(gameinstance)
    }).then(r=>r.json()).then(res=>{
      if(res){
        setState("Added game");
      }
    })
  }

  //adds note to dahsboard by setting notes and sending to app
  function submitNote(event) {
    event.preventDefault();
    props.onAdd(note);
    props.onDelete(showNote);
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

  //handles switch overlay
  function handleSwitch(checked) {
      setChecked(!checked);
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
          {options.map(options =>
            <option value={options.value}>{options.label}</option>
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
        <p>{state.message}</p>
    </div>
  );
}

export default CreateArea;
