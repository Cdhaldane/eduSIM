import React, { useState, useEffect } from "react";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import SimNote from "../components/SimNote/SimNote";
import CreateArea from "../components/CreateArea/CreateArea";
import axios from "axios";
import {Link } from "react-router-dom";


function Dashboard(props) {
  const { user } = useAuth0();
  const [notes, setNotes] = useState([]);
  const [showNote, setShowNote] = useState(false);
  const [gamedata, getGamedata] = useState([]);
  const [login, setLogin] = useState([]);
  const allData = "";
  const [value, setValue] = React.useState(
  localStorage.getItem('adminid') || ''
);

  useEffect(() => {
     getAllGamedata();
   }, []);

  const getAllGamedata = () => {
    axios.get('http://localhost:5000/api/adminaccounts/getAdminbyEmail/:email/:name', {
      params: {
            email: user.email,
            name: user.name
        }
    })
    .then((res) => {
      const allData = res.data;
      console.log(allData);
      setLogin(allData.adminid);

      localStorage.setItem('adminid', allData.adminid)
      console.log(localStorage)
    })
    .catch(error => console.log(error.response));
    axios.get('http://localhost:5000/api/gameinstances/getGameInstances/',
    {
      params: {
            id: value
        }
    })
    .then((res) => {
    const allData = res.data;
    console.log(allData);
    getGamedata(allData);
    })
    .catch(error => console.log(error.response));
}

  function addNote(newgamedata) {
         getGamedata((prevgamedata) => {
          return [...prevgamedata, newgamedata];
        });
       }

  function deleteNote(id) {
    getGamedata((prevgamedata) => {
      return prevgamedata.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  console.log(gamedata)

  return (
    <div className="dashboard">
            <h1>Home</h1>
          <a id="new" onClick={() => setShowNote(!showNote)}>Add a new simulation +</a>
            <hr />
          {showNote && <div className="dashboard">
              <img className="bimg" src= "black.jpg" onClick={() => setShowNote(!showNote)} />
              <CreateArea onAdd={addNote} onDelete={() => setShowNote(!showNote)} gamedata={gamedata} />
          </div>
          }
            <div className="dashsim">
            <h2>My simulations ️</h2>
            {gamedata.map((noteItem, index) => {

          return (
            <SimNote className="notesim"
             key={index}
             id={index}
             gameid={noteItem.gameinstanceid}
             img={noteItem.gameinstance_photo_path}
             adminid={noteItem.createdby_adminid}
             onDelete={deleteNote}
             title={noteItem.gameinstance_name}
            />
          );
    })}
    </div>

    </div>
  );
}

export default withAuth0(Dashboard);
