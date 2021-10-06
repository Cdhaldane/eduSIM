import React, { Component } from 'react';
import DropdownRoles from "../Dropdown/DropdownRoles";
import DropdownAddObjects from "../Dropdown/DropdownAddObjects";
import Info from "../Information/InformationPopup";
import URLVideo from "./URLVideos";
import URLImage from "./URLImage";
import fileDownload from 'js-file-download';
import axios from 'axios';
import Level from "../Level/Level";
import Konva from "konva";
import ContextMenu from "../ContextMenu/ContextMenu";
import Portal from "./Shapes/Portal"
import TransformerComponent from "./TransformerComponent";

import TicTacToe from "./GamePieces/TicTacToe/TicTacToe";
import Connect4 from "./GamePieces/Connect4/Board";

import "./Stage.css";

import {
  Rect,
  Stage,
  Layer,
  Ellipse,
  Star,
  Text,
  RegularPolygon,
  Line,
  Arrow,
} from "react-konva";

let history = [];
let historyStep = 0;

class Graphics extends Component {

  // Save State
  // These are the names of the objects in state that are saved to the database
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
    "connect4",

    // Delete Counts (stored to keep object label #s in sync)
    "rectDeleteCount",
    "ellipseDeleteCount",
    "starDeleteCount",
    "triangleDeleteCount",
    "imageDeleteCount",
    "videoDeleteCount",
    "audioDeleteCount",
    "documentDeleteCount",
    "textDeleteCount",
    "linesDeleteCount",
    "arrowDeleteCount",

