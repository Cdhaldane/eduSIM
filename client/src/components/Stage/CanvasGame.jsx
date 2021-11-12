import React, { Component } from 'react';
import Level from "../Level/Level";
import Modal from "react-modal";
import CreateRole from "../CreateRoleSelection/CreateRole";
import styled from "styled-components";
import moment from "moment";

import {
  Stage,
  Layer
} from "react-konva";

const EndScreen = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: #e5e5e5;
  top: 0;
  left: 0;
  z-index: 5;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: opacity .4s;
  ${(p) => !p.open && `
    opacity: 0;
    pointer-events: none; 
  `}
  & > p {
    font-size: 3em;
  }
  & > button {
    align-self: center;
    font-family: inherit;
    padding: 10px 20px;
    font-size: 1em;
    color: white;
    background-color: var(--primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: none;
    text-align: center;
    cursor: pointer;
    border-radius: 10px;
    margin-top: 10px;
  }
`;

class Graphics extends Component {

  customObjects = [
    ...this.props.customObjectsLabels
  ]

  savedObjects = [
    // Objects
    ...this.props.savedObjects,

    "status"
  ];

  constructor(props) {
    super(props);

    this.setState = this.setState.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);

    let objectState = {};
    for (let i = 0; i < this.props.savedObjects.length; i++) {
      objectState = {
        ...objectState,
        [this.props.savedObjects[i]]: []
      }
    }

    this.state = {
      // Objects
      ...objectState,

      // Layer Position and Scales
      groupLayerScale: 1,
      groupLayerX: 0,
      groupLayerY: 0,
      personalLayerScale: 1,
      personalLayerX: 0,
      personalLayerY: 0,

      gameroles: [],
      open: 0,
      isOpen: true,
      state: false,
      selectrole: false,
      gameinstanceid: this.props.gameinstance.gameinstanceid,
      adminid: this.props.adminid,
      level: 1,
      pageNumber: 6
    };

    setTimeout(() => this.props.reCenter("play"), 100);
  }

  formatTextMacros = (text) => {
    let start = false, newText = text;
    for (let i = 0; i < newText.length; i++) {
      const c = newText[i];
      if (c === "{") start = i;
      if (c === "}" && start !== false) {
        let content, key;
        switch (key = newText.slice(start + 1, i)) {
          case "playername":
            content = this.props.players[this.props.socket.id]?.name;
            break;
          case "playerrole":
            content = this.props.players[this.props.socket.id]?.role || "(no role selected)";
            break;
          case "lastsetvar":
            content = sessionStorage.lastSetVar;
            break;
          case "currentdate":
            content = moment().format("dddd, MMMM Do YYYY");
            break;
          default:
            let vars = {};
            if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
            content = vars[key];
        }
        newText = newText.slice(0, start) + (content !== undefined ? content : "unknown") + newText.slice(i + 1);
        i = start;
        start = false;
      }
    }
    return newText;
  };

  checkObjConditions = (conditions) => {
    if (!conditions || !conditions.varName) return true;
    let vars = {};
    if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
    if (!!sessionStorage.lastSetVar) vars.lastsetvar = sessionStorage.lastSetVar;
    switch (conditions.condition) {
      case "equalto":
        return vars[conditions.varName] == conditions.trueValue
      case "negative":
        return !vars[conditions.varName];
      case "onchange":
        return sessionStorage.lastSetVar === conditions.varName
      default: return !!vars[conditions.varName];
    }
  }

  sendInteraction = (gamepieceId, parameters) => {
    this.props.socket.emit("interaction", {
      gamepieceId,
      parameters,
      sameState: true
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    // This passes info all the way up to the App component so that it can be used in functions
    // shared between Canvas (Simulation Edit Mode) and CanvasGame (Simulation Play Mode)
    if (Object.keys(this.state).filter(key => this.state[key] !== prevState[key]).length) {
      const userId = JSON.parse(sessionStorage.getItem('userInfo')) ?
        JSON.parse(sessionStorage.getItem('userInfo')).dbid : null;

      this.props.setGamePlayProps({
        refresh: this.forceUpdate,
        setState: this.setState,
        state: this.state,
        refs: this.refs,
        userId: userId,
        getInteractiveProps: this.getInteractiveProps,
        checkObjConditions: this.checkObjConditions,
        formatTextMacros: this.formatTextMacros,
        sendInteraction: this.sendInteraction
      });

      this.props.setUserId(userId);
    }

    // Update the custom objects state in the parent component (if custom objs changed)
    for (let i = 0; i < this.customObjects.length; i++) {
      if (this.state[this.customObjects[i]] !== prevState[this.customObjects[i]]) {
        const customObjs = {};
        for (let j = 0; j < this.customObjects.length; j++) {
          customObjs[this.customObjects[j]] = this.state[this.customObjects[j]];
        }
        this.props.setCustomObjs(customObjs);
        break;
      }
    }
  }

  handlePlayerInfo = ({ role: initRole, name, dbid }) => {
    this.toggleModal();
    let role = initRole;
    if (this.props.roleSelection === "random") role = -1;
    else if (this.props.roleSelection === "randomByLevel") role = -2; //seeded
    this.setState({
      rolelevel: role || ''
    });
    let id = dbid
    if (!dbid) id = Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
    this.props.socket.emit("playerUpdate", {
      role, name, dbid: this.props.initialUserId || id, invited: !!this.props.initialUserId
    })
    sessionStorage.setItem('userInfo', JSON.stringify({ role, name, dbid: this.props.initialUserId || id }));
  }

  componentDidMount() {
    this.setState({
      selectrole: true
    })

    try {
      const objects = JSON.parse(this.props.gameinstance.game_parameters);

      this.savedObjects.forEach((object) => {
        this.setState({
          [object]: objects[object]
        });
      });
    } catch (e) { };

    if (sessionStorage.userInfo) {
      const info = JSON.parse(sessionStorage.userInfo);
      if (this.props.alert) this.props.alert("Logged back in as: " + info.name, "info");
      this.handlePlayerInfo(info);
    }

    // Reposition / scale objects on screen resize
    let resizeTimeout;
    window.onresize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.props.reCenter("play");
      }, 100);
    };
  }

  getInteractiveProps = (id) => ({
    updateStatus: (parameters) => {
      this.props.socket.emit("interaction", {
        gamepieceId: id,
        parameters
      })
    },
    status: this.props.gamepieceStatus[id] || {}
  });

  handleLevel = (e) => {
    this.props.socket.emit("goToPage", {
      level: e
    });
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  componentWillReceiveProps = ({ level }) => {
    if (level) {
      this.setState({
        level
      })
    }
  }

  render() {

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0.0, "red");
    gradient.addColorStop(1 / 6, "orange");
    gradient.addColorStop(2 / 6, "yellow");
    gradient.addColorStop(3 / 6, "green");
    gradient.addColorStop(4 / 6, "aqua");
    gradient.addColorStop(5 / 6, "blue");
    gradient.addColorStop(1.0, "purple");

    return (
      <React.Fragment>
        {this.state.selectrole && <div>
          <Modal
            isOpen={!this.props.players[this.props.socket.id]}
            contentLabel="My dialog"
            className="createmodaltab"
            overlayClassName="myoverlaytab"
            closeTimeoutMS={250}
            ariaHideApp={false}
          >
            <CreateRole
              gameid={this.state.gameinstanceid}
              handleSubmit={this.handlePlayerInfo}
              gameroles={this.state.gameroles}
              players={this.props.players}
              initialUserInfo={this.props.initialUserInfo}
              roleSelection={this.props.roleSelection}
            />
          </Modal>
        </div>
        }
        <div>
          <Stage
            height={window.innerHeight}
            width={window.innerWidth}
            ref="graphicStage"
          >
            <Layer
              ref="groupAreaLayer"
              scaleX={this.state.groupLayerScale}
              scaleY={this.state.groupLayerScale}
              x={this.state.groupLayerX}
              y={this.state.groupLayerY}
              height={window.innerHeight}
              width={window.innerWidth}
            >
              {this.props.loadObjects("group", "play")}
            </Layer>
          </Stage>
        </div>
        <div className="eheader">
          <Level
            number={this.state.pageNumber}
            ptype={this.state.ptype}
            level={this.handleLevel}
            gamepage
            levelVal={this.state.level}
            freeAdvance={this.props.freeAdvance}
          />
          <div>
            <div className={"info" + this.state.open}>
              <div className="personalAreaStageContainer" id="personalGameContainer">
                <Stage
                  style={{ position: "relative", overflow: "hidden" }}
                  height={document.getElementById("personalGameContainer") ?
                    document.getElementById("personalGameContainer").clientHeight : 0}
                  width={document.getElementById("personalGameContainer") ?
                    document.getElementById("personalGameContainer").clientWidth : 0}
                  ref="personalAreaStage"
                >
                  <Layer
                    ref="personalAreaLayer"
                    name="personal"
                    scaleX={this.state.personalLayerScale}
                    scaleY={this.state.personalLayerScale}
                    x={this.state.personalLayerX}
                    y={this.state.personalLayerY}
                    height={window.innerHeight}
                    width={window.innerWidth}
                    draggable={false}
                  >
                    {this.props.loadObjects("personal", "play")}
                  </Layer>
                </Stage>
              </div>
              {(this.state.open !== 1)
                ? <button className="personalAreaToggle" onClick={() => this.setState({ open: 1 })}>
                  <i className="fas fa-caret-square-up fa-3x" />
                </button>
                : <button className="personalAreaToggle" onClick={() => this.setState({ open: 0 })}>
                  <i className="fas fa-caret-square-down fa-3x" />
                </button>
              }
            </div>
          </div>
        </div>
        <EndScreen open={this.state.level > 6}>
          <p>Thank you for joining!</p>
          {this.props.freeAdvance && (
            <button onClick={() => this.handleLevel(1)}>Reset simulation</button>
          )}
        </EndScreen>
      </React.Fragment>
    );
  }
}
export default Graphics;
