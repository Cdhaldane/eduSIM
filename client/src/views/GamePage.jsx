import React, { useState, useEffect, useMemo } from "react";
import CanvasGame from "../components/Stage/CanvasGame";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import Sidebar from "../components/SideBar/Sidebar";
import styled from "styled-components";
import moment from "moment";
import AutoUpdate from "../components/AutoUpdate";
import { useAlertContext } from "../components/Alerts/AlertContext";

const Main = styled.main`
  grid-area: main;
  background-color: #e5e5e5;
`;

const PauseCover = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.7);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2em;
  z-index: 900;
  & > i {
    font-size: 3em;
  }
`;

const Time = styled.div`    
  position: fixed;
  text-align: center;
  top: 40px;
  left: 50%;
  color: var(--primary);
  font-size: 3em;
  font-weight: bold;
  width: 300px;
  margin-left: -195px;
  @media screen and (orientation: portrait) {
    margin-left: -180px;
    top: 60px;
  }
`;

const Game = (props) => {

  const { roomid } = useParams();
  const [room, setRoomInfo] = useState(null);
  const [socket, setSocketInfo] = useState(null);
  const [roomStatus, setRoomStatus] = useState({});
  const [showNav, setShowNav] = useState(false);
  const [players, setPlayers] = useState({});
  const [messageBacklog, setMessageBacklog] = useState([]);
  const [level, setLevel] = useState(1);
  const [roles, setRoles] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [customObjs, setCustomObjs] = useState();
  const alertContext = useAlertContext();
  const [userId, setUserId] = useState();

  const toggle = () => setShowNav(!showNav);

  const userid = (new URLSearchParams(useLocation().search)).get("user");
  const [queryUser, setQueryUser] = useState({});

  useEffect(() => {
    (async function () {
      const { data: roomData } = await axios.get(
        process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getRoomByURL', {
        params: {
          id: roomid,
        }
      })
      setRoomInfo(roomData);

      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
        params: {
          gameinstanceid: roomData.gameinstanceid,
        }
      }).then((res) => {
        const rolesData = [];
        for (let i = 0; i < res.data.length; i++) {
          rolesData.push({
            id: res.data[i].gameroleid,
            roleName: res.data[i].gamerole,
            numOfSpots: res.data[i].numspots
          });
        }
        setRoles(rolesData);
      })

      if (userid) {
        axios.get(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getPlayer', {
          params: {
            id: userid,
          }
        }).then((res) => {
          setQueryUser(res.data);
        });
      }

      const client = await io(process.env.REACT_APP_API_ORIGIN, {
        query: {
          room: roomid
        }
      });
      client.on("connectStatus", ({ players, chatlog, ...status }) => {
        setPlayers(players);
        setRoomStatus(status || {});
        setMessageBacklog(chatlog);
      });
      client.on("roomStatusUpdate", ({ status, refresh }) => {
        if (refresh) {
          sessionStorage.removeItem("userInfo");
          window.location.reload();
        }
        setRoomStatus(status);
      });
      client.on("clientJoined", ({ id, ...player }) => {
        setPlayers(l => ({
          ...l,
          [id]: player
        }));
      });
      client.on("clientLeft", (id) => {
        setPlayers(l => {
          delete l[id];
          return l;
        });
      });
      client.on("errorLog", (message) => {
        alertContext.showAlert(message, "error");
      });
      setSocketInfo(client);
      setLoading(false);
      return () => client.disconnect();
    }());
  }, [roomid]);

  const timeFromNow = () => (
    roomStatus.running
      ? moment(moment()).diff(roomStatus.startTime - (roomStatus.timeElapsed || 0))
      : (roomStatus.timeElapsed || 0)
  );

  const countdown = () => {
    const count = (roomStatus.settings?.advanceMode || 1) * 60000;
    return (count - timeFromNow()) - Math.floor((count - timeFromNow()) / count) * count
  };

  const actualLevel = roomStatus.level || level;

  // Parse seeded roles
  const parsedPlayers = useMemo(() => {
    let newPlayers = {};
    for (const id in players) {
      let p = { ...players[id] };
      newPlayers[id] = p;
      if (roles && roles.length > 0) {
        if (p.role === -1) {
          newPlayers[id].role = roles[parseInt(p.dbid, 16) % roles.length].roleName;
        } else if (p.role === -2) {
          newPlayers[id].role = roles[(actualLevel ** actualLevel + parseInt(p.dbid, 16)) % roles.length].roleName;
        }
      }
    }
    return newPlayers;
  }, [players, roles, actualLevel]);

  return (
    !isLoading ? (
      <>
        <Sidebar
          userId={userId}
          customObjs={customObjs}
          gamepieceStatus={roomStatus.gamepieces || {}}
          className="grid-sidebar"
          visible={showNav}
          close={toggle}
          img={room.gameinstance.gameinstance_photo_path}
          title={room.gameinstance.gameinstance_name}
          subtitle={room.gameroom_name}
          socket={socket}
          submenuProps={{ messageBacklog }}
          game
          disabled={!roomStatus.running}
        />
        <Main>
          <CanvasGame
            customObjectsLabels={props.customObjectsLabels}
            loadObjects={props.loadObjects}
            reCenter={props.reCenter}
            setUserId={setUserId}
            setCustomObjs={setCustomObjs}
            setGamePlayProps={props.setGamePlayProps}
            savedObjects={props.savedObjects}
            adminid={localStorage.adminid}
            gameinstance={room.gameinstance}
            socket={socket}
            players={parsedPlayers}
            level={actualLevel}
            freeAdvance={!roomStatus.settings?.advanceMode || roomStatus.settings?.advanceMode === "student"}
            gamepieceStatus={roomStatus.gamepieces || {}}
            roleSelection={roomStatus.settings?.roleMode || "student"}
            initialUserInfo={queryUser}
            initialUserId={userid}
            alert={alertContext.showAlert}
          />
          {!roomStatus.running && (<PauseCover>
            <i className="fa fa-pause-circle fa-2x"></i>
            <p>Paused</p>
          </PauseCover>)}
        </Main>
        <Time>
          {!isNaN(roomStatus.settings?.advanceMode) && (
            <>
              <AutoUpdate
                value={() => moment(countdown()).format("mm:ss")}
                intervalTime={20}
                enabled
              />
              <AutoUpdate
                value={() => Math.floor(timeFromNow() / (roomStatus.settings.advanceMode * 60000)) + 1}
                intervalTime={20}
                enabled
                noDisplay
                onChange={setLevel}
              />
            </>
          )}
        </Time>
      </>
    ) : (
      <h1>loading...</h1>
    )
  );
}

export default Game;
