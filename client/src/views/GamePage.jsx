import React, { useState, useEffect, useMemo } from "react";
import CanvasGame from "../components/Stage/CanvasGame";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import Sidebar from "../components/SideBar/Sidebar";
import styled from "styled-components";
import moment from "moment";
import AutoUpdate from "../components/AutoUpdate";
import Loading from "../components/Loading/Loading";
import { useTranslation } from "react-i18next";
import { useAlertContext } from "../components/Alerts/AlertContext";
import "../components/Stage/Info.css";
import "../components/Tabs/Tabs.css";
import '../components/Stage/Stage.css';
import { set } from "immutable";

const Main = styled.main`
  grid-area: main;
  background-color: ${p => p.color};
  padding-left: 50px;
  height: 100vh - 70px;
  @media screen and (orientation: portrait) {
    padding-left: 0px;
  }
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

const Game = (props) => {
  const { roomid } = useParams();
  const [room, setRoomInfo] = useState(null);
  const [socket, setSocketInfo] = useState(null);
  const [roomStatus, setRoomStatus] = useState({});
  const [showNav, setShowNav] = useState(false);
  const [players, setPlayers] = useState({});
  const [messageBacklog, setMessageBacklog] = useState([]);
  const [isEnd, setIsEnd] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isL, setL] = useState(true);
  const [customObjs, setCustomObjs] = useState();
  const [level, setLevel] = useState(1);
  const [roles, setRoles] = useState([]);
  const alertContext = useAlertContext();
  const [selectrole, setSelectrole] = useState(false);
  const [notes, setNotes] = useState();
  const [userId, setUserId] = useState();
  const [pageColor, setPageColor] = useState("#FFF");
  const [canvasLoading, setCanvasLoading] = useState(false);
  const [invalidateSidebar, setInvalidateSidebar] = useState(0);
  const [disableNext, setDisableNext] = useState(false);
  const [playerLevels, setPlayerLevels] = useState({});
  const { t } = useTranslation();

  //set states for globalVars, globalInts, globalCons, globalTrigs, localVars, localInts, localCons, localTrigs
  const [globalVars, setGlobalVars] = useState([]);
  const [globalInts, setGlobalInts] = useState([]);
  const [globalCons, setGlobalCons] = useState([]);
  const [globalTrigs, setGlobalTrigs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [localVars, setLocalVars] = useState([]);
  const [localInts, setLocalInts] = useState([]);
  const [localCons, setLocalCons] = useState([]);
  const [localTrigs, setLocalTrigs] = useState([]);


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
      });
      let gameData = roomData;
      setRoomInfo(roomData);
      
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
      client.on("connectStatus", ({ players, chatlog, notelog, ...status }) => {
        setPlayers(players);
        setRoomStatus(status || {});
        setMessageBacklog(chatlog);
        setNotes(notelog);
        setTasks(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).tasks || [])
        setGlobalCons(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).globalCons)
        setGlobalVars(flattenObject(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).globalVars))
        setGlobalInts(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).globalInts)
        setGlobalTrigs(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).globalTrigs)
        setLocalCons(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).localCons)
        setLocalVars(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).localVars)
        setLocalInts(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).localInts)
        setLocalTrigs(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).localTrigs)
        setRoles(gameData?.gameinstance?.game_parameters && JSON.parse(gameData.gameinstance.game_parameters).roles)
        setSelectrole(true);
      });
      client.on("roomStatusUpdate", ({ status, refresh, lastSetVar }) => {
        if (refresh) {
          localStorage.removeItem("userInfo");
          window.location.reload();
        }
        if (lastSetVar) {
          sessionStorage.setItem('lastSetVar', lastSetVar);
        }
        setLevel(status.level)
        setRoomStatus(status);
        console.log(status)
      });
      client.on("clientJoined", ({ id, ...player }) => {
        setPlayers(l => ({
          ...l,
          [id]: player
        }));
      });
      client.on("clientLeft", (id) => {
        setPlayers(l => {
          let n = { ...l };
          delete n[id];
          return n;
        });
      });
      client.on("errorLog", ({ key, params = {} }) => {
        // alertContext.showAlert(t(key, params), "error");
      });
      client.on("userLevelUpdate", (data) => {
        setLevel(data.level)
      })

      setSocketInfo(client);
      setLoading(false);
      return () => client.disconnect();
    }());
  }, [roomid]);

  const timeFromNow = () => (
    (roomStatus.running
      ? moment(moment()).diff(roomStatus.startTime - (roomStatus.timeElapsed || 0))
      : (roomStatus.timeElapsed || 0)
    )
  );

  const countdown = () => {
    const count = (roomStatus.settings?.advanceMode || 1) * 60000;
    return (count - timeFromNow()) - Math.floor((count - timeFromNow()) / count) * count
  };

  useEffect(() => {
    if (room?.gameinstance?.game_parameters && JSON.parse(room.gameinstance.game_parameters).pages.length < roomStatus.level) {
      setIsEnd(true);
    }
  }, []);


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
          newPlayers[id].role = roles[(level ** level + parseInt(p.dbid, 16)) % roles.length].roleName;
        }
      }
    }
    return newPlayers;
  }, [players, roles, level]);



  const flattenObject = (obj) => {
    const flattened = {}
    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value))
      } else {
        flattened[key] = value
      }
    })
    return flattened
  }




  const handleLevel = (x, type) => {
    if (type === 'edit')
      setLevel(id)
    else {
      socket.emit("goToPage", {
        level: x
      });
    }
  }

  const handleSetNotes = (data) => {
    setNotes(data)
  }

  const handleEditNotes = (data) => {
    setNotes(data)
  }

  const handleDelNotes = (data) => {
    setNotes(data)
  }
  const handleDisable = (e) => {
    setDisableNext(e)
  }
  useEffect(() => {
    let x, y, s, t;
    Object.keys(globalVars).forEach(function (key) {
      s = globalVars[key]
      if (typeof s === 'string' && s.includes('Random')) {
        for (let i = 0; i < s.length; i++) {
          if (s[i] == '(')
            x = i
          if (s[i] == ')')
            y = i
        }
        s = s.substring(x + 1, y).split(',')
        t = s[2].replace('.', '').split('').reverse().join('')
        globalVars[key] = Math.round((Math.random() * (s[1] - s[0]) + s[0]) * t) / t;
      }
    })
    setL(false)
  }, [globalVars])

  useEffect(() => {
    let vars = {
      ...globalVars, // Spread the existing globalVars state
      ...roomStatus.variables // Spread the properties from status.variables
    };
    
    setGlobalVars(vars);
  }, [roomStatus.variables])
  return (
    !isLoading && !isL ? (
      <div className="editpage">
        <Sidebar
          userId={userId}
          customObjs={customObjs}
          gamepieceStatus={roomStatus || {}}
          className="grid-sidebar game"
          visible={showNav}
          close={toggle}
          socket={socket}
          img={room.gameinstance?.gameinstance_photo_path || ""}
          title={room.gameinstance?.gameinstance_name || ""}
          subtitle={room.gameroom_name || ""}
          handleLevel={handleLevel}
          globalVars={globalVars || {}}
          level={level}
          page={level}
          handleDisable={handleDisable}
          submenuProps={{ messageBacklog }}
          players={parsedPlayers}
          game
          disabled={!roomStatus.running}
          alerts={tasks}
          notes={{ notes }}
          setNotes={handleSetNotes}
          editNotes={handleEditNotes}
          delNotes={handleDelNotes}
        />
        <Main color={pageColor}>
          <CanvasGame
            selectrole={selectrole}
            setPageColor={setPageColor}
            canvasHeights={props.canvasHeights}
            customObjectsLabels={props.customObjectsLabels}
            loadObjects={props.loadObjects}
            reCenter={props.reCenter}
            setUserId={setUserId}
            setCustomObjs={setCustomObjs}
            setCanvasLoading={setCanvasLoading}
            disableNext={disableNext}
            setGamePlayProps={props.setGamePlayProps}
            savedObjects={props.savedObjects}
            adminid={localStorage.adminid}
            gameinstance={room.gameinstance}
            socket={socket}
            alerts={tasks || []}
            players={parsedPlayers}
            handleLevel={handleLevel}
            isEnd={isEnd}
            level={level || 0}
            freeAdvance={!roomStatus.settings?.advanceMode || roomStatus.settings?.advanceMode === "student"}
            gamepieceStatus={roomStatus.gamepieces || {}}
            globalVars={globalVars || {}}
            globalCons={globalCons || []}
            globalInts={globalInts || []}
            globalTrigs={globalTrigs || []}
            localCons={localCons || []}
            localVars={localVars || []}
            localInts={localInts || []}
            localTrigs={localTrigs || []}
            roles={roles || []}
            setNotes={setNotes}
            notes={notes || []}
            roleSelection={roomStatus.settings?.roleMode || "student"}
            initialUserInfo={queryUser}
            initialUserId={userid}
            alert={alertContext.showAlert}
            refresh={() => setInvalidateSidebar(Math.random())}
            countdown={roomStatus.settings && !isNaN(roomStatus.settings.advanceMode) && countdown}
          />
          {!roomStatus.running && (<PauseCover>
            <i className="fa fa-pause-circle fa-2x"></i>
            <p>{t("game.paused")}</p>
          </PauseCover>)}
        </Main>
        {!isNaN(roomStatus.settings?.advanceMode) && (
          <AutoUpdate
            value={() => Math.floor(timeFromNow() / (roomStatus.settings.advanceMode * 60000)) + 1}
            intervalTime={20}
            enabled
            noDisplay
            onChange={setLevel}
          />
        )}
        {canvasLoading && (
          <div className="gameLoadingOverlay">
            <Loading />
          </div>
        )}
      </div>
    ) : (
      <Loading />
    )
  );
}

export default Game;
