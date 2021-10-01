
import React, { useState, useEffect } from "react";
import styled from "styled-components"

const Message = styled.div`
  background:  ${(p) => (
    p.private
    ? (p.sender ? "rgb(204 81 34)" : "rgb(224 142 72)")
    : (p.sender ? "rgb(34 125 204)" : "rgb(72 169 224)")
  )};
  margin: ${(p) => (p.sender ? "10px 10px 10px 50px" : "10px 50px 10px 10px")};
  color: white;
  padding: 10px;
  border-radius: 10px;
  word-break: break-word;
  cursor: pointer;
  font-size: .9em;
  & > p {
    margin-top: 5px;
  }
  & > aside {
    font-size: 0.8em;
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
  color: var(--primary);
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

const MessageGroup = styled.div`
  display: flex;
  font-size: 0.9em;
  padding: 0 10px;
  align-items: center;
  & > button {
    background: none;
    border: none;
    font-size: 1.4em;
    cursor: pointer;
  }
  & > p {
    margin-left: 10px;
  }
`;

function Messages(props) {
  const [messageLog, setMessageLog] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendGroup, setSendGroup] = useState(() => new Set());

  useEffect(() => {
    if (props.socket) {
      props.socket.on("message", ({ sender, message, group }) => {
        setMessageLog(list => list.concat({
          sender, message, group
        }));
      })
    }
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!messageInput) {
      return false;
    };
    props.socket.emit("message", { 
      message: messageInput,
      group: Array.from(sendGroup)
    });
    setMessageInput("");
    return false;
  }

  const addWhisper = (id, group) => {
    if (group) {
      setSendGroup(old => {
        const set = new Set(old).add(id);
        group.forEach(mem => {
          if (mem.id !== props.socket.id) set.add(mem);
        });
        return set;
      });
    } else {
      if (id === props.socket.id) return;
      setSendGroup(old => new Set(old).add(id));
    }
  }

  const removeWhisper = () => setSendGroup(() => new Set());

  return (props.socket ? (
    <MessageContainer>
      <div>
        {messageLog.map(({sender: {id, name}, message, group}, ind) => (
          <Message 
            key={ind}
            sender={props.socket.id === id} 
            onClick={() => addWhisper({id, name}, group)}
            private={!!group}
          >
            {!!group && (<aside>To: {group.map(mem => mem.id === props.socket.id ? "You" : mem.name).join(', ')}</aside>)}
            <b>{(props.socket.id !== id ? (`${name} says:`) : "You said:")}</b>
            <p>{message}</p>
          </Message>
        ))}
      </div>
      <hr />
      {Array.from(sendGroup).length>0 && (
        <MessageGroup>
          <button onClick={removeWhisper}>
            <i class="fa fa-times-circle" aria-hidden="true"></i>
          </button>
          <p>Sending to: {Array.from(sendGroup).map(mem => mem.name).join(', ')}</p>
        </MessageGroup>
      )}
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