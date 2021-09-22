
// TEMPORARY FILE, TO BE DELETED

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Image } from "cloudinary-react";
import io from "socket.io-client";

function Game(props) {
  const { roomid } = useParams();
  const [room, setRoomInfo] = useState(null);
  const [socket, setSocketInfo] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async function() {
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
      client.on("connectStatus", ({ status }) => {
        setRunning(status);
        setAlerts(list => list.concat(
          <p>connected as {client.id}</p>
        ));
      });
      client.on("newClient", (id) => {
        setAlerts(list => list.concat(
          <p><b>a new person joined:</b> {id}</p>
        ));
      })
      client.on("message", ({ id, message }) => {
        setAlerts(list => list.concat(
          <p><b>{id}:</b> {message}</p>
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
    }());
  }, [roomid]);

  const sendMessage = (event) => {
    event.preventDefault();
    socket.emit("message", { message });
    setMessage("");
    return false;
  }

  const isLoading = room === null;

  return (
    <div className="editpagetest">
      {!isLoading ? (
        <>
          <Image
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
          {alerts.map((el) => (el))}
          <form onSubmit={sendMessage} action="#">
            <input type="text" onChange={(e) => setMessage(e.target.value)} value={message} placeholder="send message" />
            <input type="submit" value="send" />
          </form>
          {!running && (<div className="editpagetest-paused">paused/not running</div>)}
        </>
      ) : (
        <h1>loading...</h1>
      )}
    </div>
  );
}

export default Game;
