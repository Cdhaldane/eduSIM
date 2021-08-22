import React, { useState, useEffect, Component } from 'react';
import Dropdownroles from "../DropDown/Dropdownroles";
import Info  from "../Information/InformationPopup";
import URLvideo from "./URLVideos";
import { v1 as uuidv1 } from 'uuid';
import fileDownload from 'js-file-download'
import axios from 'axios'
import {Link } from "react-router-dom";
import Level from "../Level/Level";
import Pencil from "../Pencils/Pencil";
import Konva from "konva"
import ContextMenu from "../ContextMenu/ContextMenu";
import ContextMenuText from "../ContextMenu/ContextMenuText";
import Portal from "./Shapes/Portal"
import {
  Rect,
  Stage,
  Layer,
  Transformer,
  Ellipse,
  Star,
  Text,
  RegularPolygon,
  Line,
  Arrow,
  Image
} from "react-konva";

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
  constructor(props) {
    super(props);
    this.state = {
      layerX: 0,
      layerY: 0,
      layerScale: 1,
      selectedShapeName: "",
      errMsg: "",
      rectangles: [],
      ellipses: [],
      stars: [],
      triangles: [],
      images: [],
      videos: [],
      audios: [],
      documents: [],
      texts: [],
      lines: [],
      arrows: [],
      connectors: [],
      gameroles: [],
      currentTextRef: "",
      shouldTextUpdate: true,
      textX: 0,
      textY: 0,
      textEditVisible: false,
      arrowDraggable: false,
      newArrowRef: "",
      count: 0,
      newArrowDropped: false,
      newConnectorDropped: false,
      arrowEndX: 0,
      arrowEndY: 0,
      isTransforming: false,
      lastFill: null,
      selectedContextMenu:null,
      selectedContextMenuText:null,
      colorf: "black",
      colors: "black",
      color: "white",
      strokeWidth: 3.75,
      opacity: 1,
      infolevel: false,
      rolelevel: "",

      open: 0,
      state: false,



      saving: null,
      saved: [],
      roadmapId: null,
      alreadyCreated: false,
      publishing: false,
      title: "",
      category: "",
      description: "",
      thumbnail: "",
      isPasteDisabled: false,
      ellipseDeleteCount: 0,
      starDeleteCount: 0,
      arrowDeleteCount: 0,
      textDeleteCount: 0,
      rectDeleteCount: 0,
      triangleDeleteCount: 0,
      imageDeleteCount: 0,
      videoDeleteCount: 0,
      linesDeleteCount: 0,
      audioDeletedCount: 0,
      gameinstanceid: this.props.gameinstance,
      adminid: this.props.adminid,
      savedstates: [],
      draggable: false,
      level: 1,
      tool: 'pen',
      isDrawing: false,
      drawMode: false,
      ptype: "",
      pageNumber: 6,
      imagesrc: null,
      vidsrc: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm",
      imgsrc: "https://konvajs.org/assets/lion.png",
      audsrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3",
      docsrc: "",
      docimage: null,
      selection: {visible: false,
                  x1: -100,
                  y1: -100,
                  x2: 0,
                  y2: 0}
                  };


    axios.get('http://localhost:5000/api/gameinstances/getGameInstance/:adminid/:gameid', {
      params: {
            adminid: this.state.adminid,
            gameid: this.state.gameinstanceid
        }
    })
    .then((res) => {
      const allData = res.data;
      console.log(JSON.parse(allData.game_parameters));
      this.setState({
        rectangles: JSON.parse(allData.game_parameters)[0] || []
      })
      this.setState({
        ellipses:JSON.parse(allData.game_parameters)[1] || []
      })
      this.setState({
        stars: JSON.parse(allData.game_parameters)[2] || []
      })
      this.setState({
        texts: JSON.parse(allData.game_parameters)[3] || []
      })
      this.setState({
        arrows: JSON.parse(allData.game_parameters)[4] || []
      })
      this.setState({
        triangles: JSON.parse(allData.game_parameters)[5] || []
      })
      this.setState({
        images: JSON.parse(allData.game_parameters)[6] || []
      })
      this.setState({
        videos: JSON.parse(allData.game_parameters)[7] || []
      })
      this.setState({
        audios: JSON.parse(allData.game_parameters)[8] || []
      })
      this.setState({
        documents: JSON.parse(allData.game_parameters)[9] || []
      })
      this.setState({
        lines: JSON.parse(allData.game_parameters)[10] || []
      })
    })
    .catch(error => console.log(error.response));
    axios.get('http://localhost:5000/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
            gameinstanceid: this.state.gameinstanceid,
        }
    })
  }
  handleLevel = (e) => {
    this.setState({
      level: e
    }, this.handleLevelUpdate)
  }
  
  render() {
    let saveText;

    let saving = this.state.saving;
    if (saving !== null) {
      if (saving) {
        saveText = <div style={{ color: "white" }}>Saving</div>;
      } else {
        saveText = <div style={{ color: "white" }}>Saved</div>;
      }
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    var gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0.0, "red");
    gradient.addColorStop(1 / 6, "orange");
    gradient.addColorStop(2 / 6, "yellow");
    gradient.addColorStop(3 / 6, "green");
    gradient.addColorStop(4 / 6, "aqua");
    gradient.addColorStop(5 / 6, "blue");
    gradient.addColorStop(1.0, "purple");

    const errMsg = this.state.errMsg;
    let errDisplay;
    if (errMsg !== "") {
      errDisplay = (
        <div className="errMsginner">
          <span style={{ color: "white" }}>
            {errMsg !== "" ? errMsg : null}
          </span>
        </div>
      );
    } else {
    }

    return (
      <React.Fragment>
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
              <Rect
                x={-5 * window.innerWidth}
                y={-5 * window.innerHeight}
                height={window.innerHeight * 10}
                width={window.innerWidth * 10}
                name=""
                id="ContainerRect"
              />
            {this.state.rectangles.map(eachRect => {
              if(eachRect.level === this.state.level && eachRect.infolevel === false)
                return (
                  <Rect
                  visible={eachRect.visible}
                  rotation={eachRect.rotation}
                  ref={eachRect.ref}
                  fill={eachRect.fill}
                  fillPatternImage={eachRect.fillPatternImage}
                  fillPatternOffset={eachRect.fillPatternOffset}
                  image={eachRect.image}
                  opacity={eachRect.opacity}
                  id={eachRect.id}
                  name="shape"
                  x={eachRect.x}
                  y={eachRect.y}
                  width={eachRect.width}
                  height={eachRect.height}
                  stroke={eachRect.stroke}
                  strokeWidth={eachRect.strokeWidth}
                  strokeScaleEnabled={false}
                />
              );
              })}

              {this.state.ellipses.map(eachEllipse => {
                if(eachEllipse.level === this.state.level && eachEllipse.infolevel === false)
                return (
                <Ellipse
                  visible={eachEllipse.visible}
                  ref={eachEllipse.ref}
                  name="shape"
                  id={eachEllipse.id}
                  x={eachEllipse.x}
                  y={eachEllipse.y}
                  opacity={eachEllipse.opacity}
                  rotation={eachEllipse.rotation}
                  radiusX={eachEllipse.radiusX}
                  radiusY={eachEllipse.radiusY}
                  fill={eachEllipse.fill}
                  stroke={eachEllipse.stroke}
                  strokeWidth={eachEllipse.strokeWidth}
                  strokeScaleEnabled={false}
                  />
              );
            })}
              {this.state.lines.map((eachLine, i) => {
                if(eachLine.level === this.state.level && eachLine.infolevel === false)
                return(
                  <Line
                    id={eachLine.id}
                    level={eachLine.level}
                    key={i}
                    points={eachLine.points}
                    stroke={eachLine.color}
                    strokeWidth={5}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation={
                      eachLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                  />
              );
              })}

              {this.state.images.map(eachImage => {
                if(eachImage.level === this.state.level && eachImage.infolevel === false)
                return (
                <URLImage
                  visible={eachImage.visible}
                  src={eachImage.imgsrc}
                  image={eachImage.imgsrc}
                  ref={eachImage.ref}
                  name="shape"
                  id={eachImage.id}
                  layer={this.refs.layer2}
                  x={eachImage.x}
                  y={eachImage.y}
                  width={eachImage.width}
                  height={eachImage.height}
                  stroke={eachImage.stroke}
                  strokeWidth={eachImage.strokeWidth}
                  rotation={eachImage.rotation}
                  opacity={eachImage.opacity}

                />
            );
            })}
              {this.state.videos.map(eachVideo => {
                if(eachVideo.level === this.state.level && eachVideo.infolevel === false)
                return (
                <URLvideo
                  visible={eachVideo.visible}
                  src={eachVideo.vidsrc}
                  image={eachVideo.vidsrc}
                  ref={eachVideo.ref}
                  id={eachVideo.id}
                  name="shape"
                  layer={this.refs.layer2}
                  x={eachVideo.x}
                  y={eachVideo.y}
                  width={eachVideo.width}
                  height={eachVideo.height}
                  stroke={eachVideo.stroke}
                  strokeWidth={eachVideo.strokeWidth}
                  rotation={eachVideo.rotation}
                  opacity={eachVideo.opacity}

                />
            );
            })}
              {this.state.audios.map(eachAudio => {
                if(eachAudio.level === this.state.level && eachAudio.infolevel === false)
                return (
                <URLvideo
                  visible={eachAudio.visible}
                  fillPatternImage={true}
                  src={eachAudio.audsrc}
                  image={eachAudio.imgsrc}
                  ref={eachAudio.ref}
                  id={eachAudio.id}
                  name="shape"
                  layer={this.refs.layer2}
                  x={eachAudio.x}
                  y={eachAudio.y}
                  width={eachAudio.width}
                  height={eachAudio.height}
                  stroke={eachAudio.stroke}
                  strokeWidth={eachAudio.strokeWidth}
                  rotation={eachAudio.rotation}
                  opacity={eachAudio.opacity}

                />
            );
            })}
              {this.state.documents.map(eachDoc => {
                if(eachDoc.level === this.state.level && eachDoc.infolevel === false)
                return (
                <Rect
                  rotation={eachDoc.rotation}
                  ref={eachDoc.ref}
                  fill={eachDoc.fill}
                  fillPatternImage={this.state.docimage}
                  fillPatternOffset={eachDoc.fillPatternOffset}
                  fillPatternScaleY={0.2}
                  fillPatternScaleX={0.2}
                  image={eachDoc.image}
                  opacity={eachDoc.opacity}
                  id={eachDoc.id}
                  name="shape"
                  x={eachDoc.x}
                  y={eachDoc.y}
                  width={eachDoc.width}
                  height={eachDoc.height}
                  stroke={eachDoc.stroke}
                  strokeWidth={eachDoc.strokeWidth}

                />
            );
            })}
              {this.state.triangles.map(eachEllipse => {
                if(eachEllipse.level === this.state.level && eachEllipse.infolevel === false)
                return (
                <RegularPolygon
                  visible={eachEllipse.visible}
                  ref={eachEllipse.ref}
                  id={eachEllipse.id}
                  name="shape"
                  x={eachEllipse.x}
                  y={eachEllipse.y}
                  opacity={eachEllipse.opacity}
                  rotation={eachEllipse.rotation}
                  height={eachEllipse.height}
                  sides={eachEllipse.sides}
                  radius={eachEllipse.radius}
                  fill={eachEllipse.fill}
                  stroke={eachEllipse.stroke}
                  strokeWidth={eachEllipse.strokeWidth}
                  strokeScaleEnabled={false}

                />
            );
            })}
              {this.state.stars.map(eachStar => {
                if(eachStar.level === this.state.level && eachStar.infolevel === false)
                return (
                <Star
                  visible={eachStar.visible}
                  ref={eachStar.ref}
                  id={eachStar.id}
                  name="shape"
                  x={eachStar.x}
                  y={eachStar.y}
                  innerRadius={eachStar.innerRadius}
                  outerRadius={eachStar.outerRadius}
                  numPoints={eachStar.numPoints}
                  stroke={eachStar.stroke}
                  strokeWidth={eachStar.strokeWidth}
                  fill={eachStar.fill}
                  opacity={eachStar.opacity}
                  strokeScaleEnabled={false}
                  rotation={eachStar.rotation}

                />
            );
            })}

              {this.state.texts.map(eachText => {
                if(eachText.level === this.state.level && eachText.infolevel === false)
                return (
                //perhaps this.state.texts only need to contain refs?
                //so that we only need to store the refs to get more information
                <Text
                  visible={eachText.visible}
                  textDecoration={eachText.link ? "underline" : ""}

                  link={eachText.link}
                  width={eachText.width}
                  fill={eachText.fill}
                  opacity={eachText.opacity}
                  id={eachText.id}
                  name="shape"
                  ref={eachText.ref}
                  rotation={eachText.rotation}
                  fontFamily={eachText.fontFamily}
                  fontSize={eachText.fontSize}
                  x={eachText.x}
                  y={eachText.y}
                  text={eachText.text}

              />
            );
            })}

            </Layer>
          </Stage>
        </div>
        <div className="eheader">
        <Level number={this.state.pageNumber} ptype={this.state.ptype} level={this.handleLevel}/>
            <div>
              <div className={"info" + this.state.open}>
                <div id="infostage">

                <Stage width={1500} height={600}
                  ref="graphicStage1"
                >
                  <Layer ref="layer3">
                    {this.state.rectangles.map(eachRect => {
                      if(eachRect.level === this.state.level && eachRect.infolevel === true && eachRect.rolelevel === this.state.rolelevel)
                        return (
                          <Rect
                          visible={eachRect.visible}
                          rotation={eachRect.rotation}
                          ref={eachRect.ref}
                          fill={eachRect.fill}
                          fillPatternImage={eachRect.fillPatternImage}
                          fillPatternOffset={eachRect.fillPatternOffset}
                          image={eachRect.image}
                          opacity={eachRect.opacity}
                          id={eachRect.id}
                          name="shape"
                          x={eachRect.x}
                          y={eachRect.y}
                          width={eachRect.width}
                          height={eachRect.height}
                          stroke={eachRect.stroke}
                          strokeWidth={eachRect.strokeWidth}
                          strokeScaleEnabled={false}
                        />
                        );
                      })}

                      {this.state.ellipses.map(eachEllipse => {
                        if(eachEllipse.level === this.state.level && eachEllipse.infolevel === true && eachEllipse.rolelevel === this.state.rolelevel)
                        return (
                        <Ellipse
                          visible={eachEllipse.visible}
                          ref={eachEllipse.ref}
                          name="shape"
                          id={eachEllipse.id}
                          x={eachEllipse.x}
                          y={eachEllipse.y}
                          opacity={eachEllipse.opacity}
                          rotation={eachEllipse.rotation}
                          radiusX={eachEllipse.radiusX}
                          radiusY={eachEllipse.radiusY}
                          fill={eachEllipse.fill}
                          stroke={eachEllipse.stroke}
                          strokeWidth={eachEllipse.strokeWidth}
                          strokeScaleEnabled={false}

                        />
                      );
                    })}
                      {this.state.lines.map((eachLine, i) => {
                        if(eachLine.level === this.state.level && eachLine.infolevel === true && eachLine.rolelevel === this.state.rolelevel)
                        return(
                          <Line
                            id={eachLine.id}
                            level={eachLine.level}
                            key={i}
                            points={eachLine.points}
                            stroke={eachLine.color}
                            strokeWidth={5}
                            tension={0.5}
                            lineCap="round"
                            globalCompositeOperation={
                              eachLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }

                          />
                      );
                      })}

                      {this.state.images.map(eachImage => {
                        if(eachImage.level === this.state.level && eachImage.infolevel === true && eachImage.rolelevel === this.state.rolelevel)
                        return (
                        <URLImage
                          visible={eachImage.visible}
                          src={eachImage.imgsrc}
                          image={eachImage.imgsrc}
                          ref={eachImage.ref}
                          name="shape"
                          id={eachImage.id}
                          layer={this.refs.layer2}
                          x={eachImage.x}
                          y={eachImage.y}
                          width={eachImage.width}
                          height={eachImage.height}
                          stroke={eachImage.stroke}
                          strokeWidth={eachImage.strokeWidth}
                          rotation={eachImage.rotation}
                          opacity={eachImage.opacity}

                        />
                    );
                    })}
                      {this.state.videos.map(eachVideo => {
                        if(eachVideo.level === this.state.level && eachVideo.infolevel === true && eachVideo.rolelevel === this.state.rolelevel)
                        return (
                        <URLvideo
                          visible={eachVideo.visible}
                          src={eachVideo.vidsrc}
                          image={eachVideo.vidsrc}
                          ref={eachVideo.ref}
                          id={eachVideo.id}
                          name="shape"
                          layer={this.refs.layer2}
                          x={eachVideo.x}
                          y={eachVideo.y}
                          width={eachVideo.width}
                          height={eachVideo.height}
                          stroke={eachVideo.stroke}
                          strokeWidth={eachVideo.strokeWidth}
                          rotation={eachVideo.rotation}
                          opacity={eachVideo.opacity}

                        />
                    );
                    })}
                      {this.state.audios.map(eachAudio => {
                        if(eachAudio.level === this.state.level && eachAudio.infolevel === true && eachAudio.rolelevel === this.state.rolelevel)
                        return (
                        <URLvideo
                          visible={eachAudio.visible}
                          fillPatternImage={true}
                          src={eachAudio.audsrc}
                          image={eachAudio.imgsrc}
                          ref={eachAudio.ref}
                          id={eachAudio.id}
                          name="shape"
                          layer={this.refs.layer2}
                          x={eachAudio.x}
                          y={eachAudio.y}
                          width={eachAudio.width}
                          height={eachAudio.height}
                          stroke={eachAudio.stroke}
                          strokeWidth={eachAudio.strokeWidth}
                          rotation={eachAudio.rotation}
                          opacity={eachAudio.opacity}


                        />
                    );
                    })}
                      {this.state.documents.map(eachDoc => {
                        if(eachDoc.level === this.state.level && eachDoc.infolevel === true && eachDoc.rolelevel === this.state.rolelevel)
                        return (
                        <Rect
                          rotation={eachDoc.rotation}
                          ref={eachDoc.ref}
                          fill={eachDoc.fill}
                          fillPatternImage={this.state.docimage}
                          fillPatternOffset={eachDoc.fillPatternOffset}
                          fillPatternScaleY={0.2}
                          fillPatternScaleX={0.2}
                          image={eachDoc.image}
                          opacity={eachDoc.opacity}
                          id={eachDoc.id}
                          name="shape"
                          x={eachDoc.x}
                          y={eachDoc.y}
                          width={eachDoc.width}
                          height={eachDoc.height}
                          stroke={eachDoc.stroke}
                          strokeWidth={eachDoc.strokeWidth}

                        />
                    );
                    })}
                      {this.state.triangles.map(eachEllipse => {
                        if(eachEllipse.level === this.state.level && eachEllipse.infolevel === true && eachEllipse.rolelevel === this.state.rolelevel)
                        return (
                        <RegularPolygon
                          visible={eachEllipse.visible}
                          ref={eachEllipse.ref}
                          id={eachEllipse.id}
                          name="shape"
                          x={eachEllipse.x}
                          y={eachEllipse.y}
                          opacity={eachEllipse.opacity}
                          rotation={eachEllipse.rotation}
                          height={eachEllipse.height}
                          sides={eachEllipse.sides}
                          radius={eachEllipse.radius}
                          fill={eachEllipse.fill}
                          stroke={eachEllipse.stroke}
                          strokeWidth={eachEllipse.strokeWidth}
                          strokeScaleEnabled={false}

                        />
                    );
                    })}
                      {this.state.stars.map(eachStar => {
                        if(eachStar.level === this.state.level && eachStar.infolevel === true && eachStar.rolelevel === this.state.rolelevel)
                        return (
                        <Star
                          visible={eachStar.visible}
                          ref={eachStar.ref}
                          id={eachStar.id}
                          name="shape"
                          x={eachStar.x}
                          y={eachStar.y}
                          innerRadius={eachStar.innerRadius}
                          outerRadius={eachStar.outerRadius}
                          numPoints={eachStar.numPoints}
                          stroke={eachStar.stroke}
                          strokeWidth={eachStar.strokeWidth}
                          fill={eachStar.fill}
                          opacity={eachStar.opacity}
                          strokeScaleEnabled={false}
                          rotation={eachStar.rotation}

                        />
                    );
                    })}

                      {this.state.texts.map(eachText => {
                        if(eachText.level === this.state.level && eachText.infolevel === true && eachText.rolelevel === this.state.rolelevel)
                        return (
                        //perhaps this.state.texts only need to contain refs?
                        //so that we only need to store the refs to get more information
                        <Text
                          visible={eachText.visible}
                          textDecoration={eachText.link ? "underline" : ""}
                          link={eachText.link}
                          width={eachText.width}
                          fill={eachText.fill}
                          opacity={eachText.opacity}
                          id={eachText.id}
                          name="shape"
                          ref={eachText.ref}
                          rotation={eachText.rotation}
                          fontFamily={eachText.fontFamily}
                          fontSize={eachText.fontSize}
                          x={eachText.x}
                          y={eachText.y}
                          text={eachText.text}

                      />
                    );
                    })}



                  </Layer>
                </Stage>
                </div>
                {(this.state.open !== 1)
                  ? <button onClick={() => this.setState({open: 1})}><i class="fas fa-caret-square-up fa-3x"></i></button>
                  : <button onClick={() => this.setState({open: 0})}><i class="fas fa-caret-square-down fa-3x"></i></button>
                }
                <p id="rolesdrop">
                  <Dropdownroles
                    roleLevel={this.handleRoleLevel}
                    gameroles={this.state.gameroles}
                    gameid={this.state.gameinstanceid}
                  />
                </p>
                </div>

              </div>

              <Link to="/dashboard">
                <i id="editpagex" class="fas fa-times fa-3x"></i>
              </Link>
            </div>
      </React.Fragment>
    );
  }
  }
export default Graphics;