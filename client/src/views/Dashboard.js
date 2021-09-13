import React, { useState, useEffect } from "react";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import SimNote from "../components/SimNote/SimNote";
import CreateArea from "../components/CreateArea/CreateArea";
import Modal from "react-modal";
import axios from "axios";

function Dashboard(props) {
  const { user } = useAuth0();
  const [showNote, setShowNote] = useState(false);
  const [gamedata, getGamedata] = useState([]);

  useEffect(() => {
    const getAllGamedata = async () => {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/getAdminbyEmail/:email/:name', {
        params: {
          email: user.email,
          name: user.name
        }
      })
        .then((res) => {
          const allData = res.data;
          localStorage.setItem('adminid', allData.adminid)
          axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstances/',
            {
              params: {
                id: allData.adminid
              }
            })
            .then((res) => {
              const allData = res.data;
              console.log(allData);
              getGamedata(allData);
            })
            .catch(error => console.log(error.response));
        })
        .catch(error => console.log(error.response));
    }
    getAllGamedata();
  }, [user]);



  function addNote(newgamedata) {
    console.log("added")
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

  function toggleModal(e) {
    e.preventDefault();
    setShowNote(!showNote);
  }


  return (
    <div className="dashboard">
      <h1>Home</h1>
      <button id="new" onClick={() => setShowNote(!showNote)}>Add a new simulation +</button>
      <hr />
      <Modal
        isOpen={showNote}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="createmodalarea"
        overlayClassName="myoverlay"
        closeTimeoutMS={500}
      >
        <CreateArea onAdd={addNote} onDelete={() => setShowNote(!showNote)} gamedata={gamedata} isOpen={showNote} />
      </Modal>

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
