import React, { Component } from 'react';
import DropdownRoles from "../Dropdown/DropdownRoles";
import URLvideo from "./URLVideos";
import axios from "axios";
// import {Link } from "react-router-dom";
import Level from "../Level/Level";
import Modal from "react-modal";
import URLVideo from "./URLVideos";
import CreateRole from "../CreateRoleSelection/CreateRole";
import TicTacToe from "./GamePieces/TicTacToe/TicTacToe";
import Connect4 from "./GamePieces/Connect4/Board";
import styled from "styled-components";
import Poll from "./GamePieces/Poll/Poll";
import HTMLFrame from "./GamePieces/HTMLFrame";
import Input from "./GamePieces/Input";
import moment from "moment";

import {
  Rect,
  Stage,
  Layer,
  Ellipse,
  Star,
  Text,
  RegularPolygon,
  Line,
  Image,
  Arrow
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

class URLImage extends React.Component {
  state = {
    image: null
  };

  componentDidMount() {
    this.loadImage();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage();
    }
  }

  componentWillUnmount() {
    this.image.removeEventListener('load', this.handleLoad);
  }

  loadImage() {
    // save to "this" to remove "load" handler on unmount
    this.image = new window.Image();
    this.image.src = this.props.src;
    this.image.addEventListener('load', this.handleLoad);
  }

  handleLoad = () => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    this.setState({
      image: this.image
    });
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  };

  render() {
    return (
      <Image
        visible={this.props.visible}
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}
        image={this.state.image}
        ref={this.props.ref}
        id={this.props.id}
        name="shape"
        opacity={this.props.opacity}
        rotation={this.props.rotation}
        stroke={this.props.stroke}
        strokeWidth={this.props.strokeWidth}
      />
    );
  }
}

class Graphics extends Component {

  savedObjects = [
    // Objects
    "rectangles",
    "ellipses",
    "stars",
    "texts",
    "arrows",
    "triangles",
    "images",
    "videos",
    "audios",
    "documents",
    "lines",
    "tics",
    "connect4s",
    "polls",
    "htmlFrames",
    "inputs",

    "status"
  ];

  constructor(props) {
    super(props);

    this.state = {
      rectangles: [],
      ellipses: [],
      stars: [],
      texts: [],
      arrows: [],
      triangles: [],
      images: [],
      videos: [],
      audios: [],
      documents: [],
      lines: [],
      tics: [],
      connect4s: [],
      gameroles: [],
      polls: [],
      htmlFrames: [],
      inputs: [],
      open: 0,
      isOpen: true,
      state: false,
      selectrole: false,
      gameinstanceid: this.props.gameinstance.gameinstanceid,
      adminid: this.props.adminid,
      level: 1,
      pageNumber: 6,
    };
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
    sessionStorage.setItem('userInfo', JSON.stringify({role,name,dbid: this.props.initialUserId || id}));
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
    } catch(e) {};

    if (sessionStorage.userInfo) {
      const info = JSON.parse(sessionStorage.userInfo);
      if (this.props.alert) this.props.alert("Logged back in as: "+info.name, "info");
      this.handlePlayerInfo(info);
    }

