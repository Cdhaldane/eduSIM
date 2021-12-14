import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../Table/Table";
import CreateEmail from "../CreateEmail/CreateEmail";
import Modal from "react-modal";
import { useAlertContext } from "../Alerts/AlertContext";
import moment from "moment";
import ConfirmationModal from "../Modal/ConfirmationModal";
import Performance from "../SideBar/Performance";
import { useTranslation } from "react-i18next";

import "./Tabs.css";

function Tabs(props) {
  const [toggleState, setToggleState] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [tabs, setTabs] = useState([]);
  const [time, setTime] = useState(1);
  const [interactionData, setInteractionData] = useState({});
  const [logs, setLogs] = useState({});
  const [viewLogs, setViewLogs] = useState(false);
  const [removeLog, setRemoveLog] = useState(null);
  const [customObjs, setCustomObjs] = useState();
  const [editingName, setEditingName] = useState(false);
  const { t } = useTranslation();

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

    // Get the object data for this game
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstance/:adminid/:gameid', {
      params: {
        adminid: props.adminid,
        gameid: props.gameid
      }
    }).then((res) => {
      if (res.data.game_parameters) {
        // Load saved object data
        const objects = JSON.parse(res.data.game_parameters);
        const customObjs = Object.fromEntries(Object.entries(objects).filter(([key]) =>
          props.customObjNames.includes(key)));
        setCustomObjs(customObjs);
      }
    }).catch(error => console.error(error));
  }, [props.gameid, props.refreshRooms]);

  const toggleTab = (index) => {
    setToggleState(index);
    // for updating controls in admin header
    props.setRoom(tabs[index - 1]);
    if (index > 0 && index < tabs.length + 1) {
      const id = tabs[index - 1][1];
      axios.get(process.env.REACT_APP_API_ORIGIN + "/api/playerrecords/getRoomInteractionBreakdown", {
        params: {
          gameroomid: id,
        },
      }).then((res) => {
        setInteractionData(Object.entries(res.data).map((val) => ({
          name: "Level " + val[0],
          interactions: val[1]
        })));
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

  const handleNewGroup = (e) => {
    // Check if name is empty or a duplicate
    // if (newGroup.trim() === "") {
    //   console.log(tabs);
    //   alertContext.showAlert("Group name cannot be empty.", "warning");
    //   return;
    // }
    // if (tabs.some((tab) => tab[0] === newGroup.trim())) {
    //   alertContext.showAlert("A group with this name already exists. Please pick a new name.", "warning");
    //   return;
    // }

    e.preventDefault();
    let index = tabs.length + 1;
    tabs.forEach(tab => {
      if (tab[0] === `New group ${index}`) index++
    });
    let data = {
      gameinstanceid: props.gameid,
      gameroom_name: `New group ${index}`
    }
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/createRoom', data)
      .then((res) => {
        setTabs([...tabs, [res.data.gameroom_name, res.data.gameroomid, res.data.gameroom_url]]);
        if (props.socket) {
          props.socket.emit("joinRoom", res.data.gameroom_url);
        }
      })
      .catch(error => console.log(error.response));
  }

  const handleGroupName = (e) => {
    if (newName.trim() === "") {
      alertContext.showAlert(t("alert.emptyGroupName"), "warning");
      return;
    }
    if (tabs.some((tab, ind) => tab[0] === newName.trim() && toggleState-1 !== ind)) {
      alertContext.showAlert(t("alert.groupAlreadyExists"), "warning");
      return;
    }
    let data = {
      gameroomid: tabs[toggleState-1][1],
      gameroom_name: newName
    }
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/updateRoomName', data)
      .then((res) => {
        setTabs(tabs.map((val, ind) => {
          if (ind === toggleState - 1) {
            val[0] = newName;
          }
          return val;
        }))
        setEditingName(false);
      })
      .catch(error => console.log(error.response));
  }

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
    setToggleState(0);
    props.setRoom(null);
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

  const getGameLength = (data) => {
    let start = moment(data.gamedata.roomStatus.startTime);
    let end = moment(data.createdAt).add(data.gamedata.roomStatus.timeElapsed || 0, 'milliseconds');
    return moment.duration(start.diff(end)).humanize();
  }

  const downloadJSON = async (object) => {
    const blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "log.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const downloadCSV = async ({ gamedata }) => {
    const parsedMessages = gamedata.messages.map(msg => [
      msg.sender.name,
      msg.sender.role,
      msg.sender.invited ? msg.sender.dbid : '',
      msg.message,
      moment(msg.timeSent).format()
    ].join(','));
    const parsedInteractions = gamedata.interactions.map(int => [
      int.player.name,
      int.player.role,
      int.player.invited ? int.player.dbid : '',
      int.gamepieceId,
      `"` + JSON.stringify(int.parameters).replace(/"([^"]+)":/g, '$1:').replaceAll("\"", "'") + `"`,
      moment(int.timestamp).format()
    ].join(','));

    let content = [
      "Messages", "", "", "", "", "",
      "Interactions", "", "", "", "", ""
    ].join(',') + "\n" + [
      "Name", "Role", "Database ID", "Message", "Timestamp", "",
      "Name", "Role", "Database ID", "Gamepiece", "Parameters", "Timestamp"
    ].join(',') + "\n";

    for (let i = 0; i < Math.max(parsedMessages.length, parsedInteractions.length); i++) {
      let str = "";
      if (parsedMessages[i]) {
        str += parsedMessages[i];
      } else str += ",,,,";
      str += ",,";
      if (parsedInteractions[i]) {
        str += parsedInteractions[i]
      }
      content += str + "\n";
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "log.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleRemoveLog = () => {
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/deleteGameLog', {
      gameactionid: removeLog.id
    }).then((res) => {
      setLogs(prev => ({
        ...prev,
        [removeLog.room]: prev[removeLog.room].filter(val => val.gameactionid !== removeLog.id)
      }));
      setRemoveLog(null);
    }).catch(error => console.log(error.response));
  }

  useEffect(() => {
    props.updateNumTabs(tabs.length);
  }, [tabs]);

  return (
    <>
      {(toggleState > 0 && toggleState < tabs.length + 1 && logs[tabs[toggleState - 1][1]] && logs[tabs[toggleState - 1][1]].length > 0) ? (
        <div className="logs page-margin" hidden={!viewLogs}>
          <div className="logs-show" onClick={() => setViewLogs(!viewLogs)}>
            <h4>{t("admin.displayPreviousRuns")} {viewLogs ? '-' : '+'}</h4>
          </div>
          {logs[tabs[toggleState - 1][1]].map(data => (
            <div className="logrow" key={data.gameactionid} hidden={!viewLogs}>
              <div className="logrow-info">
                <i className="fas fa-scroll"></i>
                <p>
                  {t("admin.startedXLastedY", {
                    time: moment(data.gamedata.roomStatus.startTime).format("MMMM Do, h:mm:ssa"),
                    duration: getGameLength(data)
                  })}
                </p>
              </div>
              <div className="logrow-buttons">
                <button onClick={() => downloadCSV(data)} title={t("admin.downloadCSV")}><i className="fas fa-file-csv"></i></button>
                <button onClick={() => downloadJSON(data)} title={t("admin.downloadJSON")}><i className="fas fa-file-code"></i></button>
                <button onClick={() => setRemoveLog({
                  id: data.gameactionid,
                  room: tabs[toggleState - 1][1]
                })}><i className="fas fa-trash-alt"></i></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="logs-margin" />
      )}
      <div className="page-margin tabs">
        <ul className="selected-tab">
          <li
            onClick={() => toggleTab(0)}
            className={toggleState === 0 ? "selected" : ""}
          >
            <span className="tab-text">{t("admin.overview")}</span>
          </li>
          {tabs.map((tab, i) => (
            <li
              key={i}
              onClick={() => toggleTab(i + 1)}
              className={toggleState === i + 1 ? "selected" : ""}
            >
              <span className="tab-text">{tab[0]}</span>
            </li>
          ))}
          <button
            onClick={handleNewGroup}
            className={toggleState === tabs.length + 1 ? "selected" : ""}
          >
            <span className="tab-add-group">{t("admin.addGroup")}</span>
          </button>
        </ul>
        <div className="content-tabs">
          <div
            className={toggleState === 0 ? "content  active-content" : "content"}
          >
            <div className="content-row">
              <div className="content-settings">
                <h3>{t("admin.settings")}</h3>
                <div className="simadv">
                  <h3>{t("admin.simulationAdvancement")}</h3>
                  <div className="content-radiobuttons">
                    <div>
                      <input
                        type="radio"
                        checked={displayAdvance() === "teacher"}
                        value="teacher"
                        onChange={handleSetAdvancement}
                        disabled={tabs.length === 0}
                      />{" "}
                      {t("admin.teachers")}
                    </div>
                    <div>
                      <input
                        type="radio"
                        checked={displayAdvance() === "student"}
                        value="student"
                        onChange={handleSetAdvancement}
                        disabled={tabs.length === 0}
                      />{" "}
                      {t("admin.students")}
                    </div>
                    <div>
                      <input
                        type="radio"
                        checked={displayAdvance() === "timed"}
                        value="timed"
                        onChange={handleSetAdvancement}
                        disabled={tabs.length === 0}
                      />{" "}
                      <span>{t("admin.timed")} = </span>
                      <input
                        onChange={handleTime}
                        value={time}
                        type="text"
                        placeholder="Time"
                        className="content-timeinput"
                        disabled={tabs.length === 0 || displayAdvance() !== "timed"}
                      />
                      <span>{t("admin.suffixMinutes")}</span>
                    </div>
                  </div>
                </div>
                <div className="simadv">
                  <h3>{t("admin.roleAssignment")}</h3>
                  <div className="content-radiobuttons">
                    <div>
                      <input
                        type="radio"
                        checked={displayRole() === "teacher"}
                        value="teacher"
                        onChange={handleSetRole}
                        disabled={tabs.length === 0}
                      />{" "}
                      {t("admin.teachers")}
                    </div>
                    <div>
                      <input
                        type="radio"
                        checked={displayRole() === "student"}
                        value="student"
                        onChange={handleSetRole}
                        disabled={tabs.length === 0}
                      />{" "}
                      {t("admin.students")}
                    </div>
                    <div>
                      <input
                        type="radio"
                        checked={displayRole() === "random"}
                        value="random"
                        onChange={handleSetRole}
                        disabled={tabs.length === 0}
                      />{" "}
                      {t("admin.random")}
                    </div>
                    <div>
                      <input
                        type="radio"
                        checked={displayRole() === "randomByLevel"}
                        value="randomByLevel"
                        onChange={handleSetRole}
                        disabled={tabs.length === 0}
                      />{" "}
                      {t("admin.randomPerLevel")}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="studentbuttonemail"
              >
                {t("admin.openEmailModal")}
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
            <h3>{t("admin.studentList")}</h3>
            <Table addstudent={false} gameid={props.gameid} title={props.title} />
          </div>
          {tabs.map((tab, i) => (
            <div
              key={i}
              className={
                toggleState === i + 1 ? "content  active-content" : "content"
              }
            >
              <div className="content-header">
                {editingName ? (
                  <div>
                    <input type="text" className="content-inputname" value={newName} onChange={e => setNewName(e.target.value)}></input>
                    <i className="fas fa-check content-editname" onClick={handleGroupName} />
                  </div>
                ) : (
                  <div>
                    <h2>{tab[0]}</h2>
                    <i className="fas fa-pencil-alt content-editname" onClick={() => {
                      setEditingName(true); setNewName(tab[0]);
                    }} />
                  </div>
                )}
                <a className="content-roomlink" href={`/gamepage/${tab[2]}`} target="#">
                {t("admin.joinRoom")}
                </a>
                <button
                  onClick={() => handleDeleteGroup(tab)}
                  className="deletegroup"
                >
                  {t("admin.deleteGroup")}
                </button>
              </div>
              <hr />
              <div className="groupcontainer">
                <div className="group-column">
                  <h3>{t("admin.chat")}</h3>
                  <div className="group-chatlog">
                    <div>
                      {props.chatMessages.map(({ sender, message }) => (
                        <p><b>{sender.name}: </b>{message}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="group-column">
                  <h3>{t("admin.performanceReport")}</h3>
                  <Performance
                    adminMode={true}
                    status={props.roomStatus[Object.keys(props.roomStatus)[0]]
                      ? props.roomStatus[Object.keys(props.roomStatus)[0]].gamepieces : {}}
                    customObjs={customObjs}
                  />
                </div>
              </div>
              <h3>{t("admin.studentsInRoom")}</h3>
              <div className="group-table">
                <Table
                  addstudent={true}
                  gameroom={tab}
                  gameid={props.gameid}
                  title={props.title}
                  players={props.players}
                />
              </div>
            </div>
          ))}
        </div>
        <ConfirmationModal
          visible={!!removeLog}
          hide={() => setRemoveLog(null)}
          confirmFunction={handleRemoveLog}
          confirmMessage={t("admin.deleteLog")}
          message={t("admin.confirmDeleteLog")}
        />
      </div>
    </>
  );
}

export default Tabs;
