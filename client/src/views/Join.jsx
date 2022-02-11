import React, { useEffect, useState, useMemo } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import Tabs from "../components/Tabs/Tabs";
import CreateCsv from "../components/CreateCsv/CreateCsv";
import { useAlertContext } from "../components/Alerts/AlertContext";
import Modal from "react-modal";
import { Image } from "cloudinary-react";
import { io } from "socket.io-client";
import moment from "moment";
import AutoUpdate from "../components/AutoUpdate";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import CreateEdit from "../components/CreateEdit/CreateEdit";

const Join = (props) => {
  const [showNote, setShowNote] = useState(false);
  const [socket, setSocketInfo] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState({});
  const [roomStatus, setRoomStatus] = useState({});
  const [roomMessages, setRoomMessages] = useState({});
  const [resetID, setResetID] = useState(null);
  const [numTabs, setNumTabs] = useState(0);
  const [editModal, setEditModal] = useState(false);
  const [image, setImage] = useState();
  const [title, setTitle] = useState();
  const [refreshRooms, setRefreshRooms] = useState(0);
  const alertContext = useAlertContext();
  const { t } = useTranslation();

  if (props.location.gameinstance !== undefined) {
    localStorage.setItem('gameid', props.location.gameinstance);
  }

  if (props.location.adminid !== undefined) {
    localStorage.setItem('adminid', props.location.adminid);
  }

  if (props.location.title !== undefined) {
    localStorage.setItem('title', props.location.title);
  }
  if (props.location.img !== undefined) {
    localStorage.setItem('img', props.location.img);
  }
  if(title == null){
    setTitle(localStorage.title)
  }
  if(image == null){
    setImage(localStorage.img)
  }

  const toggleModal = () => {
    setShowNote(!showNote);
  }

  useEffect(() => {
    const run = async () => {
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
        if (data.chatlog) {
          setRoomMessages((messages) => ({
            ...messages,
            [data.room]: data.chatlog
          }));
          for(let i = 0; i < data.chatlog.length; i++){
            if(data.chatlog[i].sender.name === undefined){
              data.chatlog[i].sender.name = "Admin"
            }
          }
        }
        if (data.players) {
          setPlayers((players) => ({
            ...players,
            ...data.players
          }));
        }
      });
      client.on("clientJoined", (player) => {
        setPlayers((players) => ({
          ...players,
          [player.id]: player
        }));
      });
      client.on("clientLeft", (id) => {
        setPlayers((players) => {
          let n = {...players};
          delete n[id];
          return n;
        });
      });
      client.on("message", (data) => {
        if(data.sender.name === undefined){
          data.sender.name="Admin";
        }
        setRoomMessages((messages) => ({
          ...messages,
          [data.room]: [...messages[data.room] || [], { sender: data.sender || "admin", message: data.message }]
        }));
        console.log(roomMessages)
      });
      client.on("errorLog", ({key, params={}}) => {
        alertContext.showAlert(t(key, params), "error");
      });
      setSocketInfo(client);
      return () => client.disconnect();
    };
    run();
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
    if (currentRoomStatus?.startTime) {
      const diff = currentRoomStatus.startTime - (currentRoomStatus.timeElapsed || 0);
      return moment().diff(diff, 'hours') + ":" + moment(moment().diff(diff)).format("mm:ss")
    } return false;
  };

  const handleNextPage = (room) => {
    if (!socket) return;
    socket.emit("goToNextPage", (currentRoom && {
      room: currentRoom[2]
    }));
  };
  const handlePrevPage = (room) => {
    if (!socket) return;
    socket.emit("goToPrevPage", (currentRoom && {
      room: currentRoom[2]
    }));
  };
  const updateTitle = (title) => {
    setTitle(title);
  }
  const updateImg = (img) => {
    setImage(img);
  }

  const advanceMode = Object.keys(roomStatus).length > 0 ? roomStatus[Object.keys(roomStatus)[0]].settings?.advanceMode : null

  const displayPause = currentRoom
    ? !!currentRoomStatus?.running
    : Object.values(roomStatus).some(s => s.running);

  const allRunning = numTabs !== 0 &&
    numTabs <= Object.values(roomStatus).length &&
    !Object.values(roomStatus).some(s => !s.running);

  const playerDBIDS = useMemo(() => Object.values(players).map(({dbid}) => dbid), [players]);
  return (
    <div className="join-wrapper">
    <div className="join">
      <div className="page-margin joinboard-header">
        <Image
          className="joinboard-image"
          cloudName="uottawaedusim"
          publicId={
            "https://res.cloudinary.com/uottawaedusim/image/upload/" +
            image
          }
          alt={t("alt.sim")}
        />
        <div className="joinboard-info">
          <h2 className="joinboard-title">{title}   <i className="lni lni-pencil joinboard-edit" onClick={() => {
              setEditModal(true);
            }} ><h1>Edit</h1></i></h2>
          <button onClick={() => setShowNote(!showNote)} className="addbutton">
            {t("admin.addStudentCSV")}
          </button>
        </div>
        <div className="joinboard-controls">
          {currentRoom ? (
            <>
              <p>{currentRoom[0]}</p>
              <p>
                {advanceMode === "teacher" && t("admin.pageX", { page: currentRoomStatus.level || 1 }) + ", "}
                <AutoUpdate
                  value={(currentRoomStatus.running
                    ? timeFromNow
                    : () => moment.duration(currentRoomStatus.timeElapsed || 0).hours() + ":" + moment(currentRoomStatus.timeElapsed || 0).format("mm:ss")
                  )}
                  intervalTime={20}
                  enabled
                />
                {(currentRoomStatus.running == true ? '' : (
                  currentRoomStatus.running === false ? ` ${t("admin.pausedSuffix")}` : ` ${t("admin.stoppedSuffix")}`
                ))}
              </p>
            </>
          ) : (
            <>
              <p>{t("admin.allRooms")}</p>
              <p>{displayPause ? (
                allRunning ? t("admin.allRunning") : t("admin.someRunning")
              ) : t("admin.allPaused")}</p>
            </>
          )}
          <div className="joinboard-buttons">
            <button
              className="joinboard-button"
              onClick={displayPause ? pauseSim : startSim}
              title={currentRoom ? t("admin.pauseSim") : t("admin.pauseAllSims")}
            >
              {displayPause ? (
                <i className="lni lni-pause"></i>
              ) : (
                <i className="lni lni-play"></i>
              )}
            </button>
            <button
              className="joinboard-button"
              onClick={() => setResetID(true)}
              title={currentRoom ? t("admin.resetSim") : t("admin.resetAllSims")}
            >
              <i className="lni lni-reload"></i>
            </button>
            {advanceMode === "teacher" && (
              <>
                <button
                  className={`joinboard-button ${currentRoom && !currentRoomStatus.running ? ' joinboard-disabled' : undefined}`}
                  onClick={handlePrevPage}
                  title={currentRoom ? t("admin.goBackSim") : t("admin.goBackAllSims")}
                >
                  <i className="lni lni-angle-double-right"></i>
                </button>
                <button
                  className={`joinboard-button ${currentRoom && !currentRoomStatus.running ? ' joinboard-disabled' : undefined}`}
                  onClick={handleNextPage}
                  title={currentRoom ? t("admin.advanceSim") : t("admin.advanceAllSims")}
                >
                  <i className="lni lni-angle-double-left"></i>
                </button>
              </>
            )}
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
        closeTimeoutMS={250}
        ariaHideApp={false}
      >
        <CreateCsv
          gameid={localStorage.gameid}
          isOpen={showNote}
          close={toggleModal}
          success={() => setRefreshRooms(r => r + 1)}
        />
      </Modal>
      <Modal
        isOpen={editModal}
        hide={() => setEditModal(false)}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="createmodalarea"
        overlayClassName="myoverlay"
        closeTimeoutMS={250}
        ariaHideApp={false}
      >
      <CreateEdit
        updateTitle={updateTitle}
        updateImg={updateImg}
        gameid={localStorage.gameid}
        isOpen={editModal}
        close={() => setEditModal(false)}
        title={props.location.title}
        img={props.location.img}
      />
        </Modal>

      <Tabs
        customObjNames={props.customObjects}
        adminid={localStorage.adminid}
        gameid={localStorage.gameid}
        title={localStorage.title}
        setRoom={setCurrentRoom}
        chatMessages={currentRoomMessages}
        socket={socket}
        roomStatus={roomStatus}
        refreshRooms={refreshRooms}
        players={playerDBIDS}
        updateNumTabs={l => setNumTabs(l)}
      />

      <ConfirmationModal
        visible={!!resetID}
        hide={() => setResetID(null)}
        confirmFunction={resetSim}
        confirmMessage={t("admin.reset")}
        message={t("admin.resetConfirm")}
      />
    </div>
    </div>
  );
}

export default withAuth0(Join);
