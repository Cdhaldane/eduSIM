
// TEMPORARY FILE, TO BE DELETED

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Image } from "cloudinary-react";

function Game(props) {
  const { roomid } = useParams();
  const [room, setRoomInfo] = useState(null);

  useEffect(() => {
    (async function() {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getRoomByURL', {
        params: {
          id: roomid,
        }
      }).then((res) => {
        setRoomInfo(res.data);
      })
    }());
  }, [roomid]);

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
          <h2>this page belongs to "{room.gameroom_name}" room of the "{room.gameinstance.gameinstance_name}" simulation</h2>
        </>
      ) : (
        <h1>loading...</h1>
      )}
    </div>
  );
}

export default Game;
