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
  const [radio, setRadio] = useState("Teacher");
  const [isOpen, setIsOpen] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [tabs, setTabs] = useState([]);
  const [time, setTime] = useState(0);
  const data = [
    { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
    { name: "Page B", uv: 500, pv: 2400, amt: 2400 },
  ];

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
  };

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
    setTabs(tabs.filter((_,i) => i != index));
  }

  const handleTime = (e) => {
    setTime(e.target.value);
  };

  return (
    <div class="page-margin tabs">
      <ul class="selected-tab">
        <li
          onClick={() => toggleTab(0)}
          class={toggleState === 0 && "selected"}
        >
          <span className="tab-text">Overview</span>
        </li>
        {tabs.map((i) => (
          <li
            onClick={() => toggleTab(i + 1)}
            class={toggleState === i + 1 && "selected"}
          >
            <span className="tab-text">{i[0]}</span>
          </li>
        ))}
        <li
          onClick={() => toggleTab(tabs.length + 1)}
          class={toggleState === tabs.length + 1 && "selected"}
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
              <div class="simadv">
                <h3>Simulation advancement</h3>
                <div class="content-radiobuttons">
                  <div>
                    <input
                      type="radio"
                      checked={radio === "Teacher"}
                      value="Teacher"
                      onChange={(e) => {
                        setRadio(e.target.value);
                      }}
                    />{" "}
                    Teacher/Facilitator
                  </div>
                  <div>
                    <input
                      type="radio"
                      checked={radio === "Student"}
                      value="Student"
                      onChange={(e) => {
                        setRadio(e.target.value);
                      }}
                    />{" "}
                    Student/Participants
                  </div>
                  <div>
                    <input
                      type="radio"
                      checked={radio === "Timed"}
                      value="Timed"
                      onChange={(e) => {
                        setRadio(e.target.value);
                      }}
                    />{" "}
                    <span>Timed =</span>
                    <input
                      onChange={handleTime}
                      type="text"
                      placeholder="Time"
                      className="content-timeinput"
                    />
                    <span>min</span>
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
              closeTimeoutMS={500}
              ariaHideApp={false}
            >
              <CreateEmail
                addstudent={true}
                gameid={props.gameid}
                title={props.title}
              />
            </Modal>
          </div>
          <h3>Student/participant list:</h3>

          {/* <Button onClick={()=>setIsOpen(true)} class="button">Add</Button>
              <Modal open={isOpen} onClose={()=>setIsOpen(false)}>
              </Modal> */}
          <Table addstudent={false} gameid={props.gameid} title={props.title} />
        </div>
        {tabs.map((i) => (
          <div
            className={
              toggleState === i + 1 ? "content  active-content" : "content"
            }
          >
            <div className="content-header">
              <h2>{i[0]}</h2>
              <div className="content-roomlink">
                {`Room code: `} 
                <a href={`/gamepage/${i[2]}`} target="#">
                  {i[2]}
                </a>
              </div>
              <button
                onClick={() => handleDeleteGroup(i)}
                className="deletegroup"
              >
                Delete Group
              </button>
            </div>
            <hr />
            <div className="groupcontainer">
              <div className="group-column">
                <h3>Chat: </h3>
              </div>
              <div className="group-column">
                <h3>Performance:</h3>
                <div className="chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={data}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <h3>Students / participants in room:</h3>
            <div class="group-table">
              <Table
                addstudent={true}
                gameroom={i}
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
              class="textbox"
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
