import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../Table/Table";
import CreateEmail from "../CreateEmail/CreateEmail";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Modal from "react-modal";
import { useAlertContext } from "../Alerts/AlertContext";

import "./Tabs.css";

function Tabs(props) {
  const [toggleState, setToggleState] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [tabs, setTabs] = useState([]);
  const [time, setTime] = useState(1);
  const [interactionData, setInteractionData] = useState({});
  const [logs, setLogs] = useState({});

  const alertContext = useAlertContext();

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_ORIGIN + "/api/playerrecords/getRooms/:gameinstanceid", {
      params: {
        gameinstanceid: [props.gameid],
      },
    }).then((res) => {
      let cart = [];
      for (let i = 0; i < res.data.length; i++) {
        cart.push([res.data[i].gameroom_name, res.data[i].gameroomid, res.data[i].gameroom_url]);
      }
      setTabs(cart);
    }).catch((error) => {
      console.log(error);
    });
  }, [props.gameid]);

  const toggleTab = (index) => {
    setToggleState(index);
    // for updating controls in admin header
    props.setRoom(tabs[index - 1]);
    if (index > 0 && index < tabs.length+1) {
      const id = tabs[index-1][1];
      axios.get(process.env.REACT_APP_API_ORIGIN + "/api/playerrecords/getRoomInteractionBreakdown", {
        params: {
          gameroomid: id,
        },
      }).then((res) => {
        setInteractionData(Object.entries(res.data).map((val) => ({name: "Level "+val[0], interactions: val[1]})));
      });
      if (!logs[id]) {
        axios.get(process.env.REACT_APP_API_ORIGIN + "/api/playerrecords/getGameLogs", {
          params: {
            gameroomid: id,
          },
        }).then((res) => {
          setLogs(prev => ({
            ...prev,
            [id]: res.data
          }));
        });
      }
    }
  };

  console.log(logs);

  const handleSubmit = (e) => {
    // Check if name is empty or a duplicate
    if (newGroup.trim() === "") {
      console.log(tabs);
      alertContext.showAlert("Group name cannot be empty.", "warning");
      return;
    }
    if (tabs.some((tab) => tab[0] === newGroup.trim())) {
      alertContext.showAlert("A group with this name already exists. Please pick a new name.", "warning");
      return;
    }

    e.preventDefault();
    let data = {
      gameinstanceid: props.gameid,
      gameroom_name: newGroup.trim()
    }
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/createRoom', data)
      .then((res) => {
        setTabs([...tabs, [res.data.gameroom_name, res.data.gameroomid, res.data.gameroom_url]]);
        setToggleState(toggleState + 1);
        if (props.socket) {
          props.socket.emit("joinRoom", res.data.gameroom_url);
        }
      })
      .catch(error => console.log(error.response));
  }

  const handleChange = (e) => {
    e.preventDefault();
    setNewGroup(e.target.value);
  };

  const toggleModal = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleDeleteGroup = (e) => {
    var index = tabs.indexOf(e);
    setToggleState(0);
    axios.delete(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/deleteRoom/:gameroomid', {
      params: {
        id: tabs[index][1]
      }
    })
      .then((res) => {
        console.log(res)

      })
      .catch(error => console.log(error.response));
    setTabs(tabs.filter((_, i) => i != index));
  }

  const handleTime = (e) => {
    const val = Math.max(parseFloat(e.target.value), 1);
    setTime(val);
    if (props.socket) {
      props.socket.emit("updateGameSettings", {
        settings: {
          advanceMode: val
        }
      });
    }
  };

  const handleSetAdvancement = (e) => {
    const val = e.target.value;
    if (props.socket) {
      props.socket.emit("updateGameSettings", {
        settings: {
          advanceMode: val === "timed" ? time : val
        }
      });
    }
  };
  const handleSetRole = (e) => {
    const val = e.target.value;
    if (props.socket) {
      props.socket.emit("updateGameSettings", {
        settings: {
          roleMode: val
        }
      });
    }
  };

  const displayAdvance = () => {
    const keys = props.roomStatus && Object.keys(props.roomStatus);
    if (keys && keys.length > 0) {
      return props.roomStatus && (
        isNaN(props.roomStatus[keys[0]].settings?.advanceMode) ? props.roomStatus[keys[0]].settings?.advanceMode : "timed"
      ) || "student"
    }
    return "student";
  };
  const displayRole = () => {
    const keys = props.roomStatus && Object.keys(props.roomStatus);
    if (keys && keys.length > 0) {
      return props.roomStatus && (
        props.roomStatus[keys[0]].settings?.roleMode
      ) || "student"
    }
    return "student";
  };

  return (
    <div className="page-margin tabs">
      <ul className="selected-tab">
        <li
          onClick={() => toggleTab(0)}
          className={toggleState === 0 ? "selected" : ""}
        >
          <span className="tab-text">Overview</span>
        </li>
        {tabs.map((tab, i) => (
          <li
            onClick={() => toggleTab(i + 1)}
            className={toggleState === i + 1 ? "selected" : ""}
          >
            <span className="tab-text">{tab[0]}</span>
          </li>
        ))}
        <li
          onClick={() => toggleTab(tabs.length + 1)}
          className={toggleState === tabs.length + 1 ? "selected" : ""}
        >
          <span className="tab-text">Add group</span>
        </li>
      </ul>
      <div className="content-tabs">
        <div
          className={toggleState === 0 ? "content  active-content" : "content"}
        >
          <div className="content-row">
            <div className="content-settings">
              <h3>Settings:</h3>
              <div className="simadv">
                <h3>Simulation advancement</h3>
                <div className="content-radiobuttons">
                  <div>
                    <input
                      type="radio"
                      checked={displayAdvance() === "teacher"}
                      value="teacher"
                      onChange={handleSetAdvancement}
                      disabled={tabs.length === 0}
                    />{" "}
                    Teacher/Facilitator
                  </div>
                  <div>
                    <input
                      type="radio"
                      checked={displayAdvance() === "student"}
                      value="student"
                      onChange={handleSetAdvancement}
                      disabled={tabs.length === 0}
                    />{" "}
                    Student/Participants
                  </div>
                  <div>
                    <input
                      type="radio"
                      checked={displayAdvance() === "timed"}
                      value="timed"
                      onChange={handleSetAdvancement}
                      disabled={tabs.length === 0}
                    />{" "}
                    <span>Timed =</span>
                    <input
                      onChange={handleTime}
                      value={time}
                      type="text"
                      placeholder="Time"
                      className="content-timeinput"
                      disabled={tabs.length === 0 || displayAdvance() !== "timed"}
                    />
                    <span>min</span>
                  </div>
                </div>
              </div>
              <div className="simadv">
                <h3>Role assignment</h3>
                <div className="content-radiobuttons">
                  <div>
                    <input
                      type="radio"
                      checked={displayRole() === "teacher"}
                      value="teacher"
                      onChange={handleSetRole}
                      disabled={tabs.length === 0}
                    />{" "}
                    Teacher/Facilitator
                  </div>
                  <div>
                    <input
                      type="radio"
                      checked={displayRole() === "student"}
                      value="student"
                      onChange={handleSetRole}
                      disabled={tabs.length === 0}
                    />{" "}
                    Student/Participants
                  </div>
                  <div>
                    <input
                      type="radio"
                      checked={displayRole() === "random"}
                      value="random"
                      onChange={handleSetRole}
                      disabled={tabs.length === 0}
                    />{" "}
                    Random
                  </div>
                  <div>
                    <input
                      type="radio"
                      checked={displayRole() === "randomByLevel"}
                      value="randomByLevel"
                      onChange={handleSetRole}
                      disabled={tabs.length === 0}
                    />{" "}
                    Random (per level)
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="studentbuttonemail"
            >
              Email Student/Participant
            </button>
            <Modal
              isOpen={isOpen}
              onRequestClose={toggleModal}
              contentLabel="My dialog"
              className="createmodaltab"
              overlayClassName="myoverlaytab"
              closeTimeoutMS={250}
              ariaHideApp={false}
            >
              <CreateEmail
                addstudent={true}
                gameid={props.gameid}
                title={props.title}
                close={() => setIsOpen(false)}
              />
            </Modal>
          </div>
          <h3>Student/participant list:</h3>
          <Table addstudent={false} gameid={props.gameid} title={props.title} />
        </div>
        {tabs.map((tab, i) => (
          <div
            className={
              toggleState === i + 1 ? "content  active-content" : "content"
            }
          >
            <div className="content-header">
              <h2>{tab[0]}</h2>
              <a className="content-roomlink" href={`/gamepage/${tab[2]}`} target="#">
                Join Room
              </a>
              <button
                onClick={() => handleDeleteGroup(tab)}
                className="deletegroup"
              >
                Delete Group
              </button>
            </div>
            <hr />
            <div className="groupcontainer">
              <div className="group-column">
                <h3>Chat: </h3>
                <div className="group-chatlog">
                  <div>
                    {props.chatMessages.map(({ sender, message }) => (
                      <p><b>{sender.name}: </b>{message}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="group-column">
                <h3>Performance:</h3>
                <div className="chart" disabled={interactionData.length === 0}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={interactionData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <Line type="monotone" dataKey="interactions" stroke="#8884d8" />
                      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                    {interactionData.length === 0 && (
                      <p>No data has been recorded yet.</p>
                    )}
                </div>
              </div>
            </div>
            <h3>Previous Runs:</h3>
            {logs[tab[1]] && logs[tab[1]].map(data => (
              <p key={data.gameactionid}>{data.createdAt}</p>
            ))}
            <h3>Students / participants in room:</h3>
            <div className="group-table">
              <Table
                addstudent={true}
                gameroom={tab}
                gameid={props.gameid}
                title={props.title}
              />
            </div>
          </div>
        ))}
        <div
          className={
            toggleState === tabs.length + 1
              ? "content active-content"
              : "content"
          }
        >
          <h2>Add Group!</h2>
          <hr />
          <p>
            Group name
            <input
              onChange={handleChange}
              type="text"
              className="textbox"
              placeholder="Group Name"
              id="namei"
            />
          </p>
          <button className="addgroup" onClick={handleSubmit}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tabs;
