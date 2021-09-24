
import React, { useState, useEffect } from "react";

function Messages(props) {
  const [messageLog, setMessageLog] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (props.socket) {
      props.socket.on("message", ({ id, message }) => {
        setMessageLog(list => list.concat({
          id, message
        }));
      })
    }
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    props.socket.emit("message", { message: messageInput });
    setMessageInput("");
    return false;
  }

  return (props.socket ? (
    <div>
      <div>
        {messageLog.map(({id, message}) => (
          <p><b>{id}:</b> {message}</p>
        ))}
      </div>
      <form onSubmit={sendMessage} action="#">
        <input type="text" onChange={(e) => setMessageInput(e.target.value)} value={messageInput} placeholder="send message" />
        <input type="submit" value="send" />
      </form>
    </div>
  ) : (
    <p>You aren't connected to any chat room!</p>
  ));
}

export default Messages;
