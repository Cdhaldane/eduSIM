import React, { useState } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import DashboardItems from "./DashboardItems"
import Note from "../components/Note";
import simulationitems from "./Simulationitems"
import SimNote from "../components/SimNote";
import CreateArea from "../components/CreateArea";
import Footer from "../components/Footer";


function Dashboard() {
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
                      <img src="plus.png"/>
                      </div>
              </button>
              {showNote && <div>
                <img className="bimg" src= "modalback.jpg" onClick={() => setShowNote(!showNote)} />
                <CreateArea onAdd={addNote} />
              </div>}
              <button  className="note" type="button" onClick="" >
                <div>
                <h1>Create a custom simulation</h1>
                <img src="plus.png"/>
                </div>
              </button>
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
