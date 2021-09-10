import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Tabs.css";
import Table from "../Table/Table";
import CreateEmail from "../CreateEmail/CreateEmail";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Modal from "react-modal";

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

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/playerrecords/getRooms/:gameinstanceid", {
        params: {
          gameinstanceid: [props.gameid],
        },
      })
      .then((res) => {
        console.log(res);
        let cart = [];
        for (let i = 0; i < res.data.length; i++) {
          cart.push([res.data[i].gameroom_name, res.data[i].gameroomid]);
          console.log(cart);
        }
        setTabs(cart);
      })
      .catch((error) => console.log(error.response));
  }, [props.gameid]);

  const toggleTab = (index) => {
    setToggleState(index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setToggleState(toggleState + 1);
    setTabs([...tabs, newGroup]);
    let data = {
      gameinstanceid: props.gameid,
      gameroom_name: newGroup,
    };
    axios
      .post("http://localhost:5000/api/playerrecords/createRoom", data)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => console.log(error.response));
  };

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
    console.log(tabs);
    setToggleState(0);
    axios
      .delete(
        "http://localhost:5000/api/playerrecords/deleteRoom/:gameroomid",
        {
          params: {
            id: tabs[index][1],
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((error) => console.log(error.response));
    delete tabs[index];
  };

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
            <button
              onClick={() => handleDeleteGroup(i)}
              className="deletegroup"
            >
              Delete Group
            </button>
            <h2>{i[0]}</h2>
            <hr />
            <div className="groupcontainer">
              <h3>Chat: </h3>

              <h3>Performance:</h3>
              <div id="chart">
                <LineChart
                  width={600}
                  height={300}
                  data={data}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </div>
              <h3>Students / participants in room:</h3>
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