    window.addEventListener("storage",(e) => {
      console.log('hi');
    });
  }

  formatTextMacros = (text) => {
    let start=false, newText=text;
    for (let i=0;i<newText.length;i++) {
      const c=newText[i];
      if (c==="{") start=i;
      if (c==="}" && start!==false) {
        let content, key;
        switch (key=newText.slice(start+1,i)) {
          case "playername":
            content=this.props.players[this.props.socket.id]?.name;
            break;
          case "playerrole":
            content=this.props.players[this.props.socket.id]?.role || "(no role selected)";
            break;
          case "lastsetvar":
            content=sessionStorage.lastSetVar;
            break;
          case "currentdate":
            content=moment().format("dddd, MMMM Do YYYY");
            break;
          default:
            let vars = {};
            if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
            content=vars[key];
        }
        newText = newText.slice(0,start) + (content!==undefined ? content : "unknown") + newText.slice(i+1);
        i=start;
        start=false;
      }
    }
    return newText;
  };

  checkObjConditions = (conditions) => {
    if (!conditions || !conditions.varName) return true;
    let vars = {};
    if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
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
  
  defaultObjProps = (obj, index) => {
    return {
      key: index,
      visible: obj.visible && this.checkObjConditions(obj.conditions),
      rotation: obj.rotation,
      ref: obj.ref,
      fill: obj.fill,
      opacity: obj.opacity,
      name: "shape",
      id: obj.id,
      x: obj.x,
      y: obj.y,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      strokeScaleEnabled: false,
      draggable: false,
      static: true
    }
  }

  rectProps = (obj) => {
    return {
      width: obj.width,
      height: obj.height,
      fillPatternImage: obj.fillPatternImage,
      fillPatternOffset: obj.fillPatternOffset,
      image: obj.image
    }
  }

  ellipseProps = (obj) => {
    return {
      radiusX: obj.radiusX,
      radiusY: obj.radiusY
    }
  }

  imageProps = (obj, layer) => {
    return {
      src: obj.imgsrc,
      image: obj.imgsrc,
      layer: layer,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      width: obj.width,
      height: obj.height
    }
  }

  videoProps = (obj, layer) => {
    return {
      type: "video",
      src: obj.vidsrc,
      image: obj.vidsrc,
      layer: layer,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      width: obj.width,
      height: obj.height
    }
  }

  audioProps = (obj, layer) => {
    return {
      type: "audio",
      src: obj.vidsrc,
      image: obj.vidsrc,
      layer: layer,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      width: obj.width,
      height: obj.height,
      fillPatternImage: true
    }
  }

  documentProps = (obj) => {
    return {
      width: obj.width,
      height: obj.height,
      fillPatternImage: this.state.docimage,
      fillPatternOffset: obj.fillPatternOffset,
      fillPatternScaleY: 0.2,
      fillPatternScaleX: 0.2,
      image: obj.image
    }
  }

  triangleProps = (obj) => {
    return {
      width: obj.width,
      height: obj.height,
      sides: obj.sides
    }
  }

  starProps = (obj) => {
    return {
      innerRadius: obj.innerRadius,
      outerRadius: obj.outerRadius,
      numPoints: obj.numPoints
    }
  }

  textProps = (obj) => {
    return {
      textDecoration: obj.link ? "underline" : "",
      width: obj.width,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      text: this.formatTextMacros(obj.text),
      link: obj.link
    }
  }

  lineProps = (obj, index) => {
    return {
      id: obj.id,
      level: obj.level,
      key: index,
      points: obj.points,
      stroke: obj.color,
      strokeWidth: obj.strokeWidth,
      tension: 0.5,
      lineCap: "round",
      globalCompositeOperation: obj.tool === 'eraser' ? 'destination-out' : 'source-over',
      draggable: false,
      onContextMenu: this.onObjectContextMenu,
    }
  }

  arrowProps = (obj, index) => {
    return {
      key: index,
      visible: obj.visible,
      ref: obj.ref,
      id: obj.id,
      name: "shape",
      points: [
        obj.points[0],
        obj.points[1],
        obj.points[2],
        obj.points[3]
      ],
      stroke: obj.stroke,
      fill: obj.fill,
      draggable: !this.state.layerDraggable
    }
  }

  pollProps = (obj) => {
    return {
      custom: {
        pollJson: obj.json ? obj.json : {
          pages: [
            {
              questions: [
                {
                  id: 0,
                  type: "text",
                  name: "0",
                  title: "Sample Text Question:",
                  isRequired: true
                }, {
                  id: 1,
                  type: "text",
                  name: "1",
                  inputType: "date",
                  title: "Sample Date Question:",
                }, {
                  id: 2,
                  type: "text",
                  name: "2",
                  inputType: "color",
                  title: "Sample Color Question:",
                }
              ]
            }
          ]
        }
      }
    };
  }
  
  htmlProps = (obj) => ({
    iframeSrc: obj.iframeSrc,
    htmlValue: obj.htmlValue || "<h1>Edit me!</h1>",
    containerWidth: obj.containerWidth,
    containerHeight: obj.containerHeight
  });

  getInteractiveProps = (id) => ({
    updateStatus: (parameters) => {
      this.props.socket.emit("interaction", {
        gamepieceId: id,
        parameters
      })
    },
    status: this.props.gamepieceStatus[id] || {}
  })

  handleLevel = (e) => {
    this.props.socket.emit("goToPage", {
      level: e
    })
    // this.setState({
    //   level: e
    // }, this.handleLevelUpdate)
  }

  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  componentWillReceiveProps = ({ level }) => {
    if (level) {
      this.setState({
        level
      })
    }
  }

  objectIsOnStage = (obj) => {
    if (obj.level === this.state.level && obj.infolevel === false) {
      return "group";
    } else if (obj.level === this.state.level && obj.infolevel === true && obj.rolelevel === this.state.rolelevel) {
      return "personal";
    } else {
      return "";
    }
  }

  // we need to render this outside of the konva stage
  // since otherwise they become static/unable to interact with
  loadInterativeObjects = (stage) => (
    <>
      {this.state.polls.map((obj, index) => {
        return this.objectIsOnStage(obj) === stage ?
          <Poll
            defaultProps={{
              ...this.defaultObjProps(obj, index),
              ...this.pollProps(obj)
            }}
            {...this.defaultObjProps(obj, index)}
          /> : null
      })}
      {this.state.connect4s.map((obj, index) => {
        return this.objectIsOnStage(obj) === stage ?
          <Connect4
            defaultProps={{ ...this.defaultObjProps(obj, index) }}
            {...this.defaultObjProps(obj, index)}
            {...this.getInteractiveProps(obj.id)}
          /> : null
      })}
      {this.state.tics.map((obj, index) => {
        return this.objectIsOnStage(obj) === stage ?
          <TicTacToe
            defaultProps={{ ...this.defaultObjProps(obj, index) }}
            {...this.defaultObjProps(obj, index)}
            {...this.getInteractiveProps(obj.id)}
          /> : null
      })}
      {this.state.htmlFrames.map((obj, index) => {
        return this.objectIsOnStage(obj) === stage ?
          <HTMLFrame
            defaultProps={{ ...this.defaultObjProps(obj, index) }}
            {...this.defaultObjProps(obj, index)}
            {...this.getInteractiveProps(obj.id)}
            {...this.htmlProps(obj)}
          /> : null
      })}
      {this.state.inputs.map((obj, index) => {
        return this.objectIsOnStage(obj) === stage ?
          <Input
            defaultProps={{ ...this.defaultObjProps(obj, index) }}
            {...this.defaultObjProps(obj, index)}
            {...this.getInteractiveProps(obj.id)}
            varType={obj.varType}
            varName={obj.varName}
            refresh={() => this.forceUpdate()}
          /> : null
      })}
    </>
  );

  loadObjects = (stage) => {
    return (
      <>
        {/* This Rect is for dragging the canvas */}
        <Rect
          id="ContainerRect"
          x={-5 * window.innerWidth}
          y={-5 * window.innerHeight}
          height={window.innerHeight * 10}
          width={window.innerWidth * 10}
        />

        {/* Load objects in state */}
        {this.state.lines.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Line {...this.lineProps(obj, index)} /> : null
        })}
        {this.state.rectangles.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Rect {...this.defaultObjProps(obj, index)} {...this.rectProps(obj)} /> : null
        })}
        {this.state.ellipses.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Ellipse {...this.defaultObjProps(obj, index)} {...this.ellipseProps(obj)} /> : null
        })}
        {this.state.images.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <URLImage {...this.defaultObjProps(obj, index)} {...this.imageProps(obj, this.refs.groupAreaLayer)} /> : null
        })}
        {this.state.videos.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <URLVideo {...this.defaultObjProps(obj, index)} {...this.videoProps(obj, this.refs.groupAreaLayer)} /> : null
        })}
        {this.state.audios.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <URLVideo {...this.defaultObjProps(obj, index)} {...this.audioProps(obj, this.refs.groupAreaLayer)} /> : null
        })}
        {this.state.documents.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Rect {...this.defaultObjProps(obj, index)} {...this.documentProps(obj)} /> : null
        })}
        {this.state.triangles.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <RegularPolygon {...this.defaultObjProps(obj, index)} {...this.triangleProps(obj)} /> : null
        })}
        {this.state.stars.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Star {...this.defaultObjProps(obj, index)} {...this.starProps(obj)} /> : null
        })}
        {this.state.texts.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Text {...this.defaultObjProps(obj, index)} {...this.textProps(obj)} /> : null
        })}
        {this.state.arrows.map((obj, index) => {
          return (
            !obj.from &&
            !obj.to &&
            obj.level === this.state.level &&
            obj.infolevel === (stage === "personal")
          ) ?
            <Arrow {...this.arrowProps(obj, index)} /> : null
        })}

        <Rect fill="rgba(0,0,0,0.5)" ref={`${stage}SelectionRect`} />
      </>
    );
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
              scaleX={this.state.layerScale}
              scaleY={this.state.layerScale}
              x={this.state.layerX}
              y={this.state.layerY}
              height={window.innerHeight}
              width={window.innerWidth}
              ref="layer2"
            >
              {this.loadObjects("group")}
            </Layer>
          </Stage>
          {this.loadInterativeObjects("group")}
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
                    {this.loadObjects("personal")}
                  </Layer>
                </Stage>
                {this.loadInterativeObjects("personal")}
              </div>
              {(this.state.open !== 1)
                ? <button onClick={() => this.setState({ open: 1 })}><i className="fas fa-caret-square-up fa-3x"></i></button>
                : <button onClick={() => this.setState({ open: 0 })}><i className="fas fa-caret-square-down fa-3x"></i></button>
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
