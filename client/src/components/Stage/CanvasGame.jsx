import React, { Component } from 'react';
import Level from "../Level/Level";
import Modal from "react-modal";
import CreateRole from "../CreateRoleSelection/CreateRole";
import styled from "styled-components";
import moment from "moment";
import Overlay from "./Overlay";
import { withTranslation } from "react-i18next";

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

    "status",
    "pages"
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
      overlayLayerScale: 1,
      overlayLayerX: 0,
      overlayLayerY: 0,

      startModalOpen: true,
      personalAreaOpen: 0, // 0 is closed, 1 is open
      overlayOpen: false,
      overlayOpenIndex: -1,
      nextLevelOnOverlayClose: false,

      level: 1,
      pageNumber: 6,
      pages: [],

      gameroles: [],
      state: false,
      selectrole: false,
      gameinstanceid: this.props.gameinstance.gameinstanceid,
      adminid: this.props.adminid,
      canvasLoading: true,
      updateRanOnce: false,
    };

    setTimeout(() => {
      this.setState({
        canvasLoading: true
      }, () => {
        this.props.setCanvasLoading(this.state.canvasLoading);
        this.props.reCenter("play");
      });
    }, 1000);
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
            if (Object.keys(this.props.variables).length > 0) vars = { ...vars, ...this.props.variables };
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
    if (Object.keys(this.props.variables).length > 0) vars = { ...vars, ...this.props.variables };
    
    let trueValue = isNaN(conditions.trueValue) ? conditions.trueValue : parseInt(conditions.trueValue);
    let trueValueAlt = isNaN(conditions.trueValueAlt) ? conditions.trueValueAlt : parseInt(conditions.trueValueAlt);

    let val = isNaN(val) ? vars[conditions.varName] : parseInt(vars[conditions.varName]);
    let varLen = isNaN(val) ? (val || "").length : val;

    switch (conditions.condition) {
      case "isequal":
        return val == trueValue;
      case "isgreater":
        return varLen > trueValue;
      case "isless":
        return varLen < trueValue;
      case "between":
        return varLen <= trueValueAlt && varLen >= trueValue;
      case "negative":
        return !val;
      case "onchange":
        return sessionStorage.lastSetVar === conditions.varName
      default: return !!val;
    }
  }

  sendInteraction = (gamepieceId, parameters) => {
    this.props.socket.emit("interaction", {
      gamepieceId,
      parameters,
      sameState: true
    })
  }

  getPage = (index) => {
    return this.state.pages[this.state.level - 1] || {};
  }

  refresh = () => {
    this.forceUpdate();
    this.props.refresh();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.canvasLoading !== this.state.canvasLoading) {
      this.props.setCanvasLoading(this.state.canvasLoading);
    }

    // Show overlay if it is the next page and a pageEnter overlay is available
    const page = this.getPage(this.state.level - 1);
    let overlayPageEnter = null;
    for (let i = 0; i < page.overlays.length; i++) {
      if (page.overlays[i].overlayOpenOption === "pageEnter") {
        overlayPageEnter = page.overlays[i];
        break;
      }
    }
    if (
      !this.state.overlayOpen &&
      overlayPageEnter &&
      (prevState.level < this.state.level || !this.state.updateRanOnce)
    ) {
      this.setState({
        overlayOpenIndex: overlayPageEnter.id,
        overlayOpen: true
      });
    }

    if (!this.state.updateRanOnce) {
      this.setState({
        updateRanOnce: true
      })
    }

    // This passes info all the way up to the App component so that it can be used in functions
    // shared between Canvas (Simulation Edit Mode) and CanvasGame (Simulation Play Mode)
    if (Object.keys(this.state).filter(key => this.state[key] !== prevState[key]).length) {
      const userId = JSON.parse(localStorage.getItem('userInfo')) ?
        JSON.parse(localStorage.getItem('userInfo')).dbid : null;

      this.props.setGamePlayProps({
        refresh: this.refresh,
        setState: this.setState,
        state: this.state,
        refs: this.refs,
        userId: userId,
        getInteractiveProps: this.getInteractiveProps,
        getVariableProps: this.getVariableProps,
        checkObjConditions: this.checkObjConditions,
        formatTextMacros: this.formatTextMacros,
        sendInteraction: this.sendInteraction,
        dragLayer: () => {},
        onObjectDragMove: (obj, e) => {
          console.log(obj, e);
          this.props.socket.emit("interaction", {
            gamepieceId: obj.id,
            parameters: {
              x: e.target.x(),
              y: e.target.y()
            }
          })
        }
      });

      this.props.setUserId(userId);

      // Recenter if the canvas has changed
      // This includes opening/closing personal and overlay areas and changing levels
      if (
        this.state.personalAreaOpen !== prevState.personalAreaOpen ||
        this.state.overlayOpen !== prevState.overlayOpen ||
        this.state.level !== prevState.level
      ) {
        const layer = this.state.personalAreaOpen ? "personal" :
          (this.state.overlayOpen ? "overlay" : "group");
        this.setState({
          canvasLoading: true
        });
        setTimeout(() => this.props.reCenter("play", layer), 300);
      }
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

    if (this.state.pages[this.state.level - 1]) {
      document.querySelector(':root').style.setProperty('--primary', this.state.pages[this.state.level - 1].primaryColor);
      this.props.setPageColor(this.state.pages[this.state.level - 1].groupColor);
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
    localStorage.setItem('userInfo', JSON.stringify({ role, name, dbid: this.props.initialUserId || id }));
  }

  componentDidMount() {
    this.setState({
      selectrole: true
    })

    try {
      const objects = JSON.parse(this.props.gameinstance.game_parameters);

      this.setState({
        pageNumber: objects.numberOfPages
      })

      this.savedObjects.forEach((object) => {
        this.setState({
          [object]: objects[object] || []
        });
      });
    } catch (e) { };

    if (localStorage.userInfo) {
      const info = JSON.parse(localStorage.userInfo);
      if (this.props.alert) this.props.alert(this.props.t("alert.loggedInAsX", { name: info.name }), "info");
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

  getVariableProps = () => ({
    updateVariable: (name, value, increment) => {
      this.props.socket.emit("varChange", {
        name, value, increment
      })
    },
    variables: this.props.variables
  });

  handleLevel = (e) => {
    this.props.socket.emit("goToPage", {
      level: e
    });
  }

  toggleModal = () => {
    this.setState({
      startModalOpen: !this.state.startModalOpen
    });
  }

  componentWillReceiveProps = ({ level }) => {
    if (level) {
      this.setState({
        level
      })
    }
  }

  setOverlayOpen = (val, index) => {
    this.setState({
      overlayOpen: val,
      overlayOpenIndex: index
    });
  }

  render() {
    return (
      <React.Fragment>
        {this.state.selectrole && (
          <div>
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
        )}

        {/* The button to view the overlay */}
        {this.getPage(this.state.level - 1).overlays && (
          <>
            {this.getPage(this.state.level - 1).overlays.map((overlay, i) => {
              if (!overlay.hideBtn) {
                let nonHiddenI = 0;
                for (let j = 0; j < i; j++) {
                  const o = this.getPage(this.state.level - 1).overlays[j];
                  if (!o.hideBtn) {
                    nonHiddenI++;
                  }
                }
                return (
                  <div
                    key={i}
                    className="overlayButton"
                    onClick={() => this.setOverlayOpen(true, overlay.id)}
                    style={{
                      top: `${70 * (nonHiddenI + 1)}px`
                    }}
                  >
                    <i className="icons fa fa-window-restore" />
                  </div>
                );
              } else {
                return;
              }
            })}
          </>
        )}

        {/* ---- OVERLAY CANVAS ---- */}
        {this.state.overlayOpen && (
          <Overlay
            playMode={true}
            closeOverlay={() => {
              this.setState({
                overlayOpen: false,
                nextLevelOnOverlayClose: false,
                overlayOpenIndex: -1
              });

              if (this.state.nextLevelOnOverlayClose) {
                this.handleLevel(this.state.level + 1);
              }
            }}
            state={this.state}
            propsIn={this.props}
            setRefs={(type, ref) => {
              this.refs[type] = ref;
            }}
          />
        )}

        {/* ---- GROUP CANVAS ---- */}
        <div id="groupGameContainer" className="playModeCanvasContainer">
          <Stage
            height={this.props.canvasHeights.group ? this.props.canvasHeights.group : window.innerHeight}
            width={window.innerWidth}
            ref="graphicStage"
          >
            {this.props.loadObjects("group", "play")}
          </Stage>
        </div>


        <div className="eheader">
          <Level
            handlePageCloseOverlay={(index) => {
              this.setState({
                overlayOpen: true,
                overlayOpenIndex: index,
                nextLevelOnOverlayClose: true
              });
            }}
            page={this.getPage(this.state.level - 1)}
            number={this.state.pageNumber}
            ptype={this.state.ptype}
            level={this.handleLevel}
            gamepage
            levelVal={this.state.level}
            freeAdvance={this.props.freeAdvance}
            disableNext={this.props.disableNext}
            countdown={this.props.countdown}
          />
          <div>

            {/* ---- PERSONAL CANVAS ---- */}
            <div
              id="personalInfoContainer"
              className={"info" + this.state.personalAreaOpen + " personalAreaAnimOn"}
              style={{
                backgroundColor: this.state.personalAreaOpen ? this.state.pages[this.state.level - 1].personalColor : "transparent"
              }}
            >
              <div id="playModeRoleLabel"><b>{this.props.t("common.role")}: </b>{this.state.rolelevel}</div>
              <div
                id="personalGameContainer"
                className="personalAreaStageContainer playModeCanvasContainer"
              >
                <Stage
                  style={{ position: "relative", overflow: "hidden" }}
                  height={this.props.canvasHeights.personal ? this.props.canvasHeights.personal :
                    (document.getElementById("personalGameContainer") ?
                      document.getElementById("personalGameContainer").clientHeight * 0.95 : 0)}
                  width={document.getElementById("personalGameContainer") ?
                    document.getElementById("personalGameContainer").clientWidth : 0}
                  ref="personalAreaStage"
                >
                  {this.props.loadObjects("personal", "play")}
                </Stage>
              </div>
              {(this.state.personalAreaOpen !== 1)
                ? <button
                  className="personalAreaToggle"
                  onClick={() => this.setState({ personalAreaOpen: 1 })}>
                  <i className="fas fa-angle-up fa-3x" />
                </button>
                : <button
                  className="personalAreaToggle"
                  onClick={() => this.setState({ personalAreaOpen: 0 })}>
                  <i className="fas fa-angle-down fa-3x" />
                </button>
              }
            </div>
          </div>
        </div>
        <EndScreen open={this.state.level > this.state.pageNumber}>
          <p>{this.props.t("game.thanksForJoining")}</p>
          {this.props.freeAdvance && (
            <button onClick={() => this.handleLevel(1)}>{this.props.t("game.resetSimulation")}</button>
          )}
        </EndScreen>
      </React.Fragment>
    );
  }
}
export default withTranslation()(Graphics);
