import React, { useState } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import SimNote from "../components/SimNote/SimNote";
import CreateArea from "../components/CreateArea/CreateArea";
import {Link } from "react-router-dom";


function Dashboard(props) {
  const [notes, setNotes] = useState([]);
  const [showNote, setShowNote] = useState(false);

  function addNote(newNote) {
    setNotes((prevNotes) => {
      return [...prevNotes, newNote];
    });
  }

  function deleteNote(id) {
    setNotes((prevNotes) => {
      return prevNotes.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  return (
    <div className="dashboard">
            <h1>Home</h1>
            <hr />
            <h2>New simulation</h2>
              <button  className="note" onClick={() => setShowNote(!showNote)} >
                      <div>
                      <h1>Setup an existing simulation</h1>
                    <img src="./plus.png"/>
                      </div>
              </button>
              {showNote && <div>
                <img className="bimg" src= "black.jpg" onClick={() => setShowNote(!showNote)} />
              <CreateArea onAdd={addNote} onDelete={() => setShowNote(!showNote)} />
              </div>}
              <Link to="/EditPage">
              <button  className="note" type="button" onClick="">
                <div>
                <h1>Create a custom simulation</h1>
                <img src="plus.png"/>
                </div>
              </button>
              </Link>
            <hr id="under_menu_line" />
            <div className="dashsim">
            <h2>My simulations ️</h2>

    {notes.map((noteItem, index) => {
      return (
        <SimNote className="notesim"
          key={index}
          id={index}
          title={noteItem.title}
          img={noteItem.img}
          onDelete={deleteNote}
        />
      );
    })}
    </div>
    </div>
  );
}

export default withAuth0(Dashboard);
