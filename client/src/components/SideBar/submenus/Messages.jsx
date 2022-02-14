
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

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
  ${p => (!p.sender || p.private) && 'cursor: pointer;'}
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

const Messages = (props) => {
  const [messageLog, setMessageLog] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendGroup, setSendGroup] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (props.socket) {
      props.socket.on("message", ({ sender, message, group }) => {
        props.incrementTicker();
        setMessageLog(list => list.concat({
          sender, message, group
        }));
      })
    }
  }, []);

  useEffect(() => {
    if (props.messageBacklog && props.messageBacklog.length>0) {
      setMessageLog(props.messageBacklog);
    }

  }, [props.messageBacklog]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!messageInput) {
      return false;
    };
    props.socket.emit("message", {
      message: messageInput,
      group: Object.values(sendGroup)
    });
    setMessageInput("");
    return false;
  }

  const sessionId = localStorage.userInfo && JSON.parse(localStorage.userInfo).dbid;

  const addWhisper = ({id, name, dbid}, group) => {
    if (group) {
      setSendGroup(old => {
        let set = {...old};
        if (id !== props.socket.id && dbid !== sessionId) {
          set[id] = {id, name, dbid};
        }
        group.forEach(mem => {
          if (mem.id !== props.socket.id && mem.dbid !== sessionId) {
            set[mem.id] = mem;
          }
        });
        return set;
      });
    } else {
      if (id === props.socket.id || dbid === sessionId) return;
      setSendGroup(old => ({...old, [id]: {id, name, dbid}}));
    }
  }
  const fixAdmin = () => {
    for(let i = 0; i < messageLog.length; i++){
      if(messageLog[i].sender.name === undefined){
        messageLog[i].sender.name = "Admin"
      }
    }
  }
  fixAdmin();

  const removeWhisper = () => setSendGroup(() => new Set());
  return (props.socket ? (
    <MessageContainer>
      <div>
        {messageLog.map(({sender: {id, name, dbid}, message, group}, ind) => (
          <Message
            key={ind}
            sender={props.socket.id === id || dbid === sessionId}
            onClick={() => addWhisper({id, name, dbid}, group)}
            private={group && group.length>0}
          >
            {group && group.length>0 && (<aside>To: {group.map(mem => mem.id === props.socket.id ? t("sidebar.you") : mem.name).join(', ')}</aside>)}
            <b>{(props.socket.id !== id && dbid !== sessionId ? t("sidebar.xSays", { name }) : t("sidebar.youSaid")) }</b>
            <p>{message}</p>
          </Message>
        ))}
      </div>
      <hr />
      {Object.keys(sendGroup).length>0 && (
        <MessageGroup>
          <button onClick={removeWhisper}>
            <i className="lni lni-close-circle remove-whisper" aria-hidden="true"></i>
          </button>
          <p>Sending to: {Object.values(sendGroup).map(mem => mem.name).join(', ')}</p>
        </MessageGroup>
      )}
      <form onSubmit={sendMessage} action="#">
        <MessageInput onChange={(e) => setMessageInput(e.target.value)} value={messageInput} placeholder={t("sidebar.typeYourMessageHere")} />
        <MessageSend type="submit" value="send">
          <i className="fa fa-send fa-2x" ></i>
        </MessageSend>
      </form>
    </MessageContainer>
  ) : (
    <MessageWarning>{t("sidebar.notConnectedToChat")}</MessageWarning>
  ));
}

export default Messages;
