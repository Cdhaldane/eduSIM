import React, { useState } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import DashboardItems from "./DashboardItems"
import Note from "../components/Note";
import simulationitems from "./Simulationitems"
import SimNote from "../components/SimNote";
import CreateArea from "./CreateArea";



function Dashboard() {
  const [notes, setNotes] = useState([]);

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
            {DashboardItems.map(createNote)}
            <hr id="under_menu_line" />
            <h2>My simulations ️</h2>
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => {
        return (
          <SimNote
            key={index}
            id={index}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={deleteNote}
          />
        );
      })}
    </div>
  );
}




function createNote(term){
  return (<Note
    key={term.id}
    title={term.title}
    url={term.url}
    img={term.img}
    class={term.class}
  />
);
}
//
// function createSimNote(term){
//   return (<SimNote
//     key={term.id}
//     title={term.title}
//     url={term.url}
//     img={term.img}
//     class={term.class}
//     onDelete={deleteNote}
//   />
// );
// }
//
//
// function deleteNote(id) {
//   const [notes, setNotes] = useState([]);
//     setNotes(prevNotes => {
//       return prevNotes.filter((noteItem, index) => {
//         return index !== id;
//       });
//     });
//   }
//
// function Dashboard(props){
//     return (
//       <div className="dashboard">
//         <h1>Home</h1>
//         <hr />
//         <h2>New simulation</h2>
//         {DashboardItems.map(createNote)}
//         <hr id="under_menu_line" />
//         <h2>My simulations ️</h2>
//         {simulationitems.map(createSimNote)}
//         <button  id="garbage" className="garbage" type="button" >
//           <div>
//           <img src="garbage.png"/>
//           </div>
//         </button>
//       </div>
//     );
//   }
//
export default withAuth0(Dashboard);

/*<HomeContent />*/
