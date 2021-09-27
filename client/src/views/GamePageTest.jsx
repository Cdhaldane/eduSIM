
// TEMPORARY FILE, TO BE DELETED

import React, { useState, useEffect } from "react";
import CanvasGame from "../components/Stage/CanvasGame";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Image } from "cloudinary-react";
import io from "socket.io-client";
import Sidebar from "../components/SideBar/Sidebar";
import styled from "styled-components";

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

function Game(props) {
  const { roomid } = useParams();
  const [room, setRoomInfo] = useState(null);
  const [socket, setSocketInfo] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [running, setRunning] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const toggle = () => setShowNav(!showNav);

  useEffect(() => {
    (async function () {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getRoomByURL', {
        params: {
          id: roomid,
        }
      }).then((res) => {
        setRoomInfo(res.data);
      })

      const client = await io(process.env.REACT_APP_API_ORIGIN, {
        query: {
          room: roomid
        }
      });
      client.on("connectStatus", ({ running }) => {
        setRunning(running || false);
        setAlerts(list => list.concat(
          <p>connected as {client.id}</p>
        ));
      });
      client.on("newClient", (id) => {
        setAlerts(list => list.concat(
          <p><b>a new person joined:</b> {id}</p>
        ));
      })
      client.on("gameStart", () => {
        console.log('awoga');
        setRunning(true);
      })
      client.on("gamePause", () => {
        console.log('awooga');
        setRunning(false);
      })
      setSocketInfo(client);
      return () => client.disconnect();
    }());
  }, [roomid]);

  const isLoading = room === null;

  return (
    !isLoading ? (
      <>
        <Sidebar 
          className="grid-sidebar" 
          visible={showNav} 
          close={toggle}
          img={room.gameinstance.gameinstance_photo_path}
          title={room.gameinstance.gameinstance_name}
          subtitle={room.gameroom_name}
          socket={socket}
          game
          disabled={!running}
        />
        <Main>
          <CanvasGame
            adminid={localStorage.adminid}
            gameinstance={room.gameinstance}
          />
          {/* <Image
            className="joinboard-image"
            cloudName="uottawaedusim"
            publicId={
              "https://res.cloudinary.com/uottawaedusim/image/upload/" +
              room.gameinstance.gameinstance_photo_path
            }
            alt="backdrop"
          />
          <h2>room code: {roomid}</h2>
          <h2>this page belongs to "{room.gameroom_name}" room of the "{room.gameinstance.gameinstance_name}" simulation</h2>
          {alerts.map((el) => (el))} */}
          {!running && (<PauseCover>
            <i class="fa fa-pause-circle fa-2x"></i>
            <p>Paused</p>
          </PauseCover>)}
        </Main>
      </>
    ) : (
      <h1>loading...</h1>
    )
  );
}

export default Game;
