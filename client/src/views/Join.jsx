import React, { useEffect, useState, useMemo } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import Tabs from "../components/Tabs/Tabs";
import CreateCsv from "../components/CreateCsv/CreateCsv";
import Modal from "react-modal";
import { Image } from "cloudinary-react";
import io from "socket.io-client";

function Join(props) {
  const [showNote, setShowNote] = useState(false);
  const [socket, setSocketInfo] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomStatus, setRoomStatus] = useState({});
  const [roomMessages, setRoomMessages] = useState({});

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
        },
        query: {
          game: localStorage.gameid
        }
      });
      client.on("roomStatusUpdate", (data) => {
        setRoomStatus((rooms) => ({
          ...rooms,
          [data.room]: data.status
        }));
      });
      client.on("message", (data) => {
        setRoomMessages((messages) => ({
          ...messages,
          [data.room]: [ ...messages[data.room] || [], { sender: data.sender, message: data.message } ]
        }));
      })
      setSocketInfo(client);
      return () => client.disconnect();
    }());
  }, []);

  const currentRoomStatus = useMemo(() => {
    if (currentRoom) {
      return roomStatus[currentRoom[2]] || {};
    } return {};
  }, [roomStatus, currentRoom]);

  const currentRoomMessages = useMemo(() => {
    if (currentRoom) {
      return roomMessages[currentRoom[2]] || [];
    } return [];
  }, [roomMessages, currentRoom]);
  
  const startSim = async () => {
    if (!socket) return;
    await socket.emit("gameStart", (currentRoom && {
      room: currentRoom[2]
    }));
  };

  const pauseSim = async () => {
    if (!socket) return;
    await socket.emit("gamePause", (currentRoom && {
      room: currentRoom[2]
    }));
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
        <div className="joinboard-controls">
          <p>{currentRoom ? (currentRoom[0] + (currentRoomStatus.running ? ' (running)' : '')) : "All rooms"}</p>
          <div className="joinboard-buttons">
            <button class={`joinboard-button ${currentRoom && currentRoomStatus.running && ' joinboard-disabled'}`} onClick={startSim}>
              <i class="fa fa-play"></i>
            </button>
            <button class={`joinboard-button ${currentRoom && !currentRoomStatus.running && ' joinboard-disabled'}`} onClick={pauseSim}>
              <i class="fa fa-pause"></i>
            </button>
            <button class="joinboard-button">
              <i class="fa fa-retweet"></i>
            </button>
          </div>
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

      <Tabs gameid={localStorage.gameid} title={props.location.title} setRoom={setCurrentRoom} chatMessages={currentRoomMessages} />
    </div>
  );
}

export default withAuth0(Join);