    "status"
  ];

  constructor(props) {
    super(props);

    this.state = {
      // Right click menus (for group and personal space)
      groupAreaContextMenuVisible: false,
      groupAreaContextMenuX: 0,
      groupAreaContextMenuY: 0,
      personalAreaContextMenuVisible: false,
      personalAreaContextMenuX: 0,
      personalAreaContextMenuY: 0,

      // Objects
      rectangles: [],
      ellipses: [],
      stars: [],
      triangles: [],
      images: [],
      videos: [],
      audios: [],
      documents: [],
      texts: [],
      lines: [], // Lines are the drawings
      arrows: [], // Arrows are used for transformations

      selectedShapeName: "",

      connectors: [],
      gameroles: [],
      tics: [],
      connect4: [],

      // Object Deletion Count
      rectDeleteCount: 0,
      ellipseDeleteCount: 0,
      starDeleteCount: 0,
      triangleDeleteCount: 0,
      imageDeleteCount: 0,
      videoDeleteCount: 0,
      audioDeleteCount: 0,
      documentDeleteCount: 0,
      textDeleteCount: 0,
      linesDeleteCount: 0,
      arrowDeleteCount: 0,

      // Page Controls
      pages: ["1", "2", "3", "4", "5", "6"],
      numberOfPages: 6,

      // Context Menu
      selectedContextMenu: null,

      // The Text Editor (<textarea/>) & other text properties
      textX: 0,
      textY: 0,
      textEditVisible: false,
      text: "",
      currentTextRef: "",
      textareaWidth: 0,
      textareaHeight: 0,
      textareaFill: null,
      textareaFontFamily: null,
      textareaFontSize: 10,
      textRotation: 0,
      shouldTextUpdate: true,
      selectedFont: null,

      // Image, Video, Audio, Document sources
      vidsrc: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm",
      imgsrc: 'https://cdn.hackernoon.com/hn-images/0*xMaFF2hSXpf_kIfG.jpg',
      audsrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3",
      docsrc: "",
      docimage: null,

      // Draw
      tool: 'pen',
      isDrawing: false,
      drawMode: false,

      // Variables for calculating responsive sizing 
      // (for different screen sizes)
      groupLayerX: 0,
      groupLayerY: 0,
      groupLayerScale: 1,
      personalLayerX: 0,
      personalLayerY: 0,
      personalLayerScale: 1,
      draggable: false,

      // Fill and Stroke
      colorf: "black",
      colors: "black",
      color: "white",
      strokeWidth: 3.75,
      opacity: 1,
      lastFill: null,

      // The blue selection rectangle / click location
      selection: {
        visible: false,
        x1: -100,
        y1: -100,
        x2: 0,
        y2: 0
      },

      // Metadata
      title: "",
      category: "",
      description: "",
      thumbnail: "",

      errMsg: "",
      arrowDraggable: false,
      newArrowRef: "",
      count: 0,
      newArrowDropped: false,
      newConnectorDropped: false,
      arrowEndX: 0,
      arrowEndY: 0,
      isTransforming: false,
      infolevel: false,
      rolelevel: "",
      tic: false,
      open: 0,
      state: false,
      saving: null,
      saved: [],
      roadmapId: null,
      alreadyCreated: false,
      publishing: false,
      isPasteDisabled: false,
      gameinstanceid: this.props.gameinstance,
      adminid: this.props.adminid,
      savedstates: [],
      level: 1,
    };

    this.handleWheel = this.handleWheel.bind(this);

    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstance/:adminid/:gameid', {
      params: {
        adminid: this.state.adminid,
        gameid: this.state.gameinstanceid
      }
    }).then((res) => {
      if (res.data.game_parameters) {
        const objects = JSON.parse(res.data.game_parameters);
        this.savedObjects.forEach((object) => {
          this.setState({
            [object]: objects[object]
          });
        });
      }
    }).catch(error => {
      console.error(error);
    });
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
        gameinstanceid: this.state.gameinstanceid,
      }
    })
  }

  recalculateCanvasSizeAndPosition = (personalArea) => {
    const layerX = personalArea ? "personalLayerX" : "groupLayerX";
    const layerY = personalArea ? "personalLayerY" : "groupLayerY";
    const layerScale = personalArea ? "personalLayerScale" : "groupLayerScale";

    let leftmostX = null;
    let leftmostObj = null;
    let rightmostX = null;
    let rightmostObj = null;
    let topmostY = null;
    let topmostObj = null;
    let bottommostY = null;
    let bottommostObj = null;

    for (let i = 0; i < this.savedObjects.length; i++) {
      const objectType = this.savedObjects[i];
      const objects = this.state[objectType];
      if (objects) {
        for (let j = 0; j < objects.length; j++) {
          if (objects[j].infolevel === personalArea) {
            const rect = this.refs[objects[j].id].getClientRect();

            // Get furthest left x-coord
            const leftX = (rect.x - this.state[layerX]) / this.state[layerScale];
            if (leftmostX === null || leftX < leftmostX) {
              leftmostX = leftX;
              leftmostObj = this.refs[objects[j].id];
            }

            // Get furthest right x-coord
            const rightX = (rect.x - this.state[layerX] + rect.width) / this.state[layerScale];
            if (rightmostX === null || rightX > rightmostX) {
              rightmostX = rightX;
              rightmostObj = this.refs[objects[j].id];
            }

            // Get furthest top y-coord
            const topY = (rect.y - this.state[layerY]) / this.state[layerScale];
            if (topmostY === null || topY < topmostY) {
              topmostY = topY;
              topmostObj = this.refs[objects[j].id];
            }

            // Get furthest bottom y-coord
            const bottomY = (rect.y - this.state[layerY] + rect.height) / this.state[layerScale];
            if (bottommostY === null || bottomY > bottommostY) {
              bottommostY = bottomY;
              bottommostObj = this.refs[objects[j].id];
            }
          }
        }
      }
    }

    if (leftmostObj && rightmostObj && topmostObj && bottommostObj) {
      let sidebarVal = 70;
      if (personalArea) {
        sidebarVal = 100;
      }
      const sidebarWidth = window.matchMedia("(orientation: portrait)").matches ? 0 : sidebarVal;
      const topbarHeight = window.matchMedia("(orientation: portrait)").matches ? 110 : 55;

      const contentWidth = rightmostX - leftmostX;
      const totalWidth = window.innerWidth - sidebarWidth;

      const contentHeight = bottommostY - topmostY;
      const totalHeight = Math.max(window.innerHeight - topbarHeight, 1);

      const xScale = totalWidth / contentWidth;
      const yScale = totalHeight / contentHeight;

      // Scale so that everything fits on screen vertically and horizontally
      const newScale = Math.min(xScale, yScale);

      this.setState({
        [layerX]: -leftmostX,
        [layerY]: -topmostY + topbarHeight,
        [layerScale]: newScale,
      }, () => {

        // Adjust x, y position to center content again after scale is complete
        const leftRect = leftmostObj.getClientRect();
        const rightRect = rightmostObj.getClientRect();
        const topRect = topmostObj.getClientRect();
        const bottomRect = bottommostObj.getClientRect();

        const newContentWidth = (rightRect.x + rightRect.width) - leftRect.x;
        const newContentHeight = (bottomRect.y + bottomRect.height) - topRect.y;

        this.setState({
          [layerX]: this.state[layerX] - leftRect.x + ((totalWidth - newContentWidth) / 2),
          [layerY]: this.state[layerY] + ((totalHeight - newContentHeight) / 2)
        });
      });
    }
  }

  saveInterval = null;
  drawInterval = null;
  componentDidMount = async () => {
    const MINUTE_MS = 1000 * 60;

    // Auto save the canvas every 30 seconds
    this.saveInterval = setInterval(() => {
      this.handleSave();
      this.props.showAlert("Simulation Autosaved", "info");
    }, MINUTE_MS / 2);

    // Redraw the canvas every 1 second
    this.drawInterval = setInterval(() => {
      this.refs.graphicStage.draw();
      this.refs.personalAreaStage.draw();
    }, 1000);

    // Reposition / scale objects on screen resize
    let resizeTimeout;
    window.onresize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.recalculateCanvasSizeAndPosition(false);
        this.recalculateCanvasSizeAndPosition(true);
      }, 100);
    };

    // Calculate positions on initial load
    setTimeout(() => {
      this.recalculateCanvasSizeAndPosition(false);
      this.recalculateCanvasSizeAndPosition(true);
    }, 50);

    history.push(this.state);
    this.setState({ selectedShapeName: "" });
  }

  componentWillUnmount = () => {
    clearInterval(this.saveInterval);
    clearInterval(this.drawInterval);
  }

  componentDidUpdate = (prevProps, prevState) => {
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
      prevState.lines,
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
      this.state.lines,
      this.state.documents
    ];

    const prevSelected = prevState.selectedShapeName;
    const nowSelected = this.state.selectedShapeName;
    if (prevSelected !== nowSelected) {
      const type = nowSelected.replace(/\d+$/, "");
      if (this.state[type]) {
        const node = this.state[type].filter((obj) => {
          return obj.name === nowSelected;
        });
        if (node.length) {
          if (node[0].infolevel) {
            const obj = this.refs.personalAreaLayer.find(".shape").filter((obj) => {
              return obj.attrs.id === nowSelected;
            });
            this.refs.personalTransformer.nodes(obj);
          } else {
            const obj = this.refs.groupAreaLayer.find(".shape").filter((obj) => {
              return obj.attrs.id === nowSelected;
            });
            this.refs.groupTransformer.nodes(obj);
          }
        }
      }
    }

    if (!this.state.redoing && !this.state.isTransforming) {
      if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
        if (JSON.stringify(prevMainShapes) !== JSON.stringify(currentMainShapes)) {
          // If text shouldn't update, don't append to  history
          if (this.state.shouldTextUpdate) {
            let uh = history;
            history = uh.slice(0, historyStep + 1);
            let toAppend = this.state;
            history = history.concat(toAppend);
            historyStep += 1;
          }
        }
      }
    }
    this.state.redoing = false;
  }

  handlePageTitle = (newPageTitles) => {
    this.setState({
      pages: newPageTitles
    });
  }

  handleNumOfPagesChange = (e) => {
    this.setState({
      numberOfPages: e
    })
  }

  handleSave = () => {
    let storedObj = {};
    for (let i = 0; i < this.savedObjects.length; i++) {
      const newObj = this.savedObjects[i];
      storedObj = {
        ...storedObj,
        [newObj]: this.state[newObj]
      };
    }

    this.setState({
      saved: storedObj
    });

    const body = {
      id: this.state.gameinstanceid,
      game_parameters: JSON.stringify(storedObj),
      createdby_adminid: localStorage.adminid,
      invite_url: 'value'
    }

    // Save the game_parameters
    axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/update/:id', body).catch(error => {
      console.error(error);
    });
  };

  onObjectContextMenu = e => {
    e.evt.preventDefault(true);
    const mousePosition = {
      x: e.evt.clientX,
      y: e.evt.clientY
    };
    this.setState({
      selectedContextMenu: {
        type: "ObjectMenu",
        position: mousePosition
      }
    });
  }

  handleStageClick = (e, personalArea) => {
    const stage = personalArea ? "personalAreaStage" : "graphicStage";
    const layer = personalArea ? "personalAreaLayer" : "groupAreaLayer";
    const pos = this.refs[layer].getStage().getPointerPosition();
    const shape = this.refs[layer].getIntersection(pos);

    if (e.evt.button === 0) {
      // Left click on an object -> put the selected object in state
      if (
        shape !== null &&
        shape !== undefined &&
        shape.name() !== null &&
        shape.name() !== undefined &&
        shape.id() !== "ContainerRect"
      ) {
        this.setState({
          selectedShapeName: shape.id()
        }, () => {
          this.refs[stage].draw();
        });
      }
    } else if (e.evt.button === 2) {
      // Right click (not on an object) -> show the add object menu
      if (
        shape === null ||
        shape === undefined ||
        shape.name() === ""
      ) {
        const type = personalArea ? "PersonalAddMenu" : "GroupAddMenu";
        const notVisible = personalArea ? "groupAreaContextMenuVisible" : "personalAreaContextMenuVisible";
        const visible = personalArea ? "personalAreaContextMenuVisible" : "groupAreaContextMenuVisible";
        const contextMenuX = personalArea ? "personalAreaContextMenuX" : "groupAreaContextMenuX";
        const contextMenuY = personalArea ? "personalAreaContextMenuY" : "groupAreaContextMenuY";
        this.setState({
          selectedContextMenu: {
            type: type,
            position: {
              x: e.evt.clientX,
              y: e.evt.clientY
            }
          },
          [notVisible]: false,
          [visible]: true,
          [contextMenuX]: e.evt.clientX,
          [contextMenuY]: e.evt.clientY,
        });
      } else {
        this.setState({
          selectedShapeName: shape.id()
        }, () => {
          this.refs[stage].draw();
        });
      }
    }
  };

  updateSelectionRect = (personalArea) => {
    let node = this.refs.selectionRectRef;
    if (personalArea) {
      node = this.refs.selectionRectRef1;
    }
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

  onMouseDown = (e, personalArea) => {
    if (!e.evt.ctrlKey) {
      this.setState({
        draggable: false
      });
    }

    const pos = {
      x: e.evt.layerX,
      y: e.evt.layerY
    };

    if (this.state.drawMode === true) {
      this.setState({
        isDrawing: true
      });
      const tool = this.state.tool;
      this.setState({
        lines: [...this.state.lines, {
          tool,
          points: [pos.x, pos.y],
          level: this.state.level,
          color: this.state.color,
          id: "shape",
          infolevel: personalArea
        }]
      });
    } else {
      const isElement = e.target.findAncestor(".elements-container");
      const isTransformer = e.target.findAncestor("Transformer");
      if (isElement || isTransformer) {
        return;
      }

      let scale = this.state.groupLayerScale;
      let xOffset = -this.state.groupLayerX;
      let yOffset = -this.state.groupLayerY;
      if (personalArea) {
        scale = this.state.personalLayerScale;
        xOffset = -this.state.personalLayerX;
        yOffset = -this.state.personalLayerY;
      }

      this.setState({
        selection: {
          visible: true,
          x1: (pos.x + xOffset) / scale,
          y1: (pos.y + yOffset) / scale,
          x2: (pos.x + xOffset) / scale,
          y2: (pos.y + yOffset) / scale
        }
      }, () => {
        this.updateSelectionRect(personalArea);
      });
    }
  };

  handleMouseUp = () => {
    if (this.state.drawMode === true) {
      this.setState({
        isDrawing: false
      });
    } else {
      if (!this.state.selection.visible) {
        return;
      }
      const selBox = this.refs.selectionRectRef.getClientRect();
      const elements = [];
      this.refs.groupAreaLayer.find(".shape").forEach((elementNode) => {
        const elBox = elementNode.getClientRect();
        if (Konva.Util.haveIntersection(selBox, elBox)) {
          elements.push(elementNode);
        }
      });

      // Handle single selection and group selection
      if (elements.length === 1) {
        this.setState({
          selectedShapeName: elements[0].id()
        });
      } else if (elements.length > 1) {
        this.setState({
          selectedShapeName: "group"
        });
      }

      this.refs.groupTransformer.nodes(elements);
      this.state.selection.visible = false;
      // Disable click event
      Konva.listenClickTap = false;
      this.updateSelectionRect(false);
    }
  };

  handleMouseOver = (e, personalArea) => {
    // Get the current arrow ref and modify its position by filtering & pushing again
    if (this.state.drawMode === true) {
      if (!this.state.isDrawing) {
        return;
      }

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      let lastLine = this.state.lines[this.state.lines.length - 1];
      // Add point
      lastLine.points = lastLine.points.concat([point.x, point.y]);

      // Replace last
      this.state.lines.splice(this.state.lines.length - 1, 1, lastLine);
      this.setState({
        lines: this.state.lines.concat()
      });
    } else {
      if (!this.state.selection.visible && !this.state.draggable) {
        return;
      }

      const stage = personalArea ? "personalAreaStage" : "graphicStage";
      const pos = this.refs[stage].getPointerPosition();
      const shape = this.refs[stage].getIntersection(pos);

      if (shape && shape.attrs.link) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";

        let scale = this.state.groupLayerScale;
        let xOffset = -this.state.groupLayerX;
        let yOffset = -this.state.groupLayerY;
        if (personalArea) {
          scale = this.state.personalLayerScale;
          xOffset = -this.state.personalLayerX;
          yOffset = -this.state.personalLayerY;
        }

        // Create drag selection rectangle
        this.setState({
          selection: {
            ...this.state.selection,
            x2: (pos.x + xOffset) / scale,
            y2: (pos.y + yOffset) / scale
          }
        }, () => {
          this.updateSelectionRect(personalArea);
        });
      }
    }
  };

  handleMouseUpInfo = () => {
    if (this.state.drawMode === true) {
      this.state.isDrawing = false;
    } else {
      if (!this.state.selection.visible) {
        return;
      }
      const selBox = this.refs.selectionRectRef1.getClientRect();
      const elements = [];
      this.refs.personalAreaLayer.find(".shape").forEach((elementNode) => {
        const elBox = elementNode.getClientRect();
        if (Konva.Util.haveIntersection(selBox, elBox)) {
          elements.push(elementNode);

        }
      });

      // Handle single selection and group selection
      if (elements.length === 1) {
        this.setState({
          selectedShapeName: elements[0].id()
        });
      } else if (elements.length > 1) {
        this.setState({
          selectedShapeName: "group"
        });
      }

      this.refs.personalTransformer.nodes(elements);
      this.state.selection.visible = false;
      // disable click event
      Konva.listenClickTap = false;
      this.updateSelectionRect(true);
    }
  };

  handleDragEnd = (e, objectsName, ref) => {
    const shape = this.refs[ref];
    this.setState(prevState => ({
      [objectsName]: prevState[objectsName].map(eachObj =>
        eachObj.id === shape.attrs.id
          ? {
            ...eachObj,
            x: e.target.x(),
            y: e.target.y()
          }
          : eachObj
      )
    }));

    this.refs.graphicStage.draw();
  }

  handleWheel = (e, personalArea) => {
    if (
      this.state.rectangles.length === 0 &&
      this.state.ellipses.length === 0 &&
      this.state.stars.length === 0 &&
      this.state.texts.length === 0 &&
      this.state.triangles.length === 0 &&
      this.state.arrows.length === 0 &&
      this.state.images.length === 0 &&
      this.state.videos.length === 0 &&
      this.state.audios.length === 0 &&
      this.state.documents.length === 0 &&
      this.state.lines.length === 0
    ) {
    } else {
      e.evt.preventDefault();

      const scaleBy = 1.2;
      const layer = personalArea ? this.refs.personalAreaLayer : this.refs.groupAreaLayer;

      const oldScale = layer.scaleX();
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

      layer.scale({
        x: newScale,
        y: newScale
      });
      const layerScale = personalArea ? "personalLayerScale" : "groupLayerScale";
      this.setState({
        [layerScale]: newScale
      });
    }
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
            lines: history[historyStep].lines,
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
        selectedContextMenu: null
      });
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
        lines: next.lines,
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
      selectedContextMenu: null
    })
  };

  handleCopy = () => {
    if (this.state.selectedShapeName !== "") {
      // Find it
      let name = this.state.selectedShapeName;
      let copiedElement = null;
      if (name.includes("rect")) {
        copiedElement = this.state.rectangles.filter(function (
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("ellipse")) {
        copiedElement = this.state.ellipses.filter(function (
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("triangle")) {
        copiedElement = this.state.triangles.filter(function (
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("image")) {
        copiedElement = this.state.images.filter(function (
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("video")) {
        copiedElement = this.state.videos.filter(function (
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("audio")) {
        copiedElement = this.state.audios.filter(function (
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("document")) {
        copiedElement = this.state.documents.filter(function (
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("star")) {
        copiedElement = this.state.stars.filter(function (eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("text")) {
        copiedElement = this.state.texts.filter(function (eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("arrow")) {
        copiedElement = this.state.arrows.filter(function (eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("line")) {
        copiedElement = this.state.lines.filter(function (eachRect) {
          return eachRect.name === name;
        });
      }

      this.setState({ copiedElement: copiedElement });
      this.setState({
        selectedContextMenu: null
      })
    }
  }

  pasteObject = (type, copiedElement, deleteCount) => {
    const num = this.state[type].length + deleteCount + 1;
    const newObject = {
      ...copiedElement,
      id: type + num,
      ref: type + num,
      name: type + num,
      x: this.state.selection.x1,
      y: this.state.selection.y1
    };
    this.setState({
      [type]: [...this.state[type], newObject],
      selectedShapeName: newObject.name
    });
  }

  handlePaste = () => {
    if (
      this.state.copiedElement === null ||
      this.state.copiedElement === undefined ||
      document.activeElement.getAttribute("name") !== "pasteContainer"
    ) {
      // Ignore paste if nothing is copied or if focus is not on canvas
      return;
    }
    const copiedElement = this.state.copiedElement[0];
    if (copiedElement) {
      if (copiedElement.attrs) {
        // Don't paste when element has attributes
      } else {
        const type = copiedElement.name.replace(/\d+$/, "");
        switch (type) {
          case ("rectangles"):
            this.pasteObject(type, copiedElement, this.state.rectDeleteCount);
            break;
          case ("arrows"):
            this.pasteObject(type, copiedElement, this.state.arrowDeleteCount);
            break;
          case ("ellipses"):
            this.pasteObject(type, copiedElement, this.state.ellipseDeleteCount);
            break;
          case ("images"):
            this.pasteObject(type, copiedElement, this.state.imageDeleteCount);
            break;
          case ("videos"):
            this.pasteObject(type, copiedElement, this.state.videoDeleteCount);
            break;
          case ("audios"):
            this.pasteObject(type, copiedElement, this.state.audioDeleteCount);
            break;
          case ("triangles"):
            this.pasteObject(type, copiedElement, this.state.triangleDeleteCount);
            break;
          case ("documents"):
            this.pasteObject(type, copiedElement, this.state.documentDeleteCount);
            break;
          case ("lines"):
            this.pasteObject(type, copiedElement, this.state.lineDeleteCount);
            break;
          case ("stars"):
            this.pasteObject(type, copiedElement, this.state.starDeleteCount);
            break;
          case ("texts"):
            this.pasteObject(type, copiedElement, this.state.textDeleteCount);
            break;
        }
      }

      this.setState({
        selectedContextMenu: null
      });
    }
  }

  handleDelete = () => {
    if (this.state.selectedShapeName !== "") {
      let that = this;
      //delete it from the state too
      let name = this.state.selectedShapeName;
      let rects = this.state.rectangles.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            rectDeleteCount: that.state.rectDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let ellipses = this.state.ellipses.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            ellipseDeleteCount: that.state.ellipseDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let triangles = this.state.triangles.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            triangleDeleteCount: that.state.triangleDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let images = this.state.images.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            imageDeleteCount: that.state.imageDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let lines = this.state.lines.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            linesDeleteCount: that.state.imageDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let videos = this.state.videos.filter((eachRect) => {
        if (eachRect.id === name) {
          that.setState({
            videoDeleteCount: that.state.videoDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let audios = this.state.audios.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            audioDeleteCount: that.state.audioDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let documents = this.state.documents.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            documentDeletedCount: that.state.documentDeletedCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let stars = this.state.stars.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            starDeleteCount: that.state.starDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let arrows = this.state.arrows.filter(function (eachRect) {
        if (eachRect.id === name) {
          that.setState({
            arrowDeleteCount: that.state.arrowDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      let texts = this.state.texts.filter(function (eachRect) {
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
        lines: lines,
        selectedShapeName: "",
        selectedContextMenu: null
      });

      // Get rid of transform UI after deletion
      this.refs.groupTransformer.nodes([]);
      this.refs.personalTransformer.nodes([]);
    }
  }

  handleCut = () => {
    this.handleCopy();
    this.handleDelete();
    this.setState({
      selectedContextMenu: null
    });
  }

  handleClose = (e) => {
    this.setState({
      selectedContextMenu: null
    })
  }

  shapeIsGone = returnTo => {
    let toReturn = true;
    let currentShapeName = this.state.selectedShapeName;
    let [rectangles, ellipses, stars, arrows, texts, triangles, images, videos, audios, documents, lines] = [
      returnTo.rectangles,
      returnTo.ellipses,
      returnTo.stars,
      returnTo.arrows,
      returnTo.triangles,
      returnTo.images,
      returnTo.lines,
      returnTo.videos,
      returnTo.audios,
      returnTo.documents,

      returnTo.texts
    ];
    rectangles.map(eachRect => {
      if (eachRect.id === currentShapeName) {
        toReturn = false;
      }
    }
    );
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
    lines.map(eachLine => {
      if (eachLine.id === currentShapeName) {
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

  addTic = (e) => {
    let ticName = this.state.tics.length

    let name = 'tic' + ticName
    let ref = ticName
    const tac = {
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      id: name,
      name: name,
      opacity: 1,
      i: ref,
    };

    let toPush = tac;

    this.setState(prevState => ({
      tics: [...prevState.tics, toPush]
    }));
  }

  handleTicDelete = (index) => {
    this.setState({
      tics: this.state.tics.filter((_, i) => i !== index)
    })
  }

  addConnect4 = (e) => {
    let conName = this.state.connect4.length + 1

    let name = 'con' + conName
    let ref = 'con' + conName
    const conn = {
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      id: name,
      name: name,
      opacity: 1,
      ref: ref,
    };

    let toPush = conn;

    this.setState(prevState => ({
      connect4: [...prevState.connect4, toPush]
    }));
  }

  handleColorF = (e) => {
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
    this.setState(prevState => ({
      texts: prevState.texts.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
            ...eachStar,
            fill: e.hex
          }
          : eachStar
      )
    }));
  }

  handleFont = (font) => {
    this.setState({
      texts: this.state.texts.map((t) => {
        if (t.id === this.state.selectedShapeName) {
          return {
            ...t,
            fontFamily: font
          }
        } else {
          return t;
        }
      })
    }, () => {
      setTimeout(() => {
        this.refs.personalAreaStage.draw();
        this.refs.graphicStage.draw();
      }, 300);
    });
  }

  handleSize = (e) => {
    this.setState(prevState => ({
      texts: prevState.texts.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
            ...eachRect,
            fontSize: e
          }
          : eachRect
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

  handleWidth = (e) => {
    for (let i = 0; i < this.savedObjects.length; i++) {
      const objType = this.savedObjects[i];
      const objects = this.state[objType];
      if (Array.isArray(objects) && objects.length) {
        objects.forEach((object) => {
          if (object.strokeWidth !== null && object.id === this.state.selectedShapeName) {
            const index = objects.map(object => object.name).indexOf(this.state.selectedShapeName);
            const newObjs = [
              ...objects.slice(0, index),
              ...objects.slice(index + 1)
            ];
            this.setState({
              [objType]: [...newObjs, { ...object, strokeWidth: e }]
            });
          }
        });
      }
    }
  }

  handleOpacity = (e) => {
    for (let i = 0; i < this.savedObjects.length; i++) {
      const objType = this.savedObjects[i];
      const objects = this.state[objType];
      if (Array.isArray(objects) && objects.length) {
        objects.forEach((object) => {
          if (object.id === this.state.selectedShapeName) {
            const index = objects.map(object => object.name).indexOf(this.state.selectedShapeName);
            const newObjs = [
              ...objects.slice(0, index),
              ...objects.slice(index + 1)
            ];
            this.setState({
              [objType]: [...newObjs, { ...object, opacity: e }]
            });
          }
        });
      }
    }
  }

  handleLevel = (e) => {
    this.setState({
      level: e
    }, this.handleLevelUpdate)
  }

  handleLayerClear = () => {
    this.refs.groupAreaLayer.clear();
  }

  handleLayerDraw = () => {
    //
  }

  handleImage = (e) => {
    this.setState({
      imgsrc: e
    });
  }

  handleVideo = (e) => {
    this.setState({
      vidsrc: e
    });
  }

  handleAudio = (e) => {
    this.setState({
      audsrc: e
    });
  }

  handleDocument = (e) => {
    this.setState({
      docsrc: e
    });
  }

  handleDownload = (url, filename) => {
    axios.get(url, {
      responseType: 'blob',
    }).then((res) => {
      fileDownload(res.data, filename);
    });
  }

  urlObjOnTransformEnd = (type) => {
    this.setState({
      isTransforming: false
    });
    const object = this.refs[this.state.selectedShapeName];
    if (object) {
      this.setState(prevState => ({
        [type]: prevState[type].map(obj =>
          obj.id === this.state.selectedShapeName
            ? {
              ...obj,
              scaleX: object.scaleX(),
              scaleY: object.scaleY(),
              rotation: object.rotation(),
              x: object.x(),
              y: object.y()
            }
            : obj
        )
      }));
    }
  }

  // Turn <Text> into <textarea> for editing on double click
  handleTextDblClick = (stage, text, layer) => {
    if (text) {
      // Adjust location based on info or main
      let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
      if (sidebarPx > 0 && layer === this.refs.personalAreaLayer) {
        sidebarPx = 100;
      }
      let topPx = 0;
      if (layer === this.refs.personalAreaLayer) {
        topPx = window.innerHeight * 0.3;
      }

      this.setState({
        textX: text.absolutePosition().x + sidebarPx,
        textY: text.absolutePosition().y + topPx,
        textEditVisible: !this.state.textEditVisible,
        text: text.attrs.text,
        currentTextRef: text.attrs.id,
        textareaWidth: text.attrs.width,
        textareaHeight: text.textHeight * text.textArr.length,
        textareaFill: text.attrs.fill,
        textareaFontFamily: text.attrs.fontFamily,
        textareaFontSize: text.attrs.fontSize,
        textRotation: text.attrs.rotation,
      });
      const textarea = this.refs.textarea;
      textarea.focus();
      text.hide();
      layer.draw();
    }
  }

  handleTextTransform = () => {
    const text = this.refs[this.state.selectedShapeName];
    if (text) {
      text.setAttr("width", text.width() * text.scaleX());
      text.setAttr("scaleX", 1);
      text.draw();
    }
  }

  onTransformEndText = () => {
    let text = this.refs[this.state.selectedShapeName];

    this.setState(prevState => ({
      texts: prevState.texts.map(t =>
        t.id === this.state.selectedShapeName
          ? {
            ...t,
            width: text.width(),
            rotation: text.rotation(),
            textWidth: text.textWidth,
            textHeight: text.textHeight,
            x: text.x(),
            y: text.y()
          }
          : t
      )
    }));
    text.setAttr("scaleX", 1);
    text.draw();
  }

  drawLine = () => {
    this.setState({
      drawMode: true
    });
    this.setState({
      tool: "pen"
    });
  }

  stopDrawing = () => {
    this.setState({
      drawMode: false
    });
  }

  chooseColor = (e) => {
    this.setState({
      color: e.hex
    });
  }

  editMode = () => {
    this.setState({
      infolevel: true
    });
  }

  editModeOff = () => {
    this.setState({
      infolevel: false
    });
  }

  handleRoleLevel = (e) => {
    this.setState({
      rolelevel: e
    });
  }

  keyUp = (e) => {
    if (e.key === "Control") {
      document.body.style.cursor = "default";
      this.setState({
        draggable: false
      });
    }
  }

  contextMenuEventShortcuts = (event) => {
    const x = 88,
      deleteKey = 46,
      copy = 67,
      paste = 86,
      z = 90,
      y = 89,
      r = 82;
    if (event.ctrlKey && event.keyCode === x && !this.state.isPasteDisabled) {
      this.handleDelete();
      this.handleCopy();
    } else if (event.shiftKey && event.keyCode === r) {
      this.recalculateCanvasSizeAndPosition(false);
      this.recalculateCanvasSizeAndPosition(true);
    } else if (event.keyCode === deleteKey && !this.state.isPasteDisabled) {
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
      document.body.style.cursor = "grab";
      this.setState({
        draggable: true
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.tics.map((eachTic, index) => {
          if (eachTic.level === this.state.level) {
            return (
              <TicTacToe
                key={index}
                i={eachTic.i}
                handleTicDelete={this.handleTicDelete}
              />
            )
          } else {
            return null
          }
        })}
        {this.state.connect4.map(eachConnect => {
          if (eachConnect.level === this.state.level) {
            return (
              <Connect4 />
            )
          } else {
            return null
          }
        })}

        <div
          onKeyDown={this.contextMenuEventShortcuts}
          onKeyUp={this.keyUp}
          name="pasteContainer"
          tabIndex="0"
          id={"editMainContainer"}
        >
          {/* The right click menu for the group area */}
          {this.state.groupAreaContextMenuVisible
            && this.state.selectedContextMenu
            && this.state.selectedContextMenu.type === "GroupAddMenu" && (
              <DropdownAddObjects
                title={"Edit Group Space"}
                xPos={this.state.groupAreaContextMenuX}
                yPos={this.state.groupAreaContextMenuY}
                state={this.state}
                layer={this.refs.groupAreaLayer}
                setState={(obj) => {
                  this.setState(obj);
                }}
                addTic={this.addTic}
                addConnect={this.addConnect4}
                drawLine={this.drawLine}
                eraseLine={this.eraseLine}
                stopDrawing={this.stopDrawing}
                handleImage={this.handleImage}
                handleVideo={this.handleVideo}
                handleAudio={this.handleAudio}
                handleDocument={this.handleDocument}
                choosecolor={this.chooseColor}
                close={() => this.setState({ groupAreaContextMenuVisible: false })}
              />
            )}
          {/* The right click menu for the personal area */}
          {this.state.personalAreaContextMenuVisible
            && this.state.selectedContextMenu
            && this.state.selectedContextMenu.type === "PersonalAddMenu" && (
              <DropdownAddObjects
                title={"Edit Personal Space"}
                xPos={this.state.personalAreaContextMenuX}
                yPos={this.state.personalAreaContextMenuY}
                state={this.state}
                layer={this.refs.personalAreaLayer}
                setState={(obj) => {
                  this.setState(obj);
                }}
                addTic={this.addTic}
                addConnect={this.addConnect4}
                drawLine={this.drawLine}
                eraseLine={this.eraseLine}
                stopDrawing={this.stopDrawing}
                handleImage={this.handleImage}
                handleVideo={this.handleVideo}
                handleAudio={this.handleAudio}
                handleDocument={this.handleDocument}
                choosecolor={this.chooseColor}
                close={() => this.setState({ personalAreaContextMenuVisible: false })}
              />
            )}
          <Stage
            onContextMenu={(e) => e.evt.preventDefault()}
            onClick={(e) => this.handleStageClick(e, false)}
            onMouseMove={(e) => this.handleMouseOver(e, false)}
            onWheel={(e) => this.handleWheel(e, false)}
            onMouseDown={(e) => this.onMouseDown(e, false)}
            onMouseUp={this.handleMouseUp}
            height={document.getElementById("editMainContainer") ?
              document.getElementById("editMainContainer").clientHeight : 0}
            width={document.getElementById("editMainContainer") ?
              document.getElementById("editMainContainer").clientWidth : 0}
            ref="graphicStage"
          >
            <Layer
              name="group"
              scaleX={this.state.groupLayerScale}
              scaleY={this.state.groupLayerScale}
              x={this.state.groupLayerX}
              y={this.state.groupLayerY}
              height={window.innerHeight}
              width={window.innerWidth}
              draggable={this.state.draggable}
              ref="groupAreaLayer"
              onDragMove={(e) => {
                if (this.state.draggable) {
                  this.setState({
                    groupLayerX: this.state.groupLayerX + e.evt.movementX,
                    groupLayerY: this.state.groupLayerY + e.evt.movementY
                  });
                }
              }}
            >
              <Rect
                x={-5 * window.innerWidth}
                y={-5 * window.innerHeight}
                height={window.innerHeight * 10}
                width={window.innerWidth * 10}
                name=""
                id="ContainerRect"
              />
              {this.state.rectangles.map((eachRect, index) => {
                if (eachRect.level === this.state.level && eachRect.infolevel === false) {
                  return (
                    <Rect
                      key={index}
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
                      draggable
                      onClick={() => {
                        let that = this;
                        if (eachRect.link !== undefined && eachRect.link !== "") {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
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
                            if (eachRect.name === eachArrow.to.attrs.name) {
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
                      onDragEnd={e => this.handleDragEnd(e, "rectangles", eachRect.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  );
                } else {
                  return null
                }
              })}
              {this.state.ellipses.map((eachEllipse, index) => {
                if (eachEllipse.level === this.state.level && eachEllipse.infolevel === false) {
                  return (
                    <Ellipse
                      key={index}
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
                      onClick={() => {
                        let that = this;
                        if (
                          eachEllipse.link !== undefined &&
                          eachEllipse.link !== ""
                        ) {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
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
                            if (eachEllipse.name === eachArrow.from.attrs.name) {
                              eachArrow.points = [
                                eachEllipse.x,
                                eachEllipse.y,
                                eachArrow.points[2],
                                eachArrow.points[3]
                              ];
                              this.forceUpdate();
                              this.refs.graphicStage.draw();
                            }
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
                      onDragEnd={e => this.handleDragEnd(e, "ellipses", eachEllipse.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  )
                } else {
                  return null
                }
              })}
              {this.state.lines.map((eachLine, i) => {
                if (eachLine.level === this.state.level && eachLine.infolevel === false) {
                  return (
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
                      draggable
                      onContextMenu={this.onObjectContextMenu}
                    />
                  );
                } else {
                  return null
                }
              })}

              {this.state.images.map((eachImage, index) => {
                if (eachImage.level === this.state.level && eachImage.infolevel === false) {
                  return (
                    <URLImage
                      key={index}
                      visible={eachImage.visible}
                      src={eachImage.imgsrc}
                      image={eachImage.imgsrc}
                      ref={eachImage.ref}
                      name="shape"
                      id={eachImage.id}
                      layer={this.refs.groupAreaLayer}
                      x={eachImage.x}
                      y={eachImage.y}
                      scaleX={eachImage.scaleX}
                      scaleY={eachImage.scaleY}
                      width={eachImage.width}
                      height={eachImage.height}
                      stroke={eachImage.stroke}
                      strokeWidth={eachImage.strokeWidth}
                      rotation={eachImage.rotation}
                      opacity={eachImage.opacity}
                      onClick={() => {
                        let that = this;
                        if (eachImage.link !== undefined && eachImage.link !== "") {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
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
                      onTransformEnd={() => this.urlObjOnTransformEnd("images")}
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
                            if (eachImage.name === eachArrow.to.attrs.name) {
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
                      onDragEnd={e => this.handleDragEnd(e, "images", eachImage.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  )
                } else {
                  return null
                }
              })}
              {this.state.videos.map((eachVideo, index) => {
                if (eachVideo.level === this.state.level && eachVideo.infolevel === false) {
                  return (
                    <URLVideo
                      type={"video"}
                      key={index}
                      visible={eachVideo.visible}
                      src={eachVideo.vidsrc}
                      image={eachVideo.vidsrc}
                      ref={eachVideo.ref}
                      id={eachVideo.id}
                      name="shape"
                      layer={this.refs.groupAreaLayer}
                      scaleX={eachVideo.scaleX}
                      scaleY={eachVideo.scaleY}
                      x={eachVideo.x}
                      y={eachVideo.y}
                      width={eachVideo.width}
                      height={eachVideo.height}
                      stroke={eachVideo.stroke}
                      strokeWidth={eachVideo.strokeWidth}
                      rotation={eachVideo.rotation}
                      opacity={eachVideo.opacity}
                      onClick={() => {
                        let that = this;
                        if (eachVideo.link !== undefined && eachVideo.link !== "") {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
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
                      onTransformEnd={() => this.urlObjOnTransformEnd("videos")}
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
                            if (eachVideo.name === eachArrow.to.attrs.name) {
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
                      onDragEnd={e => this.handleDragEnd(e, "videos", eachVideo.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  )
                } else {
                  return null
                }
              })}
              {this.state.audios.map((eachAudio, index) => {
                if (eachAudio.level === this.state.level && eachAudio.infolevel === false) {
                  return (
                    <URLVideo
                      type={"audio"}
                      key={index}
                      visible={eachAudio.visible}
                      fillPatternImage={true}
                      src={eachAudio.audsrc}
                      image={eachAudio.imgsrc}
                      ref={eachAudio.ref}
                      id={eachAudio.id}
                      name="shape"
                      layer={this.refs.groupAreaLayer}
                      scaleX={eachAudio.scaleX}
                      scaleY={eachAudio.scaleY}
                      x={eachAudio.x}
                      y={eachAudio.y}
                      width={eachAudio.width}
                      height={eachAudio.height}
                      stroke={eachAudio.stroke}
                      strokeWidth={eachAudio.strokeWidth}
                      rotation={eachAudio.rotation}
                      opacity={eachAudio.opacity}
                      onClick={() => {

                        let that = this;
                        if (eachAudio.link !== undefined && eachAudio.link !== "") {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
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
                      onTransformEnd={() => this.urlObjOnTransformEnd("audios")}
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
                            if (eachAudio.name === eachArrow.to.attrs.name) {
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
                      onDragEnd={e => this.handleDragEnd(e, "audios", eachAudio.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  )
                } else {
                  return null
                }
              })}
              {this.state.documents.map((eachDoc, index) => {
                if (eachDoc.level === this.state.level && eachDoc.infolevel === false) {
                  return (
                    <Rect
                      key={index}
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
                        fetch(this.state.docsrc, {
                          method: 'GET',
                          headers: {
                            'Content-Type': 'application/pdf',
                          },
                        })
                          .then((response) => response.blob())
                          .then((blob) => {
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
                            if (eachDoc.name === eachArrow.to.attrs.name) {
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
                      onDragEnd={e => this.handleDragEnd(e, "documents", eachDoc.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  )
                } else {
                  return null
                }
              })}
              {this.state.triangles.map((eachEllipse, index) => {
                if (eachEllipse.level === this.state.level && eachEllipse.infolevel === false) {
                  return (
                    <RegularPolygon
                      key={index}
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
                      onClick={() => {
                        let that = this;
                        if (
                          eachEllipse.link !== undefined &&
                          eachEllipse.link !== ""
                        ) {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
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
                            if (eachEllipse.name === eachArrow.from.attrs.name) {
                              eachArrow.points = [
                                eachEllipse.x,
                                eachEllipse.y,
                                eachArrow.points[2],
                                eachArrow.points[3]
                              ];
                              this.forceUpdate();
                              this.refs.graphicStage.draw();
                            }
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
                      onDragEnd={e => this.handleDragEnd(e, "ellipses", eachEllipse.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  )
                } else {
                  return null
                }
              })}
              {this.state.stars.map((eachStar, index) => {
                if (eachStar.level === this.state.level && eachStar.infolevel === false) {
                  return (
                    <Star
                      key={index}
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
                      onClick={() => {
                        let that = this;
                        if (eachStar.link !== undefined && eachStar.link !== "") {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
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
                            if (eachStar.name === eachArrow.from.attrs.name) {
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
                      onDragEnd={e => this.handleDragEnd(e, "stars", eachStar.ref)}
                      onContextMenu={this.onObjectContextMenu}
                    />
                  )
                } else {
                  return null
                }
              })}

              {this.state.texts.map((eachText, index) => {
                if (eachText.level === this.state.level && eachText.infolevel === false) {
                  return (
                    //perhaps this.state.texts only need to contain refs?
                    //so that we only need to store the refs to get more information
                    <Text
                      key={index}
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
                      draggable
                      onTransform={this.handleTextTransform}
                      onTransformEnd={this.onTransformEndText}
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
                      onDragEnd={e => this.handleDragEnd(e, "texts", eachText.ref)}
                      onClick={() => {
                        let that = this;
                        if (eachText.link !== undefined && eachText.link !== "") {
                          this.setState(
                            {
                              errMsg: "Links will not be opened in create mode"
                            },
                            () => {
                              setTimeout(function () {
                                that.setState({
                                  errMsg: ""
                                });
                              }, 1000);
                            }
                          );
                        }
                      }}
                      onDblClick={() => this.handleTextDblClick(
                        this.refs.graphicStage,
                        this.refs[eachText.ref],
                        this.refs.groupAreaLayer)
                      }
                      onContextMenu={(e) => {
                        this.onObjectContextMenu(e);
                        this.setState({
                          selectedFont: this.refs[eachText.ref]
                        });
                      }}
                    />
                  )
                } else {
                  return null;
                }
              })}
              {this.state.arrows.map((eachArrow, index) => {
                if (!eachArrow.from && !eachArrow.to && eachArrow.level === this.state.level && eachArrow.infolevel === false) {
                  return (
                    <Arrow
                      key={index}
                      visible={eachArrow.visible}
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
                        this.refs.groupAreaLayer.draw();

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
                    ""
                  );
                } else if (eachArrow.from || eachArrow.to) {
                  //if arrow construction is completed
                  return (
                    ""
                  );
                }
              })}
              <TransformerComponent
                selectedShapeName={this.state.selectedShapeName}
                ref="groupTransformer"
                boundBoxFunc={(oldBox, newBox) => {
                  // limit resize
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
              <Rect fill="rgba(0,0,0,0.5)" ref="selectionRectRef" />
            </Layer>
          </Stage>

          <div>
            <textarea
              ref="textarea"
              id="textEditArea"
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

                // Get the current textNode we are editing, get the name from there
                // Match name with elements in this.state.texts,
                let node = this.refs[this.state.currentTextRef];
                let name = node.attrs.id;

                this.setState(
                  prevState => ({
                    selectedShapeName: name,
                    texts: prevState.texts.map(eachText =>
                      eachText.id === name
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
                display: this.state.textEditVisible ? "block" : "none",
                width: this.state.textareaWidth,
                height: this.state.textareaHeight,
                fontSize: this.state.textareaFontSize + "px",
                fontFamily: this.state.textareaFontFamily,
                color: this.state.textareaFill,
                top: this.state.textY + "px",
                left: this.state.textX + "px",
                transform: `rotate(${this.state.textRotation}deg) translateY(2px)`
              }}
            />
          </div>

        </div>
        <div className="eheader">
          <Level
            number={this.state.numberOfPages}
            pages={this.state.pages}
            level={this.handleLevel}
            handlePageTitle={this.handlePageTitle}
            handlePageNum={this.handleNumOfPagesChange}
            numOfPages={this.state.numberOfPages} />
          <div>
            <div
              id={"editPersonalContainer"}
              className={"info" + this.state.open}
            >
              <div
                name="pasteContainer"
                tabIndex="0"
                className="personalAreaStageContainer"
                onKeyDown={this.contextMenuEventShortcuts}
                onKeyUp={this.keyUp}
              >
                <Stage
                  height={document.getElementById("editPersonalContainer") ?
                    document.getElementById("editPersonalContainer").clientHeight : 0}
                  width={document.getElementById("editPersonalContainer") ?
                    document.getElementById("editPersonalContainer").clientWidth : 0}
                  onContextMenu={(e) => e.evt.preventDefault()}
                  ref="personalAreaStage"
                  onClick={(e) => this.handleStageClick(e, true)}
                  onMouseMove={(e) => this.handleMouseOver(e, true)}
                  onMouseDown={(e) => this.onMouseDown(e, true)}
                  onWheel={(e) => this.handleWheel(e, true)}
                  onMouseUp={this.handleMouseUpInfo}
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
                    draggable={this.state.draggable}
                    onDragMove={(e) => {
                      if (this.state.draggable) {
                        this.setState({
                          personalLayerX: this.state.personalLayerX + e.evt.movementX,
                          personalLayerY: this.state.personalLayerY + e.evt.movementY
                        });
                      }
                    }}
                  >
                    {this.state.rectangles.map((eachRect, index) => {
                      if (eachRect.level === this.state.level && eachRect.infolevel === true && eachRect.rolelevel === this.state.rolelevel) {
                        return (
                          <Rect
                            key={index}
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
                            draggable
                            onClick={() => {
                              let that = this;
                              if (eachRect.link !== undefined && eachRect.link !== "") {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
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
                                  if (eachRect.name === eachArrow.to.attrs.name) {
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
                            onDragEnd={e => this.handleDragEnd(e, "rectangles", eachRect.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.selectedContextMenu && this.state.selectedContextMenu.type === "ObjectMenu" && (
                      <Portal>
                        <ContextMenu
                          {...this.state.selectedContextMenu}
                          selectedshape={this.state.selectedShapeName}
                          onOptionSelected={this.handleOptionSelected}
                          choosecolors={this.handleColorS}
                          choosecolorf={this.handleColorF}
                          handleWidth={this.handleWidth}
                          handleOpacity={this.handleOpacity}
                          shape={this.refs[this.state.selectedShapeName]}
                          close={this.handleClose}
                          copy={this.handleCopy}
                          cut={this.handleCut}
                          paste={this.handlePaste}
                          delete={this.handleDelete}
                          handleFont={this.handleFont}
                          handleSize={this.handleSize}
                          selectedFont={this.state.selectedFont}
                          editTitle={this.state.selectedShapeName.startsWith("text") ? "Edit Text" : "Edit Shape"}
                        />
                      </Portal>
                    )}

                    {this.state.ellipses.map((eachEllipse, index) => {
                      if (eachEllipse.level === this.state.level && eachEllipse.infolevel === true && eachEllipse.rolelevel === this.state.rolelevel) {
                        return (
                          <Ellipse
                            key={index}
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
                            onClick={() => {
                              let that = this;
                              if (
                                eachEllipse.link !== undefined &&
                                eachEllipse.link !== ""
                              ) {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
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
                                  if (eachEllipse.name === eachArrow.from.attrs.name) {
                                    eachArrow.points = [
                                      eachEllipse.x,
                                      eachEllipse.y,
                                      eachArrow.points[2],
                                      eachArrow.points[3]
                                    ];
                                    this.forceUpdate();

                                    this.refs.graphicStage.draw();
                                  }
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
                            onDragEnd={e => this.handleDragEnd(e, "ellipses", eachEllipse.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.lines.map((eachLine, i) => {
                      if (eachLine.level === this.state.level && eachLine.infolevel === true && eachLine.rolelevel === this.state.rolelevel) {
                        return (
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
                            draggable
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}

                    {this.state.images.map((eachImage, index) => {
                      if (eachImage.level === this.state.level && eachImage.infolevel === true && eachImage.rolelevel === this.state.rolelevel) {
                        return (
                          <URLImage
                            key={index}
                            visible={eachImage.visible}
                            src={eachImage.imgsrc}
                            image={eachImage.imgsrc}
                            ref={eachImage.ref}
                            name="shape"
                            id={eachImage.id}
                            layer={this.refs.groupAreaLayer}
                            scaleX={eachImage.scaleX}
                            scaleY={eachImage.scaleY}
                            x={eachImage.x}
                            y={eachImage.y}
                            width={eachImage.width}
                            height={eachImage.height}
                            stroke={eachImage.stroke}
                            strokeWidth={eachImage.strokeWidth}
                            rotation={eachImage.rotation}
                            opacity={eachImage.opacity}
                            onClick={() => {
                              let that = this;
                              if (eachImage.link !== undefined && eachImage.link !== "") {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
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
                            onTransformEnd={() => this.urlObjOnTransformEnd("images")}
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
                                  if (eachImage.name === eachArrow.to.attrs.name) {
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
                            onDragEnd={e => this.handleDragEnd(e, "images", eachImage.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.videos.map((eachVideo, index) => {
                      if (eachVideo.level === this.state.level && eachVideo.infolevel === true && eachVideo.rolelevel === this.state.rolelevel) {
                        return (
                          <URLVideo
                            type={"video"}
                            key={index}
                            visible={eachVideo.visible}
                            src={eachVideo.vidsrc}
                            image={eachVideo.vidsrc}
                            ref={eachVideo.ref}
                            id={eachVideo.id}
                            name="shape"
                            layer={this.refs.groupAreaLayer}
                            scaleX={eachVideo.scaleX}
                            scaleY={eachVideo.scaleY}
                            x={eachVideo.x}
                            y={eachVideo.y}
                            width={eachVideo.width}
                            height={eachVideo.height}
                            stroke={eachVideo.stroke}
                            strokeWidth={eachVideo.strokeWidth}
                            rotation={eachVideo.rotation}
                            opacity={eachVideo.opacity}
                            onClick={() => {
                              let that = this;
                              if (eachVideo.link !== undefined && eachVideo.link !== "") {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
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
                            onTransformEnd={() => this.urlObjOnTransformEnd("videos")}
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
                                  if (eachVideo.name === eachArrow.to.attrs.name) {
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
                            onDragEnd={e => this.handleDragEnd(e, "videos", eachVideo.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.audios.map((eachAudio, index) => {
                      if (eachAudio.level === this.state.level && eachAudio.infolevel === true && eachAudio.rolelevel === this.state.rolelevel) {
                        return (
                          <URLVideo
                            type={"audio"}
                            key={index}
                            visible={eachAudio.visible}
                            fillPatternImage={true}
                            src={eachAudio.audsrc}
                            image={eachAudio.imgsrc}
                            ref={eachAudio.ref}
                            id={eachAudio.id}
                            name="shape"
                            scaleX={eachAudio.scaleX}
                            scaleY={eachAudio.scaleY}
                            layer={this.refs.groupAreaLayer}
                            x={eachAudio.x}
                            y={eachAudio.y}
                            width={eachAudio.width}
                            height={eachAudio.height}
                            stroke={eachAudio.stroke}
                            strokeWidth={eachAudio.strokeWidth}
                            rotation={eachAudio.rotation}
                            opacity={eachAudio.opacity}
                            onClick={() => {

                              let that = this;
                              if (eachAudio.link !== undefined && eachAudio.link !== "") {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
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
                            onTransformEnd={() => this.urlObjOnTransformEnd("audios")}
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
                                  if (eachAudio.name === eachArrow.to.attrs.name) {
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
                            onDragEnd={e => this.handleDragEnd(e, "audios", eachAudio.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.documents.map((eachDoc, index) => {
                      if (eachDoc.level === this.state.level && eachDoc.infolevel === true && eachDoc.rolelevel === this.state.rolelevel) {
                        return (
                          <Rect
                            key={index}
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
                              fetch(this.state.docsrc, {
                                method: 'GET',
                                headers: {
                                  'Content-Type': 'application/pdf',
                                },
                              })
                                .then((response) => response.blob())
                                .then((blob) => {

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
                                  if (eachDoc.name === eachArrow.to.attrs.name) {
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
                            onDragEnd={e => this.handleDragEnd(e, "documents", eachDoc.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.triangles.map((eachEllipse, index) => {
                      if (eachEllipse.level === this.state.level && eachEllipse.infolevel === true && eachEllipse.rolelevel === this.state.rolelevel) {
                        return (
                          <RegularPolygon
                            key={index}
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
                            onClick={() => {
                              let that = this;
                              if (
                                eachEllipse.link !== undefined &&
                                eachEllipse.link !== ""
                              ) {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
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
                                  if (eachEllipse.name === eachArrow.from.attrs.name) {
                                    eachArrow.points = [
                                      eachEllipse.x,
                                      eachEllipse.y,
                                      eachArrow.points[2],
                                      eachArrow.points[3]
                                    ];
                                    this.forceUpdate();
                                    this.refs.graphicStage.draw();
                                  }
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
                            onDragEnd={e => this.handleDragEnd(e, "triangles", eachEllipse.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.stars.map((eachStar, index) => {
                      if (eachStar.level === this.state.level && eachStar.infolevel === true && eachStar.rolelevel === this.state.rolelevel) {
                        return (
                          <Star
                            key={index}
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
                            onClick={() => {
                              let that = this;
                              if (eachStar.link !== undefined && eachStar.link !== "") {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
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
                                  if (eachStar.name === eachArrow.from.attrs.name) {
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
                            onDragEnd={e => this.handleDragEnd(e, "stars", eachStar.ref)}
                            onContextMenu={this.onObjectContextMenu}
                          />
                        )
                      } else {
                        return null
                      }
                    })}

                    {this.state.texts.map((eachText, index) => {
                      if (eachText.level === this.state.level && eachText.infolevel === true && eachText.rolelevel === this.state.rolelevel) {
                        return (
                          //perhaps this.state.texts only need to contain refs?
                          //so that we only need to store the refs to get more information
                          <Text
                            key={index}
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
                            draggable
                            onTransform={this.handleTextTransform}
                            onTransformEnd={this.onTransformEndText}
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
                            onDragEnd={e => this.handleDragEnd(e, "texts", eachText.ref)}
                            onClick={() => {
                              let that = this;
                              if (eachText.link !== undefined && eachText.link !== "") {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function () {
                                      that.setState({
                                        errMsg: ""
                                      });
                                    }, 1000);
                                  }
                                );

                                //let win = window.open(eachText.link, "_blank");
                                //win.focus();
                              }
                            }}
                            onDblClick={() => this.handleTextDblClick(
                              this.refs.graphicStage,
                              this.refs[eachText.ref],
                              this.refs.personalAreaLayer)
                            }
                            onContextMenu={(e) => {
                              this.onObjectContextMenu(e);
                              this.setState({
                                selectedFont: this.refs[eachText.ref]
                              });
                            }}
                          />
                        )
                      } else {
                        return null
                      }
                    })}
                    {this.state.arrows.map((eachArrow, index) => {
                      if (!eachArrow.from && !eachArrow.to && eachArrow.level === this.state.level && eachArrow.infolevel === true && eachArrow.rolelevel === this.state.rolelevel) {
                        return (
                          <Arrow
                            key={index}
                            visible={eachArrow.visible}
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
                              this.refs.groupAreaLayer.draw();

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
                          ""
                        );
                      } else if (eachArrow.from || eachArrow.to) {
                        //if arrow construction is completed
                        return (
                          ""
                        );
                      }
                    })}
                    <TransformerComponent
                      selectedShapeName={this.state.selectedShapeName}
                      ref="personalTransformer"
                      boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                    <Rect fill="rgba(0,0,0,0.5)" ref="selectionRectRef1" />
                  </Layer>
                </Stage>

              </div>
              {(this.state.open !== 1)
                ? <button onClick={() => this.setState({ open: 1 })}><i className="fas fa-caret-square-up fa-3x"></i></button>
                : <button onClick={() => this.setState({ open: 0 })}><i className="fas fa-caret-square-down fa-3x"></i></button>
              }
              <div id="rolesdrop">
                <DropdownRoles
                  openInfoSection={() => this.setState({ open: 1 })}
                  roleLevel={this.handleRoleLevel}
                  gameid={this.state.gameinstanceid}
                  editMode={true}
                />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Graphics;
