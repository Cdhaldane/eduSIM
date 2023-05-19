import React, { Component } from 'react';
import Level from "../Level/Level";
import Modal from "react-modal";
import CreateRole from "../CreateRoleSelection/CreateRole";
import styled from "styled-components";
import moment from "moment";
import { OrderedSet } from "immutable";
import Overlay from "./Overlay";
import { withTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import { throttle, debounce } from 'lodash';

import {
  EditorState,
  SelectionState,
  convertToRaw,
  convertFromRaw,
  Modifier
} from 'draft-js';

import {
  Stage
} from "react-konva";

import Layers from "../../../public/icons/layers.svg"
import Up from "../../../public/icons/chevron-up.svg"
import Down from "../../../public/icons/chevron-down.svg"

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
    "pages",
    "overlayImage"
  ];

  constructor(props) {
    console.log(props)
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
      nextLevel: 2,
      pageNumber: 6,
      pages: [],
      end: false,

      gameroles: [],
      state: false,
      selectrole: false,
      gameinstanceid: this.props.gameinstance.gameinstanceid,
      adminid: this.props.adminid,
      canvasLoading: true,
      updateRanOnce: false,

      dragTick: 0
    };

    setTimeout(() => {
      this.setState({
        canvasLoading: true
      }, () => {
        this.props.setCanvasLoading(this.state.canvasLoading);
        this.props.reCenter("play");
      });
    }, 0);
  }

  // Replaces variables in text content (stored in {})
  formatTextMacros = (simple, text) => {
    let newText;
    let editorContent;
    let editorState;
    let blocks;
    // Simple mode modifies a string, Rich text mode modifies an EditorState (draft.js)
    if (simple) {
      newText = text;
    } else {
      editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(text)));
      editorContent = editorState.getCurrentContent();
      newText = editorContent.getPlainText('\u0001');
      blocks = editorContent.getBlocksAsArray().map(block => [block.getKey(), block.getText()]);
    }
    let start = false;
    if (simple) {
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
    } else {
      // Go block by block
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      const varKeys = Object.keys(vars);
      for (let blockNum = 0; blockNum < blocks.length; blockNum++) {
        const blockKey = blocks[blockNum][0];
        const blockText = blocks[blockNum][1];
        for (let varNum = 0; varNum < varKeys.length; varNum++) {
          if (blockText.includes(`{${varKeys[varNum]}}`)) {
            // Replace the text
            const selectionStart = blockText.indexOf(`{${varKeys[varNum]}}`);
            const selectionEnd = selectionStart + varKeys[varNum].length + 2
            const selection = SelectionState.createEmpty(blockKey).merge({
              focusOffset: selectionEnd,
              anchorOffset: selectionStart,
            });

            let charList = editorContent.getBlockForKey(blockKey).getCharacterList();
            for (let i = 0; i < charList.size; i++) {
              if (i < selectionStart || i > selectionEnd) {
                charList = charList.set(i, null);
              }
            }
            const textStyles = charList.reduce((styles, c) => {
              if (styles && c) {
                return styles.union(c.getStyle());
              } else {
                return styles;
              }
            }, OrderedSet());

            editorContent = Modifier.replaceText(
              editorContent,
              selection,
              vars[varKeys[varNum]].toString(),
              textStyles
            );
          }
        }
      }
      const newEditorState = EditorState.push(
        editorState,
        editorContent,
        'remove-range'
      );
      return JSON.stringify(convertToRaw(newEditorState.getCurrentContent()));
    }
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

  getDragProps = (id) => {
    const obj = this.props.gamepieceStatus[id] || {};
    const dbid = JSON.parse(localStorage.getItem('userInfo'))?.dbid;
    const synched = obj[dbid];
    if (
      dbid &&
      (obj.x && obj.y || obj[dbid]) &&
      obj.dragging !== dbid
    ) {
      return {
        x: synched ? synched.x : obj.x,
        y: synched ? synched.y : obj.y,
        ...(obj.dragging ? {
          opacity: 0.7,
          draggable: false
        } : {})
      };
    } else return {};
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

  // for drag calculations
  realWidth = ({ width, radiusX }) => {
    if (!width && radiusX) {
      return radiusX * 2;
    } return width;
  }
  realHeight = ({ height, radiusY }) => {
    if (!height && radiusY) {
      return radiusY * 2;
    } return height;
  }
  originCenter = (value, name) => {
    return (name.startsWith("ellipses") ||
      name.startsWith("stars") ||
      name.startsWith("triangles")) ? 0 : value;
  }

  renderOverlay = (page) => {
    if (!this.state.overlayOpen) {
      this.setState({
        overlayOpenIndex: page.id,
        overlayOpen: true
      });
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.canvasLoading !== this.state.canvasLoading) {
      this.props.setCanvasLoading(this.state.canvasLoading);
    }
    // Show overlay if it is the next page and a pageEnter overlay is available
    const page = this.getPage(this.state.level - 1);
    let overlayPageEnter = null;
    let overlayCondition = null;
    if (page?.overlays) {
      for (let i = 0; i < page.overlays.length; i++) {
        if (page.overlays[i].overlayOpenOption === "pageEnter") {
          overlayPageEnter = page.overlays[i];
          break;
        }
        if (page.overlays[i].overlayCondition) {
          let conditions = page.overlays[i].overlayCondition.conditions

          if (conditions != undefined) {
            let overlayCheck = this.checkObjConditions(conditions)
            if (overlayCheck) {
              overlayCondition = page.overlays[i];
              this.renderOverlay(overlayCondition)
              break;
            }

          }

        }
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
        getPageProps: this.getPageProps,
        checkObjConditions: this.checkObjConditions,
        formatTextMacros: this.formatTextMacros,
        getDragProps: this.getDragProps,
        sendInteraction: this.sendInteraction,
        dragLayer: () => { },
        handleDragEnd: (obj, e) => {
          this.setState({
            dragTick: 0
          });
          const synched = !obj.infolevel && !obj.overlay;
          if (this.state.dragTick == 0) {
            this.props.socket.emit("interaction", {
              gamepieceId: obj.id,
              parameters: {
                ...this.props.gamepieceStatus[obj.id],
                [JSON.parse(localStorage.getItem('userInfo')).dbid]: synched ? null :
                  {
                    x: e.target.x(),
                    y: e.target.y()
                  },
                x: synched ? e.target.x() : null,
                y: synched ? e.target.y() : null,
                dragging: null
              }
            });
          }
        },
        onObjectDragMove: (obj, e) => {
          // Bound the drag to the edge of the screen
          const objRef = this.refs[obj.id];
          const topPad = document.getElementById("levelContainer").clientHeight;
          const stage = objRef.getLayer();
          const screenRect = {
            x: (-stage.x() + (!this.state.overlayOpen && !this.state.personalAreaOpen ? 70 : 0)) / stage.scaleX(),
            y: (-stage.y() + (!this.state.overlayOpen && !this.state.personalAreaOpen ? topPad : 0)) / stage.scaleY(),
            width: (stage.width() - (objRef.getClientRect().width /
              (obj.id.includes("ellipse") ? 2 : 1))) / stage.scaleX(),
            height: (stage.height() - (objRef.getClientRect().height /
              (obj.id.includes("ellipse") ? 2 : 1))) / stage.scaleY()
          };
          objRef.y(Math.max(objRef.y(), screenRect.y)); // Top Bound
          objRef.y(Math.min(objRef.y(), screenRect.y + screenRect.height)); // Bottom Bound
          objRef.x(Math.max(objRef.x(), screenRect.x)); // Left Bound
          objRef.x(Math.min(objRef.x(), screenRect.x + screenRect.width)); // Right Bound

          if (!obj.infolevel && !obj.overlay) {
            [
              ...this.state.images,
              ...this.state.rectangles,
              ...this.state.ellipses,
              ...this.state.triangles,
              ...this.state.stars,
              ...this.state.texts
            ].filter(img => (
              img.rolelevel === obj.rolelevel &&
              img.level === obj.level &&
              img.overlay === obj.overlay &&
              img.overlayIndex === obj.overlayIndex &&
              img.id !== obj.id &&
              img.anchor
            )).forEach(({ x, y, width, height, radiusX, radiusY, id }) => {
              let sX = x, sY = y;
              if (this.props.gamepieceStatus[id]) {
                sX = this.props.gamepieceStatus[id].x;
                sY = this.props.gamepieceStatus[id].y;
              }
              console.log(obj)
              let sW = this.realWidth({ width, radiusX }), sH = this.realHeight({ height, radiusY });
              const xDist = Math.abs(
                (e.target.x() + this.originCenter(this.realWidth(obj) / 2, obj.id)) -
                (sX + this.originCenter(sW / 2, id))
              );
              const yDist = Math.abs(
                (e.target.y() + this.originCenter(this.realHeight(obj) / 2, obj.id)) -
                (sY + this.originCenter(sH / 2, id))
              );
              if (xDist < sW / 2 && yDist < sH / 2) {
                e.target.x(sX + this.originCenter(sW / 2, id) - this.originCenter(this.realWidth(obj) / 2, obj.id));
                e.target.y(sY + this.originCenter(sH / 2, id) - this.originCenter(this.realHeight(obj) / 2, obj.id));
              }
            });

            // What is this?
            // this.setState({
            //   dragTick: (this.state.dragTick + 1) % 4
            // });
            if (this.state.dragTick == 0) {
              // The drag ticking ensures that this does not run too often
              // Update object with latest drag position
              this.props.socket.emit("interaction", {
                gamepieceId: obj.id,
                parameters: {
                  x: e.target.x(),
                  y: e.target.y(),
                  dragging: userId
                }
              });
            }
          }
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
        setTimeout(() => {
          this.props.reCenter("play", layer, this.state.level !== prevState.level ? "resize" : "normal")
        }, 300);
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
    let gameid = localStorage.gameid;
    if (!dbid) id = Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
    this.props.socket.emit("playerUpdate", {
      role, name, dbid: this.props.initialUserId || id, invited: !!this.props.initialUserId
    })
    localStorage.setItem('userInfo', JSON.stringify({ gameid, role, name, dbid: this.props.initialUserId || id }));
  }

  componentDidMount() {
    this.setState({
      selectrole: true
    })
    this.setState({
      nextLevel: this.state.level + 1
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
    } catch (e) { console.log(e) };

    if (localStorage.userInfo) {
      if (JSON.parse(localStorage.userInfo).gameid == localStorage.gameid) {
        const info = JSON.parse(localStorage.userInfo);
        if (this.props.alert) this.props.alert(this.props.t("alert.loggedInAsX", { name: info.name }), "info");
        this.handlePlayerInfo(info);
      }
    }

    // Reposition / scale objects on screen resize
    let resizeTimeout;
    window.onresize = () => {
      clearTimeout(resizeTimeout);
      const layer = this.state.overlayOpen ? "overlay" :
        (this.state.personalAreaOpen ? "personal" : "group");
      resizeTimeout = setTimeout(() => {
        this.props.reCenter("play", layer, "resize");
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
    variables: this.props.variables,
    interactions: this.props.ints,
    conditions: this.props.cons
  });

  getPageProps = () => ({
    handleButtonPage: (e) => {
      this.props.socket.emit("oneToPageSingle", {
        level: e,
      });
    },
  });

  handleVariable = (name, value) => {
    if (this.props.variables[name] !== value) {
      this.props.socket.emit("varChange", {
        name, value
      })
    }
  }

  handleLevel = (e) => {
    this.props.socket.emit("goToPage", {
      level: e
    });
  }
  handleEnd = (e) => {
    this.setState({
      end: true
    })
  }
  handleRestart = () => {
    this.props.socket.emit("goToPage", {
      level: 1
    });
    this.setState({
      end: false
    })

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


  handleCollisions = () => {
    this.props.trigs.map((trigger) => {
      let shapeName1 = trigger[0];
      let shapeName2 = trigger[1];
      let variable = trigger[2];
      let shape1, shape2;
      let shapes = this.refs.graphicStage.getStage().children[0].children.map(child => child);
      shapes.map(shape => {
        if (shape.attrs.id === shapeName1) {
          shape1 = shape.attrs;
        } else if (shape.attrs.id === shapeName2) {
          shape2 = shape.attrs;
        }
      });
      if (shape1 && shape2) {
        let sX = shape2.x;
        let sY = shape2.y;
        let sW = this.realWidth({ width: shape2.width, radiusX: shape2.radiusX });
        let sH = this.realHeight({ height: shape2.height, radiusY: shape2.radiusY });

        const xDist = Math.abs(
          (shape1.x + this.originCenter(shape1.width / 2, shape1.id)) -
          (sX + this.originCenter(sW / 2, shape2.id))
        );
        const yDist = Math.abs(
          (shape1.y + this.originCenter(shape1.height / 2, shape1.id)) -
          (sY + this.originCenter(sH / 2, shape2.id))
        );
        if(isNaN(xDist) || isNaN(yDist)) return false;
      
        if (xDist < sW / 2 && yDist < sH / 2) {
          this.props.socket.emit("varChange", {
            name: variable, value: !this.props.variables[variable]
          })
        } 
        
        }

        return false;
      })
  }


  contextMenuEventShortcuts = (event) => {
    const x = 88,
      deleteKey = 46,
      copy = 67,
      paste = 86,
      z = 90,
      y = 89,
      r = 82;
    if (event.shiftKey && event.keyCode === r) {
      this.props.reCenter("play");
    } else if (event.altKey && event.keyCode === r) {
      // Print Info (FOR DEBUGGING)
      console.log("Refs:");
      console.log({ ...this.refs });
      console.log("State:");
      console.log({ ...this.state });
    }
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
                    onClick={() => {
                      if (this.state.personalAreaOpen) return;
                      this.setOverlayOpen(true, overlay.id);
                    }}
                    style={{
                      top: window.matchMedia("(orientation: portrait)").matches ? 100 : `${70 * (nonHiddenI + 1)}px`
                    }}
                  >
                    {!this.state.overlayImage.length ? (
                      <i><Layers className="icon overlay-icon" /></i>
                    ) : (
                      <Image
                        className="overlayIcons"
                        cloudName="uottawaedusim"
                        publicId={
                          "https://res.cloudinary.com/uottawaedusim/image/upload/" + this.state.overlayImage
                        }
                      />
                    )}
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
            handleLevel={this.handleLevel}
            state={this.state}
            propsIn={this.props}
            setRefs={(type, ref) => {
              this.refs[type] = ref;
            }}
          />
        )}

        {/* ---- GROUP CANVAS ---- */}
        <div tabIndex="0" onKeyDown={this.contextMenuEventShortcuts} id="groupGameContainer" className="playModeCanvasContainer">
          <Stage
            height={this.props.canvasHeights.group ? this.props.canvasHeights.group : window.innerHeight}
            width={window.innerWidth}
            ref="graphicStage"
            onDragMove={this.handleCollisions}
          >
            {!this.state.personalAreaOpen && !this.state.overlayOpen ? this.props.loadObjects("group", "play") : null}
          </Stage>
        </div>
        <div className="eheader">
          <Level
            handlePageCloseOverlay={(index) => {
              this.setState({
                overlayOpen: false,
                nextLevelOnOverlayClose: false,
                overlayOpenIndex: -1
              });
            }}
            handlePageOpenOverlay={(index) => {
              this.setState({
                overlayOpen: true,
                overlayOpenIndex: index
              });
            }}
            socket={this.props.socket}
            overlay={this.state.overlayOpen}
            variables={this.props.variables}
            alerts={this.props.alerts}
            cons={this.props.cons}
            ints={this.props.ints}
            page={this.getPage(this.state.level - 1)}
            number={this.state.pageNumber}
            ptype={this.state.ptype}
            level={this.handleLevel}
            handleLevel={this.props.handleLevel}
            realLevel={this.props.realLevel}
            gamepage
            updateVariable={this.handleVariable}
            levelVal={this.state.level}
            end={this.handleEnd}
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
                backgroundColor: this.state.personalAreaOpen ? this.state.pages[this.state.level - 1]?.personalColor : "transparent"
              }}
            >
              <div id="playModeRoleLabel">{this.state.rolelevel}</div>
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
                  {this.state.personalAreaOpen && !this.state.overlayOpen ? this.props.loadObjects("personal", "play") : null}
                </Stage>
              </div>
              {(this.state.personalAreaOpen !== 1)
                ? <button
                  className="personalAreaToggle"
                  onClick={() => this.setState({ personalAreaOpen: 1 })}>
                  <i><Up className="icon chevrons" /></i>
                </button>
                : <button
                  className="personalAreaToggle"
                  onClick={() => this.setState({ personalAreaOpen: 0 })}>
                  <i><Down className="icon chevrons" /></i>
                </button>
              }
            </div>
          </div>
        </div>

        <EndScreen open={this.state.end || this.props.isEnd}>
          <p>{this.props.t("game.thanksForJoining")}</p>
          {this.props.freeAdvance && (
            <button onClick={() => this.handleRestart()}>{this.props.t("game.resetSimulation")}</button>
          )}
        </EndScreen>
      </React.Fragment>
    );
  }
}
export default withTranslation()(Graphics);
