import React, { useEffect, useState, useMemo } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import Tabs from "../components/Tabs/Tabs";
import CreateCsv from "../components/CreateCsv/CreateCsv";
import { useAlertContext } from "../components/Alerts/AlertContext";
import Modal from "react-modal";
import { Image } from "cloudinary-react";
import io from "socket.io-client";
import moment from "moment";
import AutoUpdate from "../components/AutoUpdate";

function Join(props) {
  const [showNote, setShowNote] = useState(false);
  const [socket, setSocketInfo] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomStatus, setRoomStatus] = useState({});
  const [roomMessages, setRoomMessages] = useState({});
  const alertContext = useAlertContext();

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
    (async function () {
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
          [data.room]: [...messages[data.room] || [], { sender: data.sender, message: data.message }]
        }));
      });
      client.on("errorLog", (message) => {
        alertContext.showAlert(message, "error");
      });
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

  const resetSim = async () => {
    if (!socket) return;
    await socket.emit("gameReset", (currentRoom && {
      room: currentRoom[2]
    }));
  };

  const timeFromNow = () => {
    return currentRoomStatus?.startTime && moment(
      moment(moment()).diff(currentRoomStatus.startTime - (currentRoomStatus.timeElapsed || 0))
    ).format("mm:ss");
  };

  const handleNextPage = (room) => {
    if (!socket) return;
    socket.emit("goToNextPage", (currentRoom && {
      room: currentRoom[2]
    }));
  };

  const advanceMode = Object.keys(roomStatus).length > 0 ? roomStatus[Object.keys(roomStatus)[0]].settings?.advanceMode : null

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
          <div>
            {currentRoom ? (
              <>
                <p>{currentRoom[0]}</p>
                <p>
                  {advanceMode === "teacher" && `Page ${currentRoomStatus.level || 1}, `}
                  <AutoUpdate
                    value={(currentRoomStatus.running
                      ? timeFromNow
                      : () => moment(currentRoomStatus.timeElapsed || 0).format("mm:ss")
                    )}
                    intervalTime={20}
                    enabled
                  />
                  {(currentRoomStatus.running == true ? '' : (
                    currentRoomStatus.running === false ? ' (paused)' : ' (stopped)'
                  ))}
                </p>
              </>
            ) : (
              <p>All rooms</p>
            )}
            <div className="joinboard-buttons">
              <button
                class={`joinboard-button ${currentRoom && currentRoomStatus.running ? ' joinboard-disabled' : undefined}`}
                onClick={startSim}
                title={currentRoom ? "Start this simulation" : "Start all simulations"}
              >
                <i class="fa fa-play"></i>
              </button>
              <button
                class={`joinboard-button ${currentRoom && !currentRoomStatus.running ? ' joinboard-disabled' : undefined}`}
                onClick={pauseSim}
                title={currentRoom ? "Pause this simulation" : "Pause all simulations"}
              >
                <i class="fa fa-pause"></i>
              </button>
              <button
                class="joinboard-button"
                onClick={resetSim}
                title={currentRoom ? "Reset this simulation" : "Reset all simulations"}
              >
                <i class="fa fa-retweet"></i>
              </button>
              {advanceMode === "teacher" && (
                <button
                  class={`joinboard-button ${currentRoom && !currentRoomStatus.running ? ' joinboard-disabled' : undefined}`}
                  onClick={handleNextPage}
                  title={currentRoom ? "Advance this simulation by one page" : "Advance all simulations by one page"}
                >
                  <i class="fa fa-angle-double-right"></i>
                </button>
              )}
            </div>
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

      <Tabs
        gameid={localStorage.gameid}
        title={localStorage.title}
        setRoom={setCurrentRoom}
        chatMessages={currentRoomMessages}
        socket={socket}
        roomStatus={roomStatus}
      />
    </div>
  );
}

export default withAuth0(Join);
