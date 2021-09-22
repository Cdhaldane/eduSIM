import React, { useEffect, useState } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import Tabs from "../components/Tabs/Tabs";
import CreateCsv from "../components/CreateCsv/CreateCsv";
import Modal from "react-modal";
import { Image } from "cloudinary-react";
import io from "socket.io-client";

function Join(props) {
  const [showNote, setShowNote] = useState(false);
  const [socket, setSocketInfo] = useState(null);

  if (props.location.gameinstance !== undefined) {
    localStorage.setItem('gameid', props.location.gameinstance);
  }

  if (props.location.title !== undefined) {
    localStorage.setItem('title', props.location.title);
  }

  if (props.location.img !== undefined) {
    localStorage.setItem('img', props.location.img);
  }

  function toggleModal() {
    setShowNote(!showNote);
  }

  useEffect(() => {
    (async function() {
      const client = await io(process.env.REACT_APP_API_ORIGIN, {
        auth: {
          token: localStorage.adminid
        }
      });
      setSocketInfo(client);
    }());
  }, []);
  
  const startSim = () => {
    if (!socket) return;
    socket.emit("gameStart", {
      game: localStorage.gameid
    });
  };

  const pauseSim = () => {
    if (!socket) return;
    socket.emit("gamePause", {
      game: localStorage.gameid
    });
  };

  return (
    <div className="dashboard">
      <div className="page-margin joinboard-header">
        <Image
          className="joinboard-image"
          cloudName="uottawaedusim"
          publicId={
            "https://res.cloudinary.com/uottawaedusim/image/upload/" +
            localStorage.img
          }
          alt="backdrop"
        />
        <div className="joinboard-info">
          <h2 className="joinboard-title">{localStorage.title}</h2>
          <button onClick={() => setShowNote(!showNote)} className="addbutton">
            Add Student/Participant List +
          </button>
        </div>
        <div className="joinboard-buttons">
          <button class="joinboard-button" onClick={startSim}>
            <i class="fa fa-play"></i>
          </button>
          <button class="joinboard-button" onClick={pauseSim}>
            <i class="fa fa-pause"></i>
          </button>
          <button class="joinboard-button">
            <i class="fa fa-retweet"></i>
          </button>
        </div>
      </div>
      <hr />
      <Modal
        isOpen={showNote}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="createmodaltab"
        overlayClassName="myoverlaytab"
        closeTimeoutMS={500}
        ariaHideApp={false}
      >
        <CreateCsv gameid={localStorage.gameid} isOpen={showNote} close={toggleModal} />
      </Modal>

      <Tabs gameid={localStorage.gameid} title={props.location.title} />
    </div>
  );
}

export default withAuth0(Join);
