import React, { useState } from "react";
import {ImageItems} from "./ImageItems";
import Switch from "react-switch"
import {Link } from "react-router-dom";
import DropdownMenu from "../DropDown/Dropdown";
import "./CreateArea.css";


function CreateArea(props) {
  const [save, setSave] = useState("");
  const [note, setNote,] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [checked, setChecked] = useState(false);


  function handleChange(event) {
    const { name, value } = event.target;
    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value,
      };
    });
  }

  function submitNote(event) {
    props.onAdd(note);
    props.onDelete(showNote);
    setNote({
      title: "",
      img: ""
    });
    setShowNote(!showNote);

    event.preventDefault();
  }

  function onChange(event){
    const { name, value } = event.target;
    if (event.target.files && event.target.files[0]) {
      setNote({
      img: URL.createObjectURL(event.target.files[0])
    });
    }
  }

  function showNotes(event){
    props.onDelete(showNote);
    setShowNote(!showNote);
    event.preventDefault();
  }

  function handleClick(event){
     event.preventDefault();
     setShowSim(!showSim)
  }

  function handleSwitch(checked) {
      setChecked(!checked);
}

  return (
      <div class="area" >
      <form>
        <p class="gradient-border" id="box">
        Add New Simulation
        </p>
        <label for="Game">Choose a game</label>
        <select name="cars" id="cars">
          <option value="volvo">Bing</option>
          <option value="saab">Bong</option>
          <option value="mercedes">Bing</option>
          <option value="audi">Bong</option>
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
        <select name="cars" id="prevgames">
          <option value="volvo">Bing</option>
          <option value="saab">Bong</option>
          <option value="mercedes">Bing</option>
          <option value="audi">Bong</option>
        </select>
          </div>}

        <p class="gradient-border" id="box2">
        <input
          type="file"
          name="img"
          id="file"
          onChange={onChange}
          />
        <label id="file" for="file">Choose an image...</label>
        <img id="preview" src={note.img} />
        </p>

        <p class="gradient-border" id="box3">
        <input
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Simulation Name..."
        />
        </p>
        <p>
        <button class="gradient-border" id="add" onClick={submitNote}>Add</button>
        </p>
        </form>
    </div>
  );
}

export default CreateArea;

// <input
//   name="title"
//   onChange={handleChange}
//   value={note.title}
//   placeholder="Simulation Name..."
// />
// <br />
// <input
//   type="file"
//   name="img"
//   id="file"
//   onChange={onChange}
//   />
// <label for="file">Choose an image...</label>
//
// <button id="para" onClick={handleClick}>Parameters ↓</button>
// <button id="sims" onClick={handleClick}>Existing sims ↓</button>
//
//
// {showSim && <div>
//      <DropdownMenu/>
//
//     </div>}
// <h3>
//   Press off to exit.
// </h3>
// </form>
// <button id="add" onClick={submitNote}>Add</button>
// <Link to="/EditPage"><button id="edit" onClick="">Edit</button></Link>
