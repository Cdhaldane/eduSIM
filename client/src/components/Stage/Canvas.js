//todo: allow for picture inside of rect/ellipse/stfar
//todo: connect using arrow
//todo: for rightToolBar, show fontSize,fontFamily for text for the rest allow to add pictures
//todo: zoomable
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import { SelectableGroup } from 'react-selectable-fast'
import { addLine } from "./Shapes/Line";
import URLvideo from "./URLVideos";
import { addTextNode } from "./Shapes/Text";
// import Image from "./Shapes/Img";
import { v1 as uuidv1 } from 'uuid';
import Canvas from "./Canvas.js"
import fileDownload from 'js-file-download'
import axios from 'axios'
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

import {Link } from "react-router-dom";
import Level from "../Level/Level";
import Info from "../Information/InformationPopup";
import EditShapes from "../EditShapes/EditShapes";
import Pencil from "../Pencils/Pencil";
import Sidebar from "../SideBar/Sidebar";
import Header from "../SideBar/Header";
import styled from "styled-components"
import Konva from "konva"

import { Container, Row, Col } from "react-bootstrap";

import "./Stage.css"


import React, { useState, useEffect, Component, useMemo } from 'react';
import useImage from "use-image";
import ContextMenu from "../ContextMenu/ContextMenu";
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
import Connector from "./Connector.jsx";
import Toolbar from "./Toolbar.js";




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
        draggable
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}
        image={this.state.image}
        ref={this.props.ref}
        id={this.props.id}
        name="shape"
        opacity={this.props.opacity}
        onClick={this.props.onClick}
        onTransformStart={this.props.onTransformStart}
        onTransform={this.props.onTransform}
        onTransformEnd={this.props.onTransformEnd}
        onDragMove={this.props.onDragMove}
        onDragEnd={this.props.onDragEnd}
        onContextMenu={this.props.onContextMenu}
        rotation={this.props.rotation}
        stroke={this.props.stroke}
        strokeWidth={this.props.strokeWidth}

      />
    );
  }
}

class TransformerComponent extends React.Component {
  componentDidMount() {
    this.checkNode();
  }
  componentDidUpdate() {
    this.checkNode();
  }
  checkNode() {
    // const stage = this.transformer.getStage();
    //
    // const { selectedShapeName } = this.props;
    // if (selectedShapeName === "") {
    //   this.transformer.detach();
    //   console.log(1)
    //   return;
    // }
    // const selectedNode = stage.findOne("." + selectedShapeName);
    // if (selectedNode === this.transformer.node()) {
    //   return;
    // }
    //
    // if (selectedNode) {
    //   this.transformer.attachTo(selectedNode);
    //   console.log(2)
    // } else {
    //   this.transformer.detach();
    //   console.log(3)
    // }
    // this.transformer.getLayer().batchDraw();
  }
  render() {
    if (this.props.selectedShapeName.includes("text")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
          enabledAnchors={["middle-left", "middle-right"]}
        />
      );
    } else if (this.props.selectedShapeName.includes("star")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right"
          ]}
        />
      );
    } else if (this.props.selectedShapeName.includes("arrow")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          resizeEnabled={false}
          rotateEnabled={false}
        />
      );
    } else {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          keepRatio={true}
        />
      );
    }
    return stuff;
  }
}

