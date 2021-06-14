import React, { useState } from "react";
import Switch from "react-switch"
import {Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./CreateArea.css";


  function CreateArea(props) {
    const [save, setSave] = useState("");
    const [note, setNote,] = useState([]);
    const [showNote, setShowNote] = useState(false);
    const [img, setImg] = useState(false);
    const [checked, setChecked] = useState(false);
    // sets all const


  //handle input and adds title and img to notes array
  function handleChange(event) {
    const { name, value } = event.target;
    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value,
      };
    });
  }

  //adds note to dahsboard by setting notes and sending to app
  function submitNote(event) {
    props.onAdd(note);
    props.onDelete(showNote);
    setNote({
      img: "",
      title: ""
    });
  }

  //handles selection of img from file
  function onChange(event){
    const { name, value } = event.target;
    if (event.target.files && event.target.files[0]) {
      setNote({
      img: URL.createObjectURL(event.target.files[0])
    });
    }
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
          <option value=""></option>
          <option value="">Bong</option>
          <option value="">Bing</option>
          <option value="">Bong</option>
        </select>
          </div>}

          <p class="gradient-border" id="box3">
            Enter a ‎name‎‏‏‎ ‎
          <input
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
              <img src="temp.png" onClick={() => setNote({img:"temp.png"})}/>
              <img src="temp1.png" onClick={() => setNote({img:"temp1.png"})}/>
              <img src="temp.png" onClick={() => setNote({img:"temp.png"})}/>
              <img src="temp1.png" onClick={() => setNote({img:"temp1.png"})}/>
              <img src="temp.png" onClick={() => setNote({img:"temp.png"})}/>
              <img src="temp1.png" onClick={() => setNote({img:"temp1.png"})}/>
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
