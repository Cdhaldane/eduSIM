
import React, { useState, useEffect } from "react";
import styled from "styled-components"
import { useAlertContext } from '../../Alerts/AlertContext'

const Message = styled.div`
  background:  ${(p) => (p.sender ? "rgb(34 125 204)" : "rgb(72 169 224)")};
  margin: ${(p) => (p.sender ? "10px 10px 10px 50px" : "10px 50px 10px 10px")};
  color: white;
  padding: 10px;
  border-radius: 10px;
  word-break: break-word;
  font-size: .9em;
  & > p {
    margin-top: 5px;
  }
`;

const MessageInput = styled.input`
  flex: 1;
  border: none;
  padding: 10px;
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
  font-family: inherit;
  resize: none;
`;

const MessageSend = styled.button`
  border: none;
  background: none;
  margin-left: 20px;
  height: 50px;
  cursor: pointer;
  color: #8f001a;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 10px;
  & > :first-child {
    flex: 1;
    overflow-y: auto;
  }
  & > form {
    display: flex;
    padding: 10px;
  }
`;

const MessageWarning = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  height: inherit;
`;

function Messages(props) {
  const [messageLog, setMessageLog] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const alertContext = useAlertContext();

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
    if (!messageInput) {
      return false;
    };
    props.socket.emit("message", { message: messageInput });
    setMessageInput("");
    return false;
  }

  console.log(props.socket);

  return (props.socket ? (
    <MessageContainer>
      <div>
        {messageLog.map(({id, message}) => (
          <Message sender={props.socket.id === id}>
            <b>{(props.socket.id !== id ? `${id} says:` : "You said:")}</b>
            <p>{message}</p>
          </Message>
        ))}
      </div>
      <hr />
      <form onSubmit={sendMessage} action="#">
        <MessageInput onChange={(e) => setMessageInput(e.target.value)} value={messageInput} placeholder="Type your message here" />
        <MessageSend type="submit" value="send">
          <i class="fa fa-send fa-2x" ></i>
        </MessageSend>
      </form>
    </MessageContainer>
  ) : (
    <MessageWarning>You aren't connected to any chat room!</MessageWarning>
  ));
}

export default Messages;