var history = [];
var historyStep = 0;

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
      arrows: [],
      connectors: [],
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
      colorf: "white",
      colors: "black",
      strokeWidth: 3.75,
      opacity: 1,


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
      audioDeletedCount: 0,
      gameinstanceid: this.props.gameinstance,
      adminid: this.props.adminid,
      savedstates: [],
      draggable: false,

      ptype: "",
      pageNumber: 6,
      isDrawing: false,
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

    this.handleWheel = this.handleWheel.bind(this);
    console.log(this.state.adminid)
    console.log(this.state.gameinstanceid)

    var data =  {
          adminid: this.state.adminid,
          gameid: this.state.gameinstanceid
      }

    axios.get('http://localhost:5000/gameinstances/getGameInstance/:adminid/:gameid', {
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
    })
    .catch(error => console.log(error.response));



  }
  handleType = (e) => {
    this.setState({
      ptype: e
    })
  }
  handleNum = (e) => {
    this.setState({
      pageNumber: e
    })
  }
  handleMvisible = (e) => {
    this.props.mvisible(e)
  }
   handleAvisible = (e) => {
    this.props.avisible(e)
  }
   handlePavisible = (e) => {
    this.props.pavisible(e)
  }
   handleSvisible = (e) => {
    this.props.svisible(e)
  }
   handlePevisible = (e) => {
    this.props.pevisible(e)
  }

  handleSave = () => {
    const rects = this.state.rectangles,
      ellipses = this.state.ellipses,
      stars = this.state.stars,
      texts = this.state.texts,
      arrows = this.state.arrows,
      triangles = this.state.triangles,
      images = this.state.images,
      videos = this.state.videos,
      audios = this.state.audios,
      documents = this.state.documents;
    // if (
    //   JSON.stringify(this.state.saved) !==
    //   JSON.stringify([rects, ellipses, stars, texts, arrows, triangles, images, videos, audios, documents])
    // ) {
      this.setState({ saved: [rects, ellipses, stars, texts, arrows, triangles, images, videos, audios, documents] });

      let arrows1 = this.state.arrows;
      arrows1.forEach(eachArrow => {
        //for "from & to of each arrow"
        if (eachArrow.from && eachArrow.from.attrs) {
          if (eachArrow.from.attrs.name.includes("text")) {
            eachArrow.from.textWidth = eachArrow.from.textWidth;

            eachArrow.from.textHeight = eachArrow.from.textHeight;
          }
        }
        if (eachArrow.to && eachArrow.to.attrs) {
          if (eachArrow.to.attrs.name.includes("text")) {
            eachArrow.to.attrs.textWidth = eachArrow.to.textWidth;
            eachArrow.to.attrs.textHeight = eachArrow.to.textHeight;
          }
        }
      });

      // if (this.state.roadmapId) {

              console.log(this.state.gameinstanceid)
              var body = {
                  id: this.state.gameinstanceid,
                  game_parameters: JSON.stringify(this.state.saved),
                  createdby_adminid: localStorage.adminid,
                  invite_url: 'value'
                }

                console.log(this.state.saved)
                console.log(this.props)

                axios.put('http://localhost:5000/gameinstances/update/:id', body)
                   .then((res) => {
                      console.log(res)
                     })
                    .catch(error => console.log(error.response));
                   console.log();

              //if draft already exists


        //if draft already exists
      //   this.setState({ saving: true });
      //   fetch("", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       roadmapId: this.state.roadmapId,
      //       data: {
      //         rects: rects,
      //         ellipses: ellipses,
      //         stars: stars,
      //         texts: texts,
      //         arrows: arrows1,
      //         triangles: triangles,
      //         audios: audios,
      //         documents: documents,
      //         images: images,
      //         vidoes: videos
      //       }
      //     })
      //   }).then(res => {
      //     this.setState({ saving: false });
      //   });
      // } else {
      //   //if first time pressing sav
      //   this.setState({ saving: true });
      //   fetch("", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       userId: this.props.auth.user.id,
      //       roadmapType: "draft",
      //       data: {
      //         rects: rects,
      //         ellipses: ellipses,
      //         stars: stars,
      //         texts: texts,
      //         arrows: arrows,
      //         triangles: triangles,
      //         audios: audios,
      //         documents: documents,
      //         images: images,
      //         vidoes: videos
      //       }
      //     })
      //   }).then(res =>
      //     res.json().then(data => {
      //       this.setState({ saving: false });
      //       this.setState({ roadmapId: data.roadmapId });
      //     })
      //   );
      // }
    // }
  };

  handleStageClick = e => {
    var pos = this.refs.layer2.getStage().getPointerPosition();
    var shape = this.refs.layer2.getIntersection(pos);

    console.log("texts", this.state.texts);

    if (
      shape !== null &&
      shape.name() !== undefined &&
      shape !== undefined &&
      shape.name() !== undefined
    ) {
      this.setState(
        {
          selectedShapeName: shape.id()
        },
        () => {
          this.refs.graphicStage.draw();
        }
      );
    }

    //arrow logic
    if (this.state.newArrowRef !== "") {
      if (this.state.previousShape) {
        if (this.state.previousShape.attrs.id !== "ContainerRect") {
          //console.log(this.refs.graphicStage.findOne("." + this.state.newArrowRef));
          //

          this.state.arrows.map(eachArrow => {
            if (eachArrow.name === this.state.newArrowRef) {
              eachArrow.to = this.state.previousShape;
            }
          });

          //console.log(newConnector, this.state.newArrowRef);
          //newConnector.setAttr("to", this.state.previousShape);
          //console.log(newConnector);
        }
      }

      //handle connector more
      //if the currentArrow ref has a from, and that e.target.attrs.id isn't containerRect,
      //then find the current shape with stage find name and then yeah
      this.state.arrows.map(eachArrow => {
        if (eachArrow.name === this.state.newArrowRef) {
          eachArrow.fill = "black";
          eachArrow.stroke = "black";
        }
      });
      //arrow logic, there's e.evt.pageX, pageY
      this.setState({
        arrowDraggable: false,
        newArrowRef: ""
      });
    }
  };

  updateSelectionRect = () => {

    const node = this.refs.selectionRectRef;
    node.setAttrs({
      visible: this.state.selection.visible,
      x: Math.min(this.state.selection.x1, this.state.selection.x2),
      y: Math.min(this.state.selection.y1, this.state.selection.y2),
      width: Math.abs(this.state.selection.x1 - this.state.selection.x2),
      height: Math.abs(this.state.selection.y1 - this.state.selection.y2),
      fill: "rgba(0, 161, 255, 0.3)"
    });
    node.getLayer().batchDraw();
  };

  onMouseDown = (e) => {
    const isElement = e.target.findAncestor(".elements-container");
    const isTransformer = e.target.findAncestor("Transformer");
    if (isElement || isTransformer) {
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    this.state.selection.visible = true;
    this.state.selection.x1 = pos.x;
    this.state.selection.y1 = pos.y;
    this.state.selection.x2 = pos.x;
    this.state.selection.y2 = pos.y;
    this.updateSelectionRect();
  };


  handleMouseUp = () => {
    this.setState({
      draggable: false
    })
    if (!this.state.selection.visible) {
      return;
    }
    const selBox = this.refs.selectionRectRef.getClientRect();
    const elements = [];
    this.refs.layer2.find(".shape").forEach((elementNode) => {
      const elBox = elementNode.getClientRect();
      if (Konva.Util.haveIntersection(selBox, elBox)) {
        elements.push(elementNode);

      }
    });
    console.log(this.refs.layer2.find(".rectangle"))
    this.refs.trRef.transformer.nodes(elements);
    this.state.selection.visible = false;
    // disable click event
    Konva.listenClickTap = false;
    this.updateSelectionRect();
  };

  onMouseMove = (e) => {
    const pos = e.target.getStage().getPointerPosition();

    this.state.selection.x2 = pos.x;
    this.state.selection.y2 = pos.y;
    this.updateSelectionRect();
  };

  handleMouseOver = event => {
    //get the currennt arrow ref and modify its position by filtering & pushing again
    //console.log("lastFill: ", this.state.lastFill);
    if (!this.state.selection.visible) {
      return;
    }
    var pos = this.refs.graphicStage.getPointerPosition();
    var shape = this.refs.graphicStage.getIntersection(pos);

    this.state.selection.x2 = pos.x;
    this.state.selection.y2 = pos.y;
    this.updateSelectionRect();

    if (shape && shape.attrs.link) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }

    //if we are moving an arrow
    if (this.state.newArrowRef !== "") {
      //filling color logic:

      var transform = this.refs.layer2.getAbsoluteTransform().copy();
      transform.invert();

      pos = transform.point(pos);
      this.setState({ arrowEndX: pos.x, arrowEndY: pos.y });
      //last non arrow object
      if (shape && shape.attrs && shape.attrs.name != undefined) {
        //  console.log(shape);
        if (!shape.attrs.name.includes("arrow")) {
          //after first frame
          if (this.state.previousShape)
            if (this.state.previousShape !== shape) {
              //arrow entered a new shape

              //set current arrow to blue
              if (this.state.previousShape.attrs.id !== "ContainerRect") {
                this.state.arrows.map(eachArrow => {
                  if (eachArrow.name === this.state.newArrowRef) {
                    eachArrow.fill = "black";
                    eachArrow.stroke = "black";
                  }
                });
                this.forceUpdate();
              } else {
                this.state.arrows.map(eachArrow => {
                  if (eachArrow.name === this.state.newArrowRef) {
                    eachArrow.fill = "#ccf5ff";
                    eachArrow.stroke = "#ccf5ff";
                  }
                });
                this.forceUpdate();
              }
            }
          //if arrow is moving in a single shape
        }

        if (!shape.attrs.name.includes("arrow")) {
          this.setState({ previousShape: shape });
        }
      }
    }
    var arrows = this.state.arrows;

    arrows.map(eachArrow => {
      if (eachArrow.name === this.state.newArrowRef) {
        var index = arrows.indexOf(eachArrow);
        let currentArrow = eachArrow;
        currentArrow.points = [
          currentArrow.points[0],
          currentArrow.points[1],
          pos.x,
          pos.y
          /*  event.evt.pageY -
            document.getElementById("NavBar").getBoundingClientRect().height */
        ];

        this.state.arrows[index] = currentArrow;
      }
    });
  };
  handleWheel(event) {
    if (
      this.state.rectangles.length === 0 &&
      this.state.ellipses.length === 0 &&
      this.state.stars.length === 0 &&
      this.state.texts.length === 0 &&
      this.state.triangles.length == 0 &&
      this.state.arrows.length === 0 &&
      this.state.images.length === 0 &&
      this.state.videos.length === 0 &&
      this.state.audios.length === 0 &&
      this.state.documents.length === 0
    ) {
    } else {
      event.evt.preventDefault();
      const scaleBy = 1.2;
      const stage = this.refs.graphicStage;
      const layer = this.refs.layer2;
      const oldScale = layer.scaleX();
      const mousePointTo = {
        x:
          stage.getPointerPosition().x / oldScale -
          this.state.layerX / oldScale,
        y:
          stage.getPointerPosition().y / oldScale - this.state.layerY / oldScale
      };

      const newScale =
        event.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

      layer.scale({ x: newScale, y: newScale });

      /*  console.log(
        oldScale,
        mousePointTo,
        stage.getPointerPosition().x,
        stage.getPointerPosition().y
      );
    */
      this.setState({
        layerScale: newScale,
        layerX:
          -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
          newScale,
        layerY:
          -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    let prevMainShapes = [
      prevState.rectangles,
      prevState.ellipses,
      prevState.stars,
      prevState.arrows,
      prevState.connectors,
      prevState.texts,
      prevState.triangles,
      prevState.images,
      prevState.videos,
      prevState.audios,
      prevState.documents
    ];
    let currentMainShapes = [
      this.state.rectangles,
      this.state.ellipses,
      this.state.stars,
      this.state.arrows,
      this.state.connectors,
      this.state.texts,
      this.state.triangles,
      this.state.images,
      this.state.videos,
      this.state.audios,
      this.state.documents
    ];

    if (!this.state.redoing && !this.state.isTransforming)
      if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
        if (
          JSON.stringify(prevMainShapes) !== JSON.stringify(currentMainShapes)
        ) {
          //if text shouldn't update, don't append to  history
          if (this.state.shouldTextUpdate) {
            var uh = history;
            history = uh.slice(0, historyStep + 1);
            //console.log("sliced", history);
            var toAppend = this.state;
            history = history.concat(toAppend);
            //console.log("new", history);
            historyStep += 1;
            //console.log(history, historyStep, history[historyStep]);
          }
        }
      } else {
        //console.log("compoenntDidUpdate but attrs didn't change");
      }
    this.state.redoing = false;
  }

  handleUndo = () => {
    this.handleSave()
    if (!this.state.isTransforming) {
      if (!this.state.textEditVisible) {
        if (historyStep === 0) {
          return;
        }
        historyStep -= 1;

        this.setState(
          {
            rectangles: history[historyStep].rectangles,
            arrows: history[historyStep].arrows,
            ellipses: history[historyStep].ellipses,
            triangles: history[historyStep].triangles,
            images: history[historyStep].images,
            videos: history[historyStep].videos,
            audios: history[historyStep].audios,
            stars: history[historyStep].stars,
            texts: history[historyStep].texts,
            documents: history[historyStep].documents,
            connectors: history[historyStep].connectors,
            redoing: true,
            selectedShapeName: this.shapeIsGone(history[historyStep])
              ? ""
              : this.state.selectedShapeName
          },
          () => {
            this.refs.graphicStage.draw();
          }
        );
      }
      this.setState({
        selectedContextMenu: false
      })
    }
  };

  handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }
    historyStep += 1;
    const next = history[historyStep];
    this.setState(
      {
        rectangles: next.rectangles,
        arrows: next.arrows,
        ellipses: next.ellipses,
        triangles: next.triangles,
        images: next.images,
        videos: next.videos,
        audios: next.audios,
        documents: next.documents,
        stars: next.stars,
        texts: next.texts,
        redoing: true,
        selectedShapeName: this.shapeIsGone(history[historyStep])
          ? ""
          : this.state.selectedShapeName
      },
      () => {
        this.forceUpdate();
      }
    );
    this.setState({
      selectedContextMenu: false
    })
  };

  handleCopy = () => {
    if (this.state.selectedShapeName !== "") {
      //find it
      let name = this.state.selectedShapeName;
      let copiedElement = null;
      if (name.includes("rect")) {
        console.log(this.state.rectangles)
        copiedElement = this.state.rectangles.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("ellipse")) {
        copiedElement = this.state.ellipses.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("triangle")) {
        copiedElement = this.state.triangles.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("image")) {
        console.log(this.state.images)
        copiedElement = this.state.images.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("video")) {
        copiedElement = this.state.videos.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
     }  else if (name.includes("audio")) {
       copiedElement = this.state.audios.filter(function(
         eachRect
       ) {
         return eachRect.name === name;
       });
    }    else if (name.includes("document")) {
      copiedElement = this.state.documents.filter(function(
        eachRect
      ) {
        return eachRect.name === name;
      });
    } else if (name.includes("star")) {
        copiedElement = this.state.stars.filter(function(eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("text")) {
        copiedElement = this.state.texts.filter(function(eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("arrow")) {
        copiedElement = this.state.arrows.filter(function(eachRect) {
          return eachRect.name === name;
        });
      }

      this.setState({ copiedElement: copiedElement }, () => {
        console.log("copied ele", this.state.copiedElement);
      });
      this.setState({
        selectedContextMenu: false
      })
    }
  }

  handlePaste = () => {
    let copiedElement = this.state.copiedElement[0];
    console.log(copiedElement);
    var length;
    if (copiedElement) {
      if (copiedElement.attrs) {
      } else {
        if (copiedElement.name.includes("rectangle")) {
          length =
            this.state.rectangles.length +
            1 +
            this.state.rectDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            width: copiedElement.width,
            height: copiedElement.height,
            stroke: copiedElement.stroke,
            strokeWidth: copiedElement.strokeWidth,
            id:
              "rectangle" +
              (this.state.rectangles.length +
                this.state.rectDeleteCount +
                1),
            ref:
              "rectangle" +
              (this.state.rectangles.length +
                this.state.rectDeleteCount +
                1),
            fill: copiedElement.fill,
            useImage: copiedElement.useImage,
            link: copiedElement.link,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              rectangles: [...prevState.rectangles, toPush]
            }),
            () => {
              this.setState({
                selectedShapeName:
                  "rectangle" + this.state.rectangles.length
              });
            }
          );
        } else if (copiedElement.name.includes("arrow")) {
          length =
            this.state.arrows.length +
            1 +
            this.state.arrowDeleteCount;

          if (copiedElement.to || copiedElement.from) {
            this.setState(
              {
                errMsg: "Connectors cannot be pasted"
              },
              () => {
                var that = this;
                setTimeout(function() {
                  that.setState({
                    errMsg: ""
                  });
                }, 1000);
              }
            );
          } else {
            var toPush = {
              points: [
                copiedElement.points[0] + 30,
                copiedElement.points[1] + 30,
                copiedElement.points[2] + 30,
                copiedElement.points[3] + 30
              ],
              fill: copiedElement.fill,
              link: copiedElement.link,
              stroke: copiedElement.stroke,
              strokeWidth: copiedElement.strokeWidth,
              id:
                "arrow" +
                (this.state.arrows.length +
                  1 +
                  this.state.arrowDeleteCount),
              ref:
                "arrow" +
                (this.state.arrows.length +
                  1 +
                  this.state.arrowDeleteCount),
              rotation: copiedElement.rotation
            };

            let newName = this.state.selectedShapeName;

            this.setState(
              prevState => ({
                arrows: [...prevState.arrows, toPush]
              }),
              () => {
                this.setState({
                  selectedShapeName:
                    "arrow" + this.state.arrows.length
                });
              }
            );
          }
        } else if (copiedElement.name.includes("ellipse")) {
          length =
            this.state.ellipses.length +
            1 +
            this.state.ellipseDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            radiusX: copiedElement.radiusX,
            radiusY: copiedElement.radiusY,
            stroke: copiedElement.stroke,
            strokeWidth: copiedElement.strokeWidth,
            id:
              "ellipse" +
              (this.state.ellipses.length +
                1 +
                this.state.ellipseDeleteCount),
            ref:
              "ellipse" +
              (this.state.ellipses.length +
                1 +
                this.state.ellipseDeleteCount),
            fill: copiedElement.fill,
            link: copiedElement.link,
            useImage: copiedElement.useImage,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              ellipses: [...prevState.ellipses, toPush]
            }),
            () => {
              this.setState({
                selectedShapeName:
                  "ellipse" + this.state.ellipses.length
              });
            }
          );
        } else if (copiedElement.name.includes("image")) {
        length =
          this.state.images.length +
          1 +
          this.state.imageDeleteCount;
        var toPush = {
          x: copiedElement.x + 10,
          y: copiedElement.y + 10,
          width: copiedElement.width,
          height: copiedElement.height,
          imgsrc: copiedElement.imgsrc,
          stroke: copiedElement.stroke,
          strokeWidth: copiedElement.strokeWidth,
          id:
            "image" +
            (this.state.images.length +
              1 +
              this.state.imageDeleteCount),
          ref:
            "image" +
            (this.state.images.length +
              1 +
              this.state.imageDeleteCount),
          fill: copiedElement.fill,
          link: copiedElement.link,
          useImage: copiedElement.useImage,
          rotation: copiedElement.rotation
        };
        let newName = this.state.selectedShapeName;

        this.setState(
          prevState => ({
            images: [...prevState.images, toPush]
          }),
          () => {
            this.setState({
              selectedShapeName:
                "image" + this.state.images.length
            });
          }
        );
      } else if (copiedElement.name.includes("video")) {
      length =
        this.state.videos.length +
        1 +
        this.state.videoDeleteCount;
      var toPush = {
        x: copiedElement.x + 10,
        y: copiedElement.y + 10,
        width: copiedElement.width,
        height: copiedElement.height,
        vidsrc: copiedElement.vidsrc,
        stroke: copiedElement.stroke,
        strokeWidth: copiedElement.strokeWidth,
        id:
          "video" +
          (this.state.videos.length +
            1 +
            this.state.videoDeleteCount),
        ref:
          "video" +
          (this.state.videos.length +
            1 +
            this.state.videoDeleteCount),
        fill: copiedElement.fill,
        link: copiedElement.link,
        useImage: copiedElement.useImage,
        rotation: copiedElement.rotation
      };
      let newName = this.state.selectedShapeName;

      this.setState(
        prevState => ({
          videos: [...prevState.videos, toPush]
        }),
        () => {
          this.setState({
            selectedShapeName:
              "video" + this.state.videos.length
          });
        }
      );
    } else if (copiedElement.name.includes("audio")) {
    length =
      this.state.audios.length +
      1 +
      this.state.audioDeletedCount;
    var toPush = {
      x: copiedElement.x + 10,
      y: copiedElement.y + 10,
      width: copiedElement.width,
      height: copiedElement.height,
      audsrc: copiedElement.audsrc,
      stroke: copiedElement.stroke,
      strokeWidth: copiedElement.strokeWidth,
      id:
        "audio" +
        (this.state.audios.length +
          1 +
          this.state.audioDeletedCount),
      ref:
        "audio" +
        (this.state.audios.length +
          1 +
          this.state.audioDeletedCount),
      fill: copiedElement.fill,
      link: copiedElement.link,
      useImage: copiedElement.useImage,
      rotation: copiedElement.rotation
    };
    let newName = this.state.selectedShapeName;

    this.setState(
      prevState => ({
        audios: [...prevState.audios, toPush]
      }),
      () => {
        this.setState({
          selectedShapeName:
            "audio" + this.state.audios.length
        });
      }
    );
  } else if (copiedElement.name.includes("triangle")) {
      length =
        this.state.triangles.length +
        1 +
        this.state.triangleDeleteCount;
      var toPush = {
        x: copiedElement.x + 10,
        y: copiedElement.y + 10,
        width: copiedElement.width,
        height: copiedElement.height,
        sides: copiedElement.sides,
        radius: copiedElement.radius,
        stroke: copiedElement.stroke,
        strokeWidth: copiedElement.strokeWidth,
        id:
          "triangle" +
          (this.state.triangles.length +
            1 +
            this.state.triangleDeleteCount),
        ref:
          "triangle" +
          (this.state.triangles.length +
            1 +
            this.state.triangleDeleteCount),
        fill: copiedElement.fill,
        link: copiedElement.link,
        useImage: copiedElement.useImage,
        rotation: copiedElement.rotation
      };
      let newName = this.state.selectedShapeName;

      this.setState(
        prevState => ({
          triangles: [...prevState.triangles, toPush]
        }),
        () => {
          this.setState({
            selectedShapeName:
              "triangle" + this.state.triangles.length
          });
        }
      );
    } else if (copiedElement.name.includes("document")) {
        length =
          this.state.documents.length +
          1 +
          this.state.documentDeleteCount;
        var toPush = {
          x: copiedElement.x + 10,
          y: copiedElement.y + 10,
          width: copiedElement.width,
          height: copiedElement.height,
          sides: copiedElement.sides,
          radius: copiedElement.radius,
          stroke: copiedElement.stroke,
          strokeWidth: copiedElement.strokeWidth,
          id:
            "document" +
            (this.state.documents.length +
              1 +
              this.state.documentDeleteCount),
          ref:
            "document" +
            (this.state.documents.length +
              1 +
              this.state.documentDeleteCount),
          fill: copiedElement.fill,
          link: copiedElement.link,
          useImage: copiedElement.useImage,
          rotation: copiedElement.rotation
        };
        let newName = this.state.selectedShapeName;

        this.setState(
          prevState => ({
            documents: [...prevState.documents, toPush]
          }),
          () => {
            this.setState({
              selectedShapeName:
                "document" + this.state.documents.length
            });
          }
        );
      } else if (copiedElement.name.includes("star")) {
          length =
            this.state.stars.length + 1 + this.state.starDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            link: copiedElement.link,
            innerRadius: copiedElement.innerRadius,
            outerRadius: copiedElement.outerRadius,
            stroke: copiedElement.stroke,
            strokeWidth: copiedElement.strokeWidth,
            id:
              "star" +
              (this.state.stars.length +
                1 +
                this.state.starDeleteCount),
            ref:
              "star" +
              (this.state.stars.length +
                1 +
                this.state.starDeleteCount),
            fill: copiedElement.fill,
            useImage: copiedElement.useImage,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              stars: [...prevState.stars, toPush]
            }),
            () => {
              this.setState({
                selectedShapeName: "star" + this.state.stars.length
              });
            }
          );
        } else if (copiedElement.name.includes("text")) {
          length =
            this.state.texts.length + 1 + this.state.textDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            link: copiedElement.link,

            id:
              "text" +
              (this.state.texts.length +
                1 +
                this.state.textDeleteCount),
            ref:
              "text" +
              (this.state.texts.length +
                1 +
                this.state.textDeleteCount),
            fill: copiedElement.fill,
            fontSize: copiedElement.fontSize,
            fontFamily: copiedElement.fontFamily,
            useImage: copiedElement.useImage,
            text: copiedElement.text,
            width: copiedElement.width,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              texts: [...prevState.texts, toPush]
            }),
            () => {
              this.setState(
                {
                  selectedShapeName:
                    "text" +
                    (this.state.texts.length +
                      this.state.textDeleteCount)
                },
                () => {
                  console.log(this.state.selectedShapeName);
                }
              );
            }
          );
        }
      }
      this.setState({
        selectedContextMenu: false
      })
    }
  }

  handleDelete = () => {
    if (this.state.selectedShapeName !== "") {
      var that = this;
      //delete it from the state too
      let name = this.state.selectedShapeName;
      let rectDeleted = false,
        ellipseDeleted = false,
        starDeleted = false,
        arrowDeleted = false,
        textDeleted = false,
        triangleDeleted = false,
        imageDeleted = false,
        videoDelete = false,
        audiosDeleted = false,
        documentsDeleted = false;

      var rects = this.state.rectangles.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            rectDeleteCount: that.state.rectDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var ellipses = this.state.ellipses.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            ellipseDeleteCount: that.state.ellipseDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var triangles = this.state.triangles.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            triangleDeleteCount: that.state.triangleDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var images = this.state.images.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            imageDeleteCount: that.state.imageDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var videos = this.state.videos.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            videoDeleteCount: that.state.videoDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var audios = this.state.audios.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            audioDeletedCount: that.state.audioDeletedCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var documents = this.state.documents.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            documentDeletedCount: that.state.documentDeletedCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var stars = this.state.stars.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            starDeleteCount: that.state.starDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var arrows = this.state.arrows.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            arrowDeleteCount: that.state.arrowDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var texts = this.state.texts.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            textDeleteCount: that.state.textDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      this.setState({
        rectangles: rects,
        ellipses: ellipses,
        triangles: triangles,
        images: images,
        videos: videos,
        audios: audios,
        documents: documents,
        stars: stars,
        arrows: arrows,
        texts: texts,
        selectedShapeName: ""
      });
      this.setState({
        selectedContextMenu: false
      })
    }
  }

  handleCut = () => {
    this.handleDelete();
    this.handleCopy();
    this.setState({
      selectedContextMenu: false
    })
  }

  handleClose = (e) => {
    this.setState({
      selectedContextMenu: false
    })
  }

  shapeIsGone = returnTo => {
    var toReturn = true;
    let currentShapeName = this.state.selectedShapeName;
    let [rectangles, ellipses, stars, arrows, texts, triangles, images, videos, audios, documents] = [
      returnTo.rectangles,
      returnTo.ellipses,
      returnTo.stars,
      returnTo.arrows,
      returnTo.triangles,
      returnTo.images,
      returnTo.videos,
      returnTo.audios,
      returnTo.documents,

      returnTo.texts
    ];
    rectangles.map(eachRect => {
      if (eachRect.id === currentShapeName) {
        toReturn = false;
      }
    });
    ellipses.map(eachEllipse => {
      if (eachEllipse.id === currentShapeName) {
        toReturn = false;
      }
    });
    triangles.map(eachTriangle => {
      if (eachTriangle.id === currentShapeName) {
        toReturn = false;
      }
    });
    images.map(eachImage => {
      if (eachImage.id === currentShapeName) {
        toReturn = false;
      }
    });
    videos.map(eachVideo => {
      if (eachVideo.id === currentShapeName) {
        toReturn = false;
      }
    });
    audios.map(eachAudio => {
      if (eachAudio.id === currentShapeName) {
        toReturn = false;
      }
    });
    documents.map(eachDocument => {
      if (eachDocument.id === currentShapeName) {
        toReturn = false;
      }
    });
    stars.map(eachStar => {
      if (eachStar.id === currentShapeName) {
        toReturn = false;
      }
    });
    arrows.map(eachArrow => {
      if (eachArrow.id === currentShapeName) {
        toReturn = false;
      }
    });

    texts.map(eachText => {
      if (eachText.id === currentShapeName) {
        toReturn = false;
      }
    });

    return toReturn;
  };
  IsJsonString = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  async componentDidMount() {
    history.push(this.state);
    this.setState({ selectedShapeName: "" });
    //if draft

  }

  addRectangle = () => {
    var rectName = this.state.rectangles.length + 1 + this.state.rectDeleteCount


    let name = 'rectangle' + rectName
    const rect = {
      x: 800,
      y: 400,
      width: 100,
      height:100,
      stroke: 'black',
      strokeWidth: 1.5,
      rotation: 0,
      ref: name,
      name: name,
      id: name,
      fill: this.state.colorf,
      useImage: false,
    };
    var layer = this.refs.layer2;
    var toPush = rect;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      rectangles: [...prevState.rectangles, toPush],
      selectedShapeName: toPush.name
    }));

  };

  addTriangle = () => {

    var triName = this.state.triangles.length + 1 + this.state.triangleDeleteCount

    let name = 'triangle' + triName
    const tri = {
      x: 800,
      y: 400,
      width: 100,
      height:100,
      height: 100,
      sides: 3,
      radius: 70,
      stroke: 'black',
      strokeWidth: 1.5,
      rotation: 0,
      id: name,
      name: name,
      ref: name,
      fill: this.state.colorf,
      useImage: false
    };
    var layer = this.refs.layer2;
    var toPush = tri;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      triangles: [...prevState.triangles, toPush],
      selectedShapeName: toPush.name
    }));
  };

  addImage = () => {
    var imgName = this.state.images.length + 1 + this.state.imageDeleteCount
    var imgsrc = this.state.imgsrc

    let name = 'image' + imgName
    const img = {
      x: 800,
      y: 400,
      width: 200,
      height: 200,
      imgsrc: imgsrc,
      stroke: 'black',
      strokeWidth: 1.5,
      opacity: 1,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = img;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      images: [...prevState.images, toPush],
      selectedShapeName: toPush.name
    }));
  };

  addVideo = () => {
    var vidName = this.state.videos.length + 1 + this.state.videoDeleteCount
    var vidsrc = this.state.vidsrc

    let name = 'video' + vidName
    const vid = {
      x: 600,
      y: 100,
      width: 400,
      height: 400,
      vidsrc: vidsrc,
      stroke: 'black',
      strokeWidth: 1.5,
      opacity: 1,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = vid;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      videos: [...prevState.videos, toPush],
      selectedShapeName: toPush.name
    }));
  };

  addAudio = () => {
    var audName = this.state.audios.length + 1 + this.state.audioDeletedCount
    var audsrc = this.state.audsrc


    let name = 'audio' + audName
    const aud = {
      x: 600,
      y: 100,
      width: 100,
      height: 100,
      imgsrc: "sound.png",
      audsrc: audsrc,
      stroke: 'black',
      strokeWidth: 0,
      opacity: 1,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = aud;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      audios: [...prevState.audios, toPush],
      selectedShapeName: toPush.name
    }));

  };

  addDocument = () => {
    var docName = this.state.documents.length + 1 + this.state.documentDeleteCount
    var audsrc = this.state.audsrc


    const bimage = new window.Image();
        bimage.onload = () => {
          this.setState({
            docimage: bimage
          })
        }
        bimage.src = 'downloadicon.png';
        bimage.width = 10;
        bimage.height = 10;


    let name = 'document' + docName
    const doc = {
      x: 800,
      y: 400,
      width: 100,
      height: 100,
      stroke: 'black',
      strokeWidth: 0,
      fillPatternImage: this.state.docimage,
      fillPatternOffset: "",
      rotation: 0,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = doc;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      documents: [...prevState.documents, toPush],
      selectedShapeName: toPush.name
    }));

  };


  addCircle = () => {
    var circName = this.state.ellipses.length + 1 + this.state.ellipseDeleteCount

    let name = 'ellipse' + circName
    const circ = {
      x: 800,
      y: 400,
      radiusX: 50,
      radiusY: 50,
      stroke: 'black',
      strokeWidth: 1.5,
      id: name,
      fill: 'white',
      ref: name,
      name: name,
      rotation: 0
    };
    var layer = this.refs.layer2;
    var toPush = circ;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      ellipses: [...prevState.ellipses, toPush],
      selectedShapeName: toPush.name
    }))
  };

  addStar = () => {
    var starName = this.state.stars.length + 1 + this.state.starDeleteCount

    let name = 'star' + starName
    const star = {
      x: 800,
      y: 400,
      width: 100,
      height: 100,
      numPoints: 5,
      innerRadius: 30,
      outerRadius: 70,
      stroke: 'black',
      strokeWidth: 1.5,
      id: name,
      name: name,
      fill: 'white',
      ref: name,
      rotation: 0
    };
    var layer = this.refs.layer2;
    var toPush = star;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      stars: [...prevState.stars, toPush],
      selectedShapeName: toPush.name
    }))
  };

  addText = () => {
    var textName = this.state.texts.length + 1 + this.state.textDeleteCount

    let name = 'text' + textName
    let ref = 'text' + textName
    const tex = {
      x: 800,
      y: 400,
      width: 300,
      height: 25,
      fontSize: 40,
      text: "Edit this",
      fontFamily: "Belgrano",
      id: name,
      name: name,
      fill: 'black',
      ref: ref,

      rotation: 0
    };

    var layer = this.refs.layer2;
    var toPush = tex;
    var stage = this.refs.graphicStage;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      texts: [...prevState.texts, toPush]
    }));

    //we can also just get element by this.refs.toPush.ref

    //  let text = stage.findOne("." + toPush.name);

  }

  handleColorF = (e) =>{
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              fill: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              fill: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              fill: e.hex
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              fill: e.hex
            }
          : eachStar
      )
    }));
  }

  handleColorS = (e) => {
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      images: prevState.images.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      videos: prevState.videos.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      audios: prevState.audios.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              stroke: e.hex
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              stroke: e.hex
            }
          : eachStar
      )
    }));

  }

  handleWidth = (e) =>{
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      images: prevState.images.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      videos: prevState.videos.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      audios: prevState.audios.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      documents: prevState.documents.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              strokeWidth: e/9
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              strokeWidth: e/9
            }
          : eachStar
      )
    }));
  }

  handleOpacity = (e) => {
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      images: prevState.images.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      documents: prevState.documents.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      videos: prevState.videos.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      audios: prevState.audios.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              opacity: e
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              opacity: e
            }
          : eachStar
      )
    }));
  }

  handleImage = (e) => {
    this.setState({
      imgsrc: e
    })
    console.log(e)
  }
  handleVideo = (e) => {
    this.setState({
      vidsrc: e
    })
    console.log(e)
  }
  handleAudio = (e) => {
    this.setState({
      audsrc: e
    })
    console.log(e)
  }
  handleDocument = (e) => {
    this.setState({
      docsrc: e
    })
    console.log(e)
  }
  handleDownload = (url, filename) => {
  axios.get(url, {
    responseType: 'blob',
  })
  .then((res) => {
    fileDownload(res.data, filename)
    console.log(res)
  })
  console.log(8)
}

  drawLine = () => {
    addLine(this.refs.graphicStage.getStage(), this.refs.layer2, "brush", this.state.colorf, true);
  };
  eraseLine = () => {
    addLine(this.refs.graphicStage.getStage(), this.refs.layer2, "erase", this.state.colorf, true);
  };
  stopDrawing = () => {
    addLine(this.refs.graphicStage.getStage(), this.refs.layer2, "brush", this.state.colorf, false);
  };


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
        <div
          onKeyDown={event => {
            const x = 88,
              deleteKey = 46,
              copy = 67,
              paste = 86,
              z = 90,
              y = 89;
            if (event.ctrlKey && event.keyCode === x && !this.state.isPasteDisabled) {
                this.handleDelete();
                this.handleCopy();
            } else if (event.keyCode === deleteKey  && !this.state.isPasteDisabled) {
              this.handleDelete();
            } else if (event.shiftKey && event.ctrlKey && event.keyCode === z) {
              this.handleRedo();
            } else if (event.ctrlKey && event.keyCode === z) {
              this.handleUndo();
            } else if (event.ctrlKey && event.keyCode === y) {
              this.handleRedo();
            } else if (event.ctrlKey && event.keyCode === copy) {
              this.handleCopy();
            } else if (event.ctrlKey && event.keyCode === paste && !this.state.isPasteDisabled) {
              this.handlePaste();
            } else if (event.ctrlKey) {
              this.setState({
                draggable: true
              })
            }}}
          tabIndex="0"
          style={{ outline: "none" }}
        >
          <Stage
            onClick={this.handleStageClick}
            draggabble
            onMouseMove={this.handleMouseOver}
            onWheel={event => this.handleWheel(event)}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.handleMouseUp}
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
              draggable={this.state.draggable}
              onDragEnd={() => {
                this.setState({
                  layerX: this.refs.layer2.x(),
                  layerY: this.refs.layer2.y()
                });
              }}
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
                return (
                  <Rect
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
                  draggable
                    onClick={() => {
                      var that = this;
                      if (eachRect.link !== undefined && eachRect.link !== "") {
                        this.setState(
                          {
                            errMsg: "Links will not be opened in create mode"
                          },
                          () => {
                            setTimeout(function() {
                              that.setState({
                                errMsg: ""
                              });
                            }, 1000);
                          }
                        );
                      }
                    }}
                    onTransformStart={() => {
                      this.setState({
                        isTransforming: true
                      });
                      let rect = this.refs[eachRect.ref];
                      rect.setAttr("lastRotation", rect.rotation());
                    }}
                    onTransform={() => {
                      let rect = this.refs[eachRect.ref];

                      if (rect.attrs.lastRotation !== rect.rotation()) {
                        this.state.arrows.map(eachArrow => {
                          if (
                            eachArrow.to &&
                            eachArrow.to.name() === rect.name()
                          ) {
                            this.setState({
                              errMsg:
                                "Rotating rects with connectors might skew things up!"
                            });
                          }
                          if (
                            eachArrow.from &&
                            eachArrow.from.name() === rect.name()
                          ) {
                            this.setState({
                              errMsg:
                                "Rotating rects with connectors might skew things up!"
                            });
                          }
                        });
                      }

                      rect.setAttr("lastRotation", rect.rotation());
                    }}
                    onTransformEnd={() => {
                      this.setState({
                        isTransforming: false
                      });

                      let rect = this.refs[eachRect.ref];

                      this.setState(
                        prevState => ({
                          errMsg: "",
                          rectangles: prevState.rectangles.map(eachRect =>
                            eachRect.id === rect.attrs.id
                              ? {
                                  ...eachRect,
                                  width: rect.width() * rect.scaleX(),
                                  height: rect.height() * rect.scaleY(),
                                  rotation: rect.rotation(),
                                  x: rect.x(),
                                  y: rect.y(),

                                }
                              : eachRect
                          )
                        }),
                        () => {
                          this.forceUpdate();
                        }
                      );

                      rect.setAttr("scaleX", 1);
                      rect.setAttr("scaleY", 1);
                    }}

                    onDragMove={() => {
                      this.state.arrows.map(eachArrow => {
                        if (eachArrow.from !== undefined) {
                          if (eachRect.name === eachArrow.from.attrs.name) {
                            eachArrow.points = [
                              eachRect.x,
                              eachRect.y,
                              eachArrow.points[2],
                              eachArrow.points[3]
                            ];
                            this.forceUpdate();
                          }
                        }

                        if (eachArrow.to !== undefined) {
                          if (eachRect.name == eachArrow.to.attrs.name) {
                            eachArrow.points = [
                              eachArrow.points[0],
                              eachArrow.points[1],
                              eachRect.x,
                              eachRect.y
                            ];
                            this.forceUpdate();
                          }
                        }
                      });
                    }}
                    onDragEnd={event => {
                      //cannot compare by name because currentSelected might not be the same
                      //have to use ref, which appears to be overcomplicated
                      var shape = this.refs[eachRect.ref];
                      /*    this.state.rectangles.map(eachRect => {
                          if (eachRect.name === shape.attrs.name) {
                            shape.position({
                              x: event.target.x(),
                              y: event.target.y()
                            });
                          }
                        });*/

                      this.setState(prevState => ({
                        rectangles: prevState.rectangles.map(eachRect =>
                          eachRect.id === shape.attrs.id
                            ? {
                                ...eachRect,
                                x: event.target.x(),
                                y: event.target.y(),
                              }
                            : eachRect
                        )
                      }));
                    }}
                    onContextMenu={e => {

                      e.evt.preventDefault(true);
                      const mousePosition = e.target.getStage().getPointerPosition();

                      this.setState({
                        selectedContextMenu: {
                          type: "START",
                          position: mousePosition
                        }
                      });
                    }
                    }

                  />
                );
              })}
              {this.state.selectedContextMenu && (
                <Portal>
              <ContextMenu
                {...this.state.selectedContextMenu}
                selectedshape={this.state.selectedShapeName}
                onOptionSelected={this.handleOptionSelected}
                choosecolors={this.handleColorS}
                choosecolorf={this.handleColorF}
                handleWidth={this.handleWidth}
                handleOpacity={this.handleOpacity}
                close={this.handleClose}
                copy={this.handleCopy}
                cut={this.handleCut}
                paste={this.handlePaste}
                delete={this.handleDelete}
              />
              </Portal>
            )}

              {this.state.ellipses.map(eachEllipse => (
                <Ellipse
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
                  onClick={() => {
                    var that = this;
                    if (
                      eachEllipse.link !== undefined &&
                      eachEllipse.link !== ""
                    ) {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                    let ellipse = this.refs[eachEllipse.ref];
                    ellipse.setAttr("lastRotation", ellipse.rotation());
                  }}
                  onTransform={() => {
                    let ellipse = this.refs[eachEllipse.ref];

                    if (ellipse.attrs.lastRotation !== ellipse.rotation()) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === ellipse.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === ellipse.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                      });
                    }

                    ellipse.setAttr("lastRotation", ellipse.rotation());
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let ellipse = this.refs[eachEllipse.ref];
                    let scaleX = ellipse.scaleX(),
                      scaleY = ellipse.scaleY();

                    this.setState(prevState => ({
                      errMsg: "",
                      ellipses: prevState.ellipses.map(eachEllipse =>
                        eachEllipse.id === ellipse.attrs.id
                          ? {
                              ...eachEllipse,

                              radiusX: ellipse.radiusX() * ellipse.scaleX(),
                              radiusY: ellipse.radiusY() * ellipse.scaleY(),
                              rotation: ellipse.rotation(),
                              x: ellipse.x(),
                              y: ellipse.y()
                            }
                          : eachEllipse
                      )
                    }));

                    ellipse.setAttr("scaleX", 1);
                    ellipse.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        console.log("prevArrow: ", eachArrow.points);
                        if (eachEllipse.name == eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachEllipse.x,
                            eachEllipse.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();

                          this.refs.graphicStage.draw();
                        }
                        console.log("new arrows:", eachArrow.points);
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachEllipse.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachEllipse.x,
                            eachEllipse.y
                          ];
                          this.forceUpdate();
                          this.refs.graphicStage.draw();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachEllipse.ref];

                    this.setState(prevState => ({
                      ellipses: prevState.ellipses.map(eachEllipse =>
                        eachEllipse.id === shape.attrs.id
                          ? {
                              ...eachEllipse,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachEllipse
                      )
                    }));

                    this.refs.graphicStage.draw();
                  }}
                  onContextMenu={e => {
                    var audio = new Audio("https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3")
                    audio.play()
                    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }
                />
              ))}

              {this.state.images.map(eachImage => (
                <URLImage
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
                  onClick={() => {
                    var that = this;
                    if (eachImage.link !== undefined && eachImage.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachImage.ref];

                }}

                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachImage.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachImage.x,
                            eachImage.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachImage.name == eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachImage.x,
                            eachImage.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {

                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachImage.ref];
                    /*    this.state.rectangles.map(eachRect => {
                        if (eachRect.name === shape.attrs.name) {
                          shape.position({
                            x: event.target.x(),
                            y: event.target.y()
                          });
                        }
                      });*/
                      console.log(this.refs)

                    this.setState(prevState => ({
                      images: prevState.images.map(eachRect =>
                        eachRect.id === shape.props.id
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));

                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
              ))}
              {this.state.videos.map(eachVideo => (
                <URLvideo
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
                  onClick={() => {
                    var that = this;
                    if (eachVideo.link !== undefined && eachVideo.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachVideo.ref];

                }}

                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachVideo.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachVideo.x,
                            eachVideo.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachVideo.name == eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachVideo.x,
                            eachVideo.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    console.log(this.state.videos)
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachVideo.ref];
                    this.setState(prevState => ({
                      videos: prevState.videos.map(eachRect =>
                        eachRect.id === this.state.currentSelected
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));
                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
              ))}
              {this.state.audios.map(eachAudio => (
                <URLvideo
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
                  onClick={() => {

                    var that = this;
                    if (eachAudio.link !== undefined && eachAudio.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachAudio.ref];

                }}

                  onDragMove={() => {

                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachAudio.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachAudio.x,
                            eachAudio.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachAudio.name == eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachAudio.x,
                            eachAudio.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {

                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachAudio.ref];



                    this.setState(prevState => ({
                      videos: prevState.videos.map(eachRect =>
                        eachRect.id === this.state.currentSelected
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));
                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
              ))}
              {this.state.documents.map(eachDoc => (
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
                  onClick={() => {
                    console.log(this.state.docsrc)
                    fetch(this.state.docsrc, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/pdf',
                        },
                      })
                      .then((response) => response.blob())
                      .then((blob) => {
                        console.log(blob)

                        // Create blob link to download
                        const url = window.URL.createObjectURL(
                          new Blob([blob]),
                        );
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute(
                          'download',
                          this.state.docsrc,
                        );

                        // Append to html link element page
                        document.body.appendChild(link);

                        // Start download
                        link.click();

                        // Clean up and remove the link
                        link.parentNode.removeChild(link);
                      });
                    }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachDoc.ref];

                }}
                draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachDoc.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachDoc.x,
                            eachDoc.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachDoc.name == eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachDoc.x,
                            eachDoc.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {

                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachDoc.ref];
                    /*    this.state.rectangles.map(eachRect => {
                        if (eachRect.name === shape.attrs.name) {
                          shape.position({
                            x: event.target.x(),
                            y: event.target.y()
                          });
                        }
                      });*/


                    this.setState(prevState => ({
                      documents: prevState.documents.map(eachRect =>
                        eachRect.id === this.state.currentSelected
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));
                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
              ))}
              {this.state.triangles.map(eachEllipse => (
                <RegularPolygon
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
                  onClick={() => {
                    var that = this;
                    if (
                      eachEllipse.link !== undefined &&
                      eachEllipse.link !== ""
                    ) {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                    let triangle = this.refs[eachEllipse.ref];
                    triangle.setAttr("lastRotation", triangle.rotation());
                  }}
                  onTransform={() => {
                    let triangle = this.refs[eachEllipse.ref];

                    if (triangle.attrs.lastRotation !== triangle.rotation()) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === triangle.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === triangle.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                      });
                    }

                    triangle.setAttr("lastRotation", triangle.rotation());
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let triangle = this.refs[eachEllipse.ref];
                    let scaleX = triangle.scaleX(),
                        scaleY = triangle.scaleY();

                    this.setState(prevState => ({
                      errMsg: "",
                      triangles: prevState.triangles.map(eachEllipse =>
                        eachEllipse.id === triangle.attrs.id
                          ? {
                              ...eachEllipse,

                              width: triangle.width() * triangle.scaleX(),
                              height: triangle.height() * triangle.scaleY(),
                              rotation: triangle.rotation(),
                              x: triangle.x(),
                              y: triangle.y()
                            }
                          : eachEllipse
                      )
                    }));

                    triangle.setAttr("scaleX", 1);
                    triangle.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        console.log("prevArrow: ", eachArrow.points);
                        if (eachEllipse.name == eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachEllipse.x,
                            eachEllipse.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                          this.refs.graphicStage.draw();
                        }
                        console.log("new arrows:", eachArrow.points);
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachEllipse.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachEllipse.x,
                            eachEllipse.y
                          ];
                          this.forceUpdate();
                          this.refs.graphicStage.draw();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachEllipse.ref];

                    this.setState(prevState => ({
                      triangles: prevState.triangles.map(eachEllipse =>
                        eachEllipse.id === shape.attrs.id
                          ? {
                              ...eachEllipse,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachEllipse
                      )
                    }));

                    this.refs.graphicStage.draw();
                  }}
                  onContextMenu={e => {
                    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }
                />
              ))}
              {this.state.stars.map(eachStar => (
                <Star
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
                  onClick={() => {
                    var that = this;
                    if (eachStar.link !== undefined && eachStar.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let star = this.refs[eachStar.ref];
                    let scaleX = star.scaleX(),
                      scaleY = star.scaleY();

                    this.setState(prevState => ({
                      stars: prevState.stars.map(eachStar =>
                        eachStar.id === star.attrs.id
                          ? {
                              ...eachStar,
                              innerRadius: star.innerRadius() * star.scaleX(),
                              outerRadius: star.outerRadius() * star.scaleX(),
                              rotation: star.rotation(),
                              x: star.x(),
                              y: star.y()
                            }
                          : eachStar
                      )
                    }));
                    star.setAttr("scaleX", 1);
                    star.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachStar.name == eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachStar.x,
                            eachStar.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachStar.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachStar.x,
                            eachStar.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachStar.ref];

                    this.setState(prevState => ({
                      stars: prevState.stars.map(eachStar =>
                        eachStar.id === shape.attrs.id
                          ? {
                              ...eachStar,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachStar
                      )
                    }));
                  }}
                  onContextMenu={e => {
                    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }
                />
              ))}

              {this.state.texts.map(eachText => (
                //perhaps this.state.texts only need to contain refs?
                //so that we only need to store the refs to get more information
                <Text
                  textDecoration={eachText.link ? "underline" : ""}
                  onTransformStart={() => {
                    var currentText = this.refs[this.state.selectedShapeName];
                    currentText.setAttr("lastRotation", currentText.rotation());
                  }}
                  onTransform={() => {
                    var currentText = this.refs[this.state.selectedShapeName];

                    currentText.setAttr(
                      "width",
                      currentText.width() * currentText.scaleX()
                    );
                    currentText.setAttr("scaleX", 1);

                    currentText.draw();

                    if (
                      currentText.attrs.lastRotation !== currentText.rotation()
                    ) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === currentText.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating texts with connectors might skew things up!"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === currentText.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating texts with connectors might skew things up!"
                          });
                        }
                      });
                    }

                    currentText.setAttr("lastRotation", currentText.rotation());
                  }}
                  onTransformEnd={() => {
                    var currentText = this.refs[this.state.selectedShapeName];

                    this.setState(prevState => ({
                      errMsg: "",
                      texts: prevState.texts.map(eachText =>
                        eachText.id === this.state.selectedShapeName
                          ? {
                              ...eachText,
                              width: currentText.width(),
                              rotation: currentText.rotation(),
                              textWidth: currentText.textWidth,
                              textHeight: currentText.textHeight,
                              x: currentText.x(),
                              y: currentText.y()
                            }
                          : eachText
                      )
                    }));
                    currentText.setAttr("scaleX", 1);
                    currentText.draw();
                  }}
                  link={eachText.link}
                  width={eachText.width}
                  fill={eachText.fill}
                  id={eachText.id}
                  name="shape"
                  ref={eachText.ref}
                  rotation={eachText.rotation}
                  fontFamily={eachText.fontFamily}
                  fontSize={eachText.fontSize}
                  x={eachText.x}
                  y={eachText.y}
                  text={eachText.text}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachText.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachText.x,
                            eachText.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachText.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachText.x,
                            eachText.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachText.ref];

                    this.setState(prevState => ({
                      texts: prevState.texts.map(eachtext =>
                        eachtext.id === shape.attrs.id
                          ? {
                              ...eachtext,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachtext
                      )
                    }));
                  }}
                  onClick={() => {
                    var that = this;
                    if (eachText.link !== undefined && eachText.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );

                      //var win = window.open(eachText.link, "_blank");
                      //win.focus();
                    }
                  }}
                  onDblClick={() => {
                    // turn into textarea
                    var stage = this.refs.graphicStage;
                    var text = stage.findOne("." + eachText.name);

                    this.setState({
                      textX: text.absolutePosition().x,
                      textY: text.absolutePosition().y,
                      textEditVisible: !this.state.textEditVisible,
                      text: eachText.text,
                      textNode: eachText,
                      currentTextRef: eachText.ref,
                      textareaWidth: text.textWidth,
                      textareaHeight: text.textHeight,
                      textareaFill: text.attrs.fill,
                      textareaFontFamily: text.attrs.fontFamily,
                      textareaFontSize: text.attrs.fontSize
                    });
                    let textarea = this.refs.textarea;
                    textarea.focus();
                    text.hide();
                    var transformer = stage.findOne(".transformer");
                    transformer.hide();
                    this.refs.layer2.draw();
                  }}
                />
              ))}
              {this.state.arrows.map(eachArrow => {
                if (!eachArrow.from && !eachArrow.to) {
                  return (
                    <Arrow
                      ref={eachArrow.ref}
                      id={eachArrow.id}
                      name="shape"
                      points={[
                        eachArrow.points[0],
                        eachArrow.points[1],
                        eachArrow.points[2],
                        eachArrow.points[3]
                      ]}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                      draggable
                      onDragEnd={event => {
                        //set new points to current position

                        //usually: state => star => x & y
                        //now: state => arrow => attr => x & y

                        let oldPoints = [
                          eachArrow.points[0],
                          eachArrow.points[1],
                          eachArrow.points[2],
                          eachArrow.points[3]
                        ];

                        let shiftX = this.refs[eachArrow.ref].attrs.x;
                        let shiftY = this.refs[eachArrow.ref].attrs.y;

                        let newPoints = [
                          oldPoints[0] + shiftX,
                          oldPoints[1] + shiftY,
                          oldPoints[2] + shiftX,
                          oldPoints[3] + shiftY
                        ];

                        this.refs[eachArrow.ref].position({ x: 0, y: 0 });
                        this.refs.layer2.draw();

                        this.setState(prevState => ({
                          arrows: prevState.arrows.map(eachArr =>
                            eachArr.name === eachArrow.name
                              ? {
                                  ...eachArr,
                                  points: newPoints
                                }
                              : eachArr
                          )
                        }));
                      }}
                    />
                  );
                } else if (
                  eachArrow.name === this.state.newArrowRef &&
                  (eachArrow.from || eachArrow.to)
                ) {
                  return (
                    <Connector
                      id={eachArrow.id}
                      name="shape"
                      from={eachArrow.from}
                      to={eachArrow.to}
                      arrowEndX={this.state.arrowEndX}
                      arrowEndY={this.state.arrowEndY}
                      current={true}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                    />
                  );
                } else if (eachArrow.from || eachArrow.to) {
                  //if arrow construction is completed
                  return (
                    <Connector
                      id={eachArrow.id}
                      name="shape"
                      from={eachArrow.from}
                      to={eachArrow.to}
                      points={eachArrow.points}
                      current={false}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                    />
                  );
                }
              })}

              {this.state.selectedShapeName.includes("text") ? (
                <TransformerComponent
                  selectedShapeName={this.state.selectedShapeName}
                />
              ) : (
                <TransformerComponent
                  selectedShapeName={this.state.selectedShapeName}
                  ref="trRef"

                  boundBoxFunc={(oldBox, newBox) => {
                      // limit resize
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                />
              )}
              <Rect fill="rgba(0,0,0,0.5)" ref="selectionRectRef" />
            </Layer>

            <Layer
              height={window.innerHeight}
              width={window.innerWidth}
              ref="layer"
            >
              <Toolbar
                layer={this.refs.layer2}
                rectName={
                  this.state.rectangles.length + 1 + this.state.rectDeleteCount
                }
                ellipseName={
                  this.state.ellipses.length + 1 + this.state.ellipseDeleteCount
                }
                triangleName={
                  this.state.triangles.length + 1 + this.state.triangleDeleteCount
                }
                starName={
                  this.state.stars.length + 1 + this.state.starDeleteCount
                }
                textName={
                  this.state.texts.length + 1 + this.state.textDeleteCount
                }
                newArrowOnDragEnd={toPush => {
                  if (toPush.from !== undefined) {
                    //  console.log("we are making a connector");

                    var transform = this.refs.layer2
                      .getAbsoluteTransform()
                      .copy();
                    transform.invert();
                    let uh = transform.point({
                      x: toPush.x,
                      y: toPush.y
                    });
                    toPush.x = uh.x;
                    toPush.y = uh.y;

                    var newArrow = {
                      points: toPush.points,
                      ref:
                        "arrow" +
                        (this.state.arrows.length +
                          1 +
                          this.state.arrowDeleteCount),
                      name:
                        "arrow" +
                        (this.state.arrows.length +
                          1 +
                          this.state.arrowDeleteCount),
                      from: toPush.from,
                      stroke: toPush.stroke,
                      strokeWidth: toPush.strokeWidth,
                      fill: toPush.fill
                    };

                    //  console.log(newArrow);
                    this.setState(prevState => ({
                      arrows: [...prevState.arrows, newArrow],
                      newArrowDropped: true,
                      newArrowRef: newArrow.name,
                      arrowEndX: toPush.x,
                      arrowEndY: toPush.y
                    }));
                  } else {
                    //  console.log("we are making just an aarrow");
                    var transform = this.refs.layer2
                      .getAbsoluteTransform()
                      .copy();
                    transform.invert();
                    let uh = transform.point({
                      x: toPush.x,
                      y: toPush.y
                    });
                    toPush.x = uh.x;
                    toPush.y = uh.y;
                    var newArrow = {
                      points: [toPush.x, toPush.y, toPush.x, toPush.y],
                      ref:
                        "arrow" +
                        (this.state.arrows.length +
                          1 +
                          this.state.arrowDeleteCount),
                      name:
                        "arrow" +
                        (this.state.arrows.length +
                          1 +
                          this.state.arrowDeleteCount),
                      from: toPush.from,
                      stroke: toPush.stroke,
                      strokeWidth: toPush.strokeWidth,
                      fill: toPush.fill
                    };

                    this.setState(prevState => ({
                      arrows: [...prevState.arrows, newArrow],
                      newArrowDropped: true,
                      newArrowRef: newArrow.name,
                      arrowEndX: toPush.x,
                      arrowEndY: toPush.y
                    }));
                  }

                  //this.refs updates after forceUpdate (because arrow gets instantiated), might be risky in the future
                  //only this.state.arrows.length because it was pushed earlier, cancelling the +1
                }}
                appendToRectangles={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({
                    x: toPush.x,
                    y: toPush.y
                  });

                  if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }

                  this.setState(prevState => ({
                    rectangles: [...prevState.rectangles, toPush],
                    selectedShapeName: toPush.name
                  }));
                }}
                appendToEllipses={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({
                    x: toPush.x,
                    y: toPush.y
                  });

                  if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }

                  this.setState(prevState => ({
                    ellipses: [...prevState.ellipses, toPush],
                    selectedShapeName: toPush.name
                  }));
                }}
                appendToStars={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({
                    x: toPush.x,
                    y: toPush.y
                  });

                  if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }
                  this.setState(prevState => ({
                    stars: [...prevState.stars, toPush],
                    selectedShapeName: toPush.name
                  }));
                }}
                appendToTexts={stuff => {
                  var layer = this.refs.layer2;
                  var toPush = stuff;
                  var stage = this.refs.graphicStage;
                  var transform = this.refs.layer2
                    .getAbsoluteTransform()
                    .copy();
                  transform.invert();

                  var pos = transform.point({
                    x: toPush.x,
                    y: toPush.y
                  });

                  if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
                    toPush.x = pos.x;
                    toPush.y = pos.y;
                  }

                  this.setState(prevState => ({
                    texts: [...prevState.texts, toPush]
                  }));

                  //we can also just get element by this.refs.toPush.ref

                  //  let text = stage.findOne("." + toPush.name);
                  let text = this.refs[toPush.ref];
                  //this.setState({firstTimeTextEditing: true});
                  text.fire("dblclick");
                }}
              />
            </Layer>
          </Stage>

          <textarea
            ref="textarea"
            id="textarea"
            value={this.state.text}
            onChange={e => {
              this.setState({
                text: e.target.value,
                shouldTextUpdate: false
              });
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.setState({
                  textEditVisible: false,
                  shouldTextUpdate: true
                });

                // get the current textNode we are editing, get the name from there
                //match name with elements in this.state.texts,
                let node = this.refs[this.state.currentTextRef];
                console.log("node width before set", node.textWidth);
                let name = node.attrs.name;
                this.setState(
                  prevState => ({
                    selectedShapeName: name,
                    texts: prevState.texts.map(eachText =>
                      eachText.name === name
                        ? {
                            ...eachText,
                            text: this.state.text
                          }
                        : eachText
                    )
                  }),
                  () => {
                    this.setState(prevState => ({
                      texts: prevState.texts.map(eachText =>
                        eachText.name === name
                          ? {
                              ...eachText,
                              textWidth: node.textWidth,
                              textHeight: node.textHeight
                            }
                          : eachText
                      )
                    }));
                  }
                );

                node.show();
                this.refs.graphicStage.findOne(".transformer").show();
              }
            }}
            onBlur={() => {
              this.setState({
                textEditVisible: false,
                shouldTextUpdate: true
              });

              // get the current textNode we are editing, get the name from there
              //match name with elements in this.state.texts,

              let node = this.refs.graphicStage.findOne(
                "." + this.state.currentTextRef
              );
              let name = node.attrs.name;

              this.setState(
                prevState => ({
                  selectedShapeName: name,
                  texts: prevState.texts.map(eachText =>
                    eachText.name === name
                      ? {
                          ...eachText,
                          text: this.state.text
                        }
                      : eachText
                  )
                }),
                () => {
                  this.setState(prevState => ({
                    texts: prevState.texts.map(eachText =>
                      eachText.name === name
                        ? {
                            ...eachText,
                            textWidth: node.textWidth,
                            textHeight: node.textHeight
                          }
                        : eachText
                    )
                  }));
                }
              );
              node.show();
              this.refs.graphicStage.findOne(".transformer").show();
              this.refs.graphicStage.draw();
            }}
            style={{
              //set position, width, height, fontSize, overflow, lineHeight, color
              display: this.state.textEditVisible ? "block" : "none",
              position: "absolute",
              top: this.state.textY + 80 + "px",
              left: this.state.textX + "px",
              width: "300px",
              height: "300px",
              overflow: "hidden",
              fontSize: this.state.textareaFontSize,
              fontFamily: this.state.textareaFontFamily,
              color: this.state.textareaFill,
              border: "none",
              padding: "0px",
              margin: "0px",
              outline: "none",
              resize: "none",
              background: "none"
            }}
          />
          <div className="errMsg">{errDisplay}</div>
        </div>
        <div className="header">
        <Level number={this.state.pageNumber} ptype={this.state.ptype}/>
          <h1 id="editmode">Edit Mode</h1>
          <Info
            stuff="asdasdas"
            editmode="1"
            />


            <Pencil
              id="2"
              psize="3"
              type="main"
              title="Edit Group Space"
              addRectangle={this.addRectangle}
              addCircle={this.addCircle}
              addStar={this.addStar}
              addTriangle={this.addTriangle}
              addImage={this.addImage}
              addVideo={this.addVideo}
              addText={this.addText}
              addAudio={this.addAudio}
              addDocument={this.addDocument}
              drawLine={this.drawLine}
              eraseLine={this.eraseLine}
              stopDrawing={this.stopDrawing}
              handleImage={this.handleImage}
              handleVideo={this.handleVideo}
              handleAudio={this.handleAudio}
              handleDocument={this.handleDocument}

              />
            <Pencil
              id="3"
              psize="3"
              type="info"
              title=""
              ptype={this.handleType}
              num={this.handleNum}
            />
            <Pencil
              id="4"
              psize="2"
              type="nav"
              title=""
              mvisible={this.handleMvisible}
              avisible={this.handleAvisible}
              pavisible={this.handlePavisible}
              svisible={this.handleSvisible}
              pevisible={this.handlePevisible}/>
              />

              <Link to="/dashboard">
                <i id="editpagex" class="fas fa-times fa-3x"></i>
              </Link>
            </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = state => ({
  auth: state.auth
});

export default Graphics;
