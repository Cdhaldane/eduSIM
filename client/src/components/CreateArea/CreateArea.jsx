import React, { useState } from "react";
import {ImageItems} from "./ImageItems";
import "./CreateArea.css";

function CreateArea(props) {
  const [note, setNote,] = useState(0);
  const [showNote, setShowNote] = useState(false);

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

  return (
      <div className="area">
      <form >
        <p>
        Set up a simulation by entering a name and either selecting a display image
        from the ones listed or choose your own!
        </p>
        <input
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Simulation Name..."
        />
        <br />
        <input
          type="file"
          name="img"
          id="file"
          onChange={onChange}
          />
        <label for="file">Choose an image...</label>
        {/* {ImageItems.map((item,index) =>{
          return (
            <ul class="flex-container">
              <li class={item.cName}>
                <img src={item.img} />
            </li>
            </ul>
          )
        })} */}
      
      <h3>
        Press off to exit.
      </h3>
        <button onClick={submitNote}>Add</button>
      </form>
    </div>

);
}

export default CreateArea;
