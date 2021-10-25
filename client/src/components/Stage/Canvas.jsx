import React, { Component } from 'react';
import fileDownload from 'js-file-download';
import axios from 'axios';
import Level from "../Level/Level";
import Portal from "./Shapes/Portal";
import Info from "../Information/InformationPopup";

// Dropdowns
import DropdownRoles from "../Dropdown/DropdownRoles";
import DropdownAddObjects from "../Dropdown/DropdownAddObjects";
import ContextMenu from "../ContextMenu/ContextMenu";

// Custom Konva Components
import TransformerComponent from "./TransformerComponent";
import URLVideo from "./URLVideos";
import URLImage from "./URLImage";

import TicTacToe from "./GamePieces/TicTacToe/TicTacToe";
import Connect4 from "./GamePieces/Connect4/Board";
import Poll from "./GamePieces/Poll/Poll";

// Standard Konva Components
import Konva from "konva";
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

import "./Stage.css";

let history = [];
let historyStep = 0;

class Graphics extends Component {

  // Save State
  // These are the names of the objects in state that are saved to the database
  customObjects = [
    "polls",
    "connect4s",
    "tics"
  ];
  customDeletes = [
    "pollsDeleteCount",
    "connect4sDeleteCount",
    "ticsDeleteCount"
  ];
  savedObjects = [
    // Rendered Objects Only (shapes, media, etc.)
    ...this.customObjects,
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
  ];
  deletionCounts = [
    // Delete Counts (stored to keep object label #s in sync)
    // Must be in the same order as savedObjects
    ...this.customDeletes,
    "rectDeleteCount",
    "ellipseDeleteCount",
    "starDeleteCount",
    "textDeleteCount",
    "arrowDeleteCount",
    "triangleDeleteCount",
    "imageDeleteCount",
    "videoDeleteCount",
    "audioDeleteCount",
    "documentDeleteCount",
    "linesDeleteCount",
  ];
  savedState = [
    // The complete save state
    ...this.savedObjects,
    ...this.deletionCounts,

    "savedGroups",

    // Pages
    "pages",
    "numberOfPages",

    "status",
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

      // Interactive
      tics: [],
      connect4s: [],
      polls: [],

      // An array of arrays containing grouped items
      savedGroups: [],

      connectors: [],
      gameroles: [],

      // TESTING Custom Transformer
      customRect: [
        {
          visible: true,
          x: 0,
          y: 0,
          id: "customRect",
          name: "customRect",
          ref: "customRect",
          opacity: 0,
        }
      ],

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
      pollsDeleteCount: 0,
      connect4sDeleteCount: 0,
      ticsDeleteCount: 0,

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
      textareaInlineStyle: {},
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
      layerDraggable: false,

      // Fill and Stroke
      colorf: "black",
      colors: "black",
      color: "white",
      strokeWidth: 3.75,
      opacity: 1,
      lastFill: null,

      // The blue selection rectangle / click location
      // And info about the selection
      selection: {
        isDraggingShape: false,
        visible: false,
        x1: -100,
        y1: -100,
        x2: 0,
        y2: 0
      },
      selectedShapeName: "",
      groupSelection: [],

      // Metadata
      title: "",
      category: "",
      description: "",
      thumbnail: "",

      gamepieceStatus: {},

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
      personalAreaOpen: 0, // 0 = closed, 1 = open
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

    this.reloadFromSavedState(props.doNotRecalculateBounds);
  }

  reloadFromSavedState = (doNotRecalculateBounds) => {
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstance/:adminid/:gameid', {
      params: {
        adminid: this.state.adminid,
        gameid: this.state.gameinstanceid
      }
    }).then((res) => {
      if (res.data.game_parameters) {
        // Load saved object data
        let objects = JSON.parse(res.data.game_parameters);

        // Parse the saved groups
        let parsedSavedGroups = [];
        for (let i = 0; i < objects.savedGroups.length; i++) {
          let savedGroup = [];
          for (let j = 0; j < objects.savedGroups[i].length; j++) {
            savedGroup.push(JSON.parse(objects.savedGroups[i][j]));
          }
          parsedSavedGroups.push(savedGroup);
        }
        objects.savedGroups = parsedSavedGroups;

        // Put parsed saved data into state
        this.savedState.forEach((object) => {
          this.setState({
            [object]: objects[object]
          });
        });

        setTimeout(() => {
          // Get full objects for saved groups
          let fullObjSavedGroups = [];
          for (let i = 0; i < this.state.savedGroups.length; i++) {
            let savedGroup = [];
            for (let j = 0; j < this.state.savedGroups[i].length; j++) {
              const id = this.state.savedGroups[i][j].attrs.id;
              savedGroup.push(this.refs[id]);
            }
            fullObjSavedGroups.push(savedGroup);
          }
          this.setState({
            savedGroups: fullObjSavedGroups
          });

          for (let j = 0; j < this.customObjects.length; j++) {
            const type = this.customObjects[j];
            for (let i = 0; i < this.state[type].length; i++) {
              const state = this.state[type][i];
              this.setCustomGroupPos(state, "groupAreaLayer");
              this.setCustomGroupPos(state, "personalAreaLayer");
            }
          }

          // Calculate positions on initial load
          if (!doNotRecalculateBounds) {
            this.recalculateCanvasSizeAndPosition(false);
            this.recalculateCanvasSizeAndPosition(true);
          }
        }, 100);
      }
    }).catch(error => {
      console.error(error);
    });

    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
        gameinstanceid: this.state.gameinstanceid,
      }
    });
  }

  setCustomGroupPos = (state, layer) => {
    const groups = this.refs[layer].find('Group');
    let group = null;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].attrs.id === state.id) {
        group = groups[i];
        break;
      }
    }
    if (group) {
      group.rotation(state.rotation);
      group.scale({ x: state.scaleX, y: state.scaleY });
      group.position({ x: state.x, y: state.y });
    }
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
            const rect = this.getRect(this.refs[objects[j].id]);

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
        sidebarVal = 130;
      }
      const sidebarWidth = window.matchMedia("(orientation: portrait)").matches ? 0 : sidebarVal;
      const topbarHeight = window.matchMedia("(orientation: portrait)").matches ? 110 : 55;
      const personalAreaHeight = personalArea ? 0 : 90;

      const contentWidth = rightmostX - leftmostX;
      const totalWidth = window.innerWidth - sidebarWidth;

      const contentHeight = bottommostY - topmostY;
      const totalHeight = Math.max(window.innerHeight - topbarHeight - personalAreaHeight, 1);

      const xScale = totalWidth / contentWidth;
      const yScale = totalHeight / contentHeight;

      // Scale so that everything fits on screen vertically and horizontally
      const newScale = Math.min(xScale, yScale);

      this.setState({
        [layerX]: -leftmostX,
        [layerY]: -topmostY,
        [layerScale]: newScale,
      }, () => {

        // Adjust x, y position to center content again after scale is complete
        const leftRect = this.getRect(leftmostObj);
        const rightRect = this.getRect(rightmostObj);
        const topRect = this.getRect(topmostObj);
        const bottomRect = this.getRect(bottommostObj);

        const newContentWidth = (rightRect.x + rightRect.width) - leftRect.x;
        const newContentHeight = (bottomRect.y + bottomRect.height) - topRect.y;

        this.setState({
          [layerX]: this.state[layerX] - leftRect.x + ((totalWidth - newContentWidth) / 2),
          [layerY]: this.state[layerY] + topbarHeight
        });
      });
    }
  }

  getRect = (obj) => {
    let rect = null;
    if (obj.nodeName === "DIV") {
      // Custom Object
      rect = obj.getBoundingClientRect();
    } else {
      // Konva Object
      rect = obj.getClientRect();
    }

    return rect;
  }

  saveInterval = null;
  drawInterval = null;
  componentDidMount = async () => {
    const MINUTE_MS = 1000 * 60;

    // Auto save the canvas every minute
    this.saveInterval = setInterval(() => {
      this.handleSave();
      this.props.showAlert("Simulation Autosaved", "info");
    }, MINUTE_MS);

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

    history.push(this.state);
  }

  componentWillUnmount = () => {
    clearInterval(this.saveInterval);
    clearInterval(this.drawInterval);
  }

  // Return current selectedShapeName if input is customRect or ContainerRect
  // Return input otherwise
  checkName = (name) => {
    switch (name) {
      case "customRect":
      case "ContainerRect":
        return this.state.selectedShapeName;
      default:
        return name;
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    const prevMainShapes = [];
    const currentMainShapes = [];
    for (let i = 0; i < this.savedObjects.length; i++) {
      const type = this.savedObjects[i];
      prevMainShapes.push(prevState[type]);
      currentMainShapes.push(this.state[type]);
    }

    if (!this.state.redoing && !this.state.isTransforming) {
      if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
        if (JSON.stringify(prevMainShapes) !== JSON.stringify(currentMainShapes)) {
          // If text shouldn't update, don't append to history
          if (this.state.shouldTextUpdate) {
            let uh = history;
            history = uh.slice(0, historyStep + 1);
            let toAppend = this.state;
            history = history.concat(toAppend);
            historyStep++;
          }
        }
      }
    }
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

  // essentially just for testing
  getInteractiveProps = (id) => ({
    updateStatus: (parameters) => {
      this.setState({
        gamepieceStatus: {
          ...this.state.gamepieceStatus,
          [id]: parameters
        }
      })
    },
    status: this.state.gamepieceStatus[id] || {}
  })

  handleSave = async (thenReload) => {
    let storedObj = {};
    for (let i = 0; i < this.savedState.length; i++) {
      const newObj = this.savedState[i];
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
    await axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/update/:id', body).then(() => {
      if (thenReload) {
        this.props.reloadCanvasFull();
      }
    }).catch(error => {
      console.error(error);
    });
  };

  handleCopyRole = async (gameroleid) => {
    await this.handleSave();
    return axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/copy', {
      gameroleid
    }).then((res) => {
      let objects = JSON.parse(res.data.gameinstance.game_parameters);

      // Parse the saved groups
      let parsedSavedGroups = [];
      for (let i = 0; i < objects.savedGroups.length; i++) {
        let savedGroup = [];
        for (let j = 0; j < objects.savedGroups[i].length; j++) {
          savedGroup.push(JSON.parse(objects.savedGroups[i][j]));
        }
        parsedSavedGroups.push(savedGroup);
      }
      objects.savedGroups = parsedSavedGroups;

      // Put parsed saved data into state
      this.savedState.forEach((object) => {
        this.setState({
          [object]: objects[object]
        });
      });

      return res.data.gamerole;
    }).catch(error => {
      console.log(error);
    });
  }

  handleEditRole = async ({id, roleName, roleNum}) => {
    await this.handleSave();
    return axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/update', {
      id: id,
      name: roleName,
      numspots: roleNum
    }).then((res) => {
      let objects = JSON.parse(res.data.gameinstance.game_parameters);

      // Parse the saved groups
      let parsedSavedGroups = [];
      for (let i = 0; i < objects.savedGroups.length; i++) {
        let savedGroup = [];
        for (let j = 0; j < objects.savedGroups[i].length; j++) {
          savedGroup.push(JSON.parse(objects.savedGroups[i][j]));
        }
        parsedSavedGroups.push(savedGroup);
      }
      objects.savedGroups = parsedSavedGroups;

      // Put parsed saved data into state
      this.savedState.forEach((object) => {
        this.setState({
          [object]: objects[object]
        });
      });

      return true;
    }).catch(error => {
      console.log(error);
    });
  }

  onObjectContextMenu = e => {
    const event = e.evt ? e.evt : e;
    event.preventDefault(true);
    const mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    let singleGroupSelected = false;
    if (this.state.groupSelection.length === 1 && Array.isArray(this.state.groupSelection[0])) {
      singleGroupSelected = true;
    }
    this.setState({
      selectedContextMenu: {
        unGroup: singleGroupSelected ? true : false,
        addGroup: this.state.groupSelection.length && !singleGroupSelected ? true : false,
        type: "ObjectMenu",
        position: mousePosition
      }
    });
  }

  updateSelectionRect = (personalArea) => {
    let node = this.refs.groupSelectionRect;
    if (personalArea) {
      node = this.refs.personalSelectionRect;
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
    const event = e.evt ? e.evt : e;

    if (event.target.parentElement.className === "konvajs-content") {
      const customObjs = document.getElementsByClassName("customObj");
      for (let i = 0; i < customObjs.length; i++) {
        const id = customObjs[i].dataset.name;
        const rect = customObjs[i].getBoundingClientRect();
        if (
          event.x > rect.x &&
          event.y > rect.y &&
          event.x < rect.x + rect.width &&
          event.y < rect.y + rect.height
        ) {
          // Clicked on a custom object
          this.setState({
            selectedShapeName: id,
            groupSelection: []
          }, this.handleObjectSelection);
          return;
        }
      }
    }


    if (!event.ctrlKey) {
      this.setState({
        layerDraggable: false
      });
    }

    let pos = null;
    if (event.layerX) {
      pos = {
        x: event.layerX,
        y: event.layerY
      };
    } else {
      let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
      if (sidebarPx > 0 && personalArea) {
        sidebarPx = 100;
      }

      pos = {
        x: event.clientX - sidebarPx,
        y: event.clientY
      }
    }

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
      if (e.evt) {
        const isElement = e.target.findAncestor(".elements-container");
        const isTransformer = e.target.findAncestor("Transformer");
        if (isElement || isTransformer) {
          return;
        }
      }

      let scale = this.state.groupLayerScale;
      let xOffset = -this.state.groupLayerX;
      let yOffset = -this.state.groupLayerY;
      if (personalArea) {
        scale = this.state.personalLayerScale;
        xOffset = -this.state.personalLayerX;
        yOffset = -this.state.personalLayerY;
      }

      const layer = personalArea ? "personalAreaLayer" : "groupAreaLayer";
      const pointerPos = this.refs[layer].getStage().getPointerPosition();
      let shape = true;
      if (e.evt) {
        shape = this.refs[layer].getIntersection(pointerPos);
      }
      this.setState({
        selection: {
          isDraggingShape: this.isShape(shape),
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

  handleMouseUp = (e, personalArea) => {
    const event = e.evt ? e.evt : e;

    if (this.state.drawMode === true) {
      this.setState({
        isDrawing: false
      });
    } else {
      if (!this.state.selection.visible) {
        return;
      }

      const layer = personalArea ? "personalAreaLayer" : "groupAreaLayer";
      const selectionRect = personalArea ? "personalSelectionRect" : "groupSelectionRect";
      const pointerPos = this.refs[layer].getStage().getPointerPosition();
      let shape = null;
      let clickShapeGroup = null;
      if (pointerPos) {
        shape = this.refs[layer].getIntersection(pointerPos);
        clickShapeGroup = this.getShapeGroup(shape);
      }

      if (event.button === 0) {
        // LEFT CLICK
        const selBox = this.refs[selectionRect].getClientRect();
        if (selBox.width > 1 && selBox.height > 1) {
          // This only runs if there has been a rectangle selection (click and drag selection)
          const elements = [];
          this.refs[layer].find(".shape").forEach((elementNode) => {
            const elBox = elementNode.getClientRect();
            if (Konva.Util.haveIntersection(selBox, elBox)) {
              elements.push(elementNode);
            }
          });

          // Handle if nothing, one thing, or a group has been selected
          if (elements.length === 0) {
            this.setState({
              selectedShapeName: "",
              groupSelection: []
            }, this.handleObjectSelection);
          } else {
            // Get any selected groups
            let elemIds = [];
            for (let i = 0; i < elements.length; i++) {
              elemIds.push(elements[i].attrs.id);
            }
            const selectedGroups = [];
            for (let i = 0; i < this.state.savedGroups.length; i++) {
              const group = this.state.savedGroups[i];
              for (let j = 0; j < group.length; j++) {
                if (elemIds.includes(group[j].attrs.id)) {
                  selectedGroups.push(group);
                  break;
                }
              }
            }
            for (let i = 0; i < selectedGroups.length; i++) {
              const group = selectedGroups[i];
              for (let j = 0; j < group.length; j++) {
                elemIds = elemIds.filter(e => group[j].attrs.id !== e);
              }
            }
            elemIds = elemIds.map(e => this.refs[e]);

            if (selectedGroups.length === 0 && elemIds.length === 1) {
              this.setState({
                selectedShapeName: this.checkName(elements[0].id()),
                groupSelection: []
              }, this.handleObjectSelection);
            } else {
              const selection = [...selectedGroups, ...elemIds];
              if (!this.state.selection.isDraggingShape) {
                this.setState({
                  selectedShapeName: "",
                  groupSelection: selection
                }, this.handleObjectSelection);
              }
            }
          }
        } else {
          // There has been a single left click
          if (this.isShape(shape)) {
            if (event.shiftKey) {
              // Shift selected -> create group selection

              // The object that was just shift selected
              let alreadySelectedCurrent = false;
              // The object already selected while new shift selection was made
              let alreadySelectedPrev = false;

              // This determines if the object that was just selected or was previously selected
              // is part of the groupSelection already so the logic will deal with it accordingly
              // Current already selected -> deselect
              // Prev already selected & different -> add to new group selection
              for (let i = 0; i < this.state.groupSelection.length; i++) {
                const obj = this.state.groupSelection[i];
                if (!Array.isArray(obj)) {
                  if (obj.attrs.id === shape.id()) {
                    alreadySelectedCurrent = true;
                  }
                  if (obj.attrs.id === this.state.selectedShapeName && this.state.selectedShapeName) {
                    alreadySelectedPrev = true;
                  }
                } else if (clickShapeGroup) {
                  const clickedGroupIsObj = obj.every(item => clickShapeGroup.includes(item)) &&
                    clickShapeGroup.every(item => obj.includes(item));
                  if (clickedGroupIsObj) {
                    alreadySelectedCurrent = true;
                    break;
                  }
                }

                if (alreadySelectedCurrent && (alreadySelectedPrev || !this.state.selectedShapeName)) {
                  break;
                }
              }

              if (this.state.selectedShapeName !== shape.id() || this.state.groupSelection.length) {
                if (!alreadySelectedCurrent) {
                  // ADD SELECTION

                  const newSelection = [...this.state.groupSelection];
                  if (!alreadySelectedPrev && this.state.selectedShapeName !== shape.id() && this.state.selectedShapeName) {
                    // A shape is already selected in selectedShapeName but not in groupSelection 
                    // Add it to groupSelection
                    newSelection.push(this.refs[this.state.selectedShapeName]);
                  }
                  if (newSelection.length === 0) {
                    // Shift select with nothing else selected so set it as the selection
                    if (!clickShapeGroup) {
                      this.setState({
                        selectedShapeName: this.checkName(shape.id()),
                        groupSelection: []
                      }, this.handleObjectSelection);
                    } else {
                      this.setState({
                        selectedShapeName: "",
                        groupSelection: [clickShapeGroup]
                      }, this.handleObjectSelection);
                    }
                  } else {
                    // Add the new selection to the shift select group
                    if (!clickShapeGroup) {
                      this.setState({
                        selectedShapeName: "",
                        groupSelection: [...newSelection, this.refs[shape.id()]]
                      }, this.handleObjectSelection);
                    } else {
                      this.setState({
                        selectedShapeName: "",
                        groupSelection: [...newSelection, clickShapeGroup]
                      }, this.handleObjectSelection);
                    }
                  }
                } else {
                  // REMOVE SELECTION

                  const newGroupSelection = this.state.groupSelection.filter((obj) => {
                    if (Array.isArray(obj)) {
                      if (clickShapeGroup) {
                        const clickedGroupIsObj = obj.every(item => clickShapeGroup.includes(item)) &&
                          clickShapeGroup.every(item => obj.includes(item));
                        return !clickedGroupIsObj;
                      } else {
                        return true;
                      }
                    } else {
                      return obj.attrs.id !== shape.id();
                    }
                  });
                  if (newGroupSelection.length === 1) {
                    // Only one selection left
                    if (Array.isArray(newGroupSelection[0])) {
                      this.setState({
                        selectedShapeName: "",
                        groupSelection: [newGroupSelection[0]]
                      }, this.handleObjectSelection);
                    } else {
                      this.setState({
                        selectedShapeName: this.checkName(newGroupSelection[0].id()),
                        groupSelection: []
                      }, this.handleObjectSelection);
                    }
                  } else {
                    this.setState({
                      selectedShapeName: "",
                      groupSelection: newGroupSelection
                    }, this.handleObjectSelection);
                  }
                }
              }
            } else {
              // Clicked on object -> put the selected object in state
              if (clickShapeGroup) {
                this.setState({
                  selectedShapeName: "",
                  groupSelection: [clickShapeGroup]
                }, this.handleObjectSelection);
              } else {
                const shapeId = e.evt ? shape.id() : e.target.closest(".customObj").dataset.name;
                this.setState({
                  selectedShapeName: this.checkName(shapeId),
                  groupSelection: []
                }, this.handleObjectSelection);
              }
            }
          } else {
            // Clicked on nothing -> deselect all
            if (!this.state.selection.isDraggingShape) {
              this.setState({
                selectedShapeName: "",
                groupSelection: []
              }, this.handleObjectSelection);
            }
          }
        }
      } else if (event.button === 2) {
        // RIGHT CLICK
        if (this.isShape(shape)) {
          if (clickShapeGroup) {
            // Check if group already selected to avoid duplicates
            let alreadySelected = false;
            for (let i = 0; i < this.state.groupSelection.length; i++) {
              const obj = this.state.groupSelection[i];
              if (Array.isArray(obj) && obj.includes(clickShapeGroup[0])) {
                alreadySelected = true;
              }
            }

            if (!alreadySelected) {
              this.setState({
                selectedShapeName: "",
                groupSelection: [...this.state.groupSelection, clickShapeGroup]
              }, this.handleObjectSelection);
            }
          } else {
            // Right click on a shape -> set it to the selection
            let shapeIsInGroupSelection = false;
            for (let i = 0; i < this.state.groupSelection.length; i++) {
              if (
                !Array.isArray(this.state.groupSelection[i]) &&
                this.state.groupSelection[i].attrs.id === shape.id()
              ) {
                shapeIsInGroupSelection = true;
                break;
              }
            }

            if (!shapeIsInGroupSelection) {
              const shapeId = e.evt ? shape.id() : e.target.closest(".customObj").dataset.name;
              this.setState({
                selectedShapeName: this.checkName(shapeId),
                groupSelection: []
              }, this.handleObjectSelection);
            }
          }
        } else {
          // Right click on the canvas -> show the add object menu
          const type = personalArea ? "PersonalAddMenu" : "GroupAddMenu";
          const notVisible = personalArea ? "groupAreaContextMenuVisible" : "personalAreaContextMenuVisible";
          const visible = personalArea ? "personalAreaContextMenuVisible" : "groupAreaContextMenuVisible";
          const contextMenuX = personalArea ? "personalAreaContextMenuX" : "groupAreaContextMenuX";
          const contextMenuY = personalArea ? "personalAreaContextMenuY" : "groupAreaContextMenuY";
          let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
          if (sidebarPx > 0 && layer === this.refs.personalAreaLayer) {
            sidebarPx = 100;
          }
          this.setState({
            selectedContextMenu: {
              type: type,
              position: {
                x: event.layerX + sidebarPx,
                y: event.layerY
              }
            },
            [notVisible]: false,
            [visible]: true,
            [contextMenuX]: event.layerX + sidebarPx,
            [contextMenuY]: event.layerY,
          });
        }
      }

      this.setState({
        selection: {
          ...this.state.selection,
          visible: false
        }
      });

      // Disable click event
      Konva.listenClickTap = false;
      this.updateSelectionRect(personalArea);

      // Update custom object transform
      if (e.evt) {
        this.getKonvaObj(this.state.selectedShapeName, true, true);
      }
    }
  };

  isShape = (shape) => {
    if (shape === true) {
      return true;
    }
    if (
      shape === null ||
      shape === undefined ||
      shape.name() === null ||
      shape.name() === undefined ||
      shape.id() === "ContainerRect"
    ) {
      return false;
    } else {
      return true;
    }
  }

  // Put the Transform around the selected object / group
  handleObjectSelection = () => {
    const type = this.getObjType(this.state.selectedShapeName);
    const transformer = this.state.personalAreaOpen ? "personalTransformer" : "groupTransformer";
    if (this.refs[this.state.selectedShapeName]) {
      this.refs[transformer].nodes([this.getKonvaObj(this.state.selectedShapeName, true, false)]);
    } else if (type === "" && this.state.groupSelection.length) {
      this.refs[transformer].nodes(this.state.groupSelection.flat());
    } else {
      this.refs[transformer].nodes([]);
    }
  }

  handleMouseOver = (e, personalArea) => {
    const event = e.evt ? e.evt : e;

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
      if (!this.state.selection.visible && !this.state.layerDraggable) {
        return;
      }

      const stage = personalArea ? "personalAreaStage" : "graphicStage";
      const pos = this.refs[stage].getPointerPosition();
      const shape = this.refs[stage].getIntersection(pos);

      if (shape && shape.attrs.link) {
        document.body.style.cursor = "pointer";
      } else if (shape) {
        // Only have drag select on left click and drag
        if (event.buttons === 1 && !this.state.layerDraggable) {
          if (this.state.selection.isDraggingShape) {
            // Select the shape being dragged (and don't create a selection)
            const shapeGroup = this.getShapeGroup(shape);
            if (shapeGroup) {
              this.setState({
                selectedShapeName: "",
                groupSelection: [shapeGroup]
              }, this.handleObjectSelection);
            } else {
              const shapeId = e.evt ? shape.id() : e.target.closest(".customObj").dataset.name;
              this.setState({
                selectedShapeName: this.checkName(shapeId),
                groupSelection: []
              }, this.handleObjectSelection);
            }
          } else {
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
      }
    }
  };

  handleDragEnd = (e, objectsName, ref) => {
    let shape = null;
    const layer = this.state.personalAreaOpen ? "personalAreaLayer" : "groupAreaLayer";
    if (this.customObjects.includes(objectsName)) {
      const customObjs = this.refs[layer].find('Group');
      for (let i = 0; i < customObjs.length; i++) {
        const id = customObjs[i].attrs.id;
        if (id === ref) {
          shape = customObjs[i];
        }
      }
    } else {
      shape = this.refs[ref];
    }

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
    let objectsExist = false;
    for (let i = 0; i < this.savedObjects.length; i++) {
      if (this.state[this.savedObjects[i]].length > 0) {
        objectsExist = true;
        break;
      }
    }
    if (objectsExist) {
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

  dragLayer = (e, personalArea) => {
    const type = personalArea ? "personal" : "group";
    if (this.state.layerDraggable) {
      this.setState({
        [type + "LayerX"]: this.state[type + "LayerX"] + e.evt.movementX,
        [type + "LayerY"]: this.state[type + "LayerY"] + e.evt.movementY
      });
    }
  }

  handleUndo = () => {
    this.handleSave();
    if (!this.state.isTransforming) {
      if (!this.state.textEditVisible) {
        if (historyStep === 0) {
          return;
        }
        historyStep--;
        for (let i = 0; i < this.savedObjects.length; i++) {
          this.setState({
            [this.savedObjects[i]]: history[historyStep][this.savedObjects[i]]
          }, () => this.refs.graphicStage.draw());
        }
      }
      this.setState({
        selectedContextMenu: null,
        redoing: true,
        selectedShapeName: this.shapeIsGone(history[historyStep])
          ? ""
          : this.state.selectedShapeName
      });
    }
  };

  handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }

    historyStep++;
    const next = history[historyStep];
    for (let i = 0; i < this.savedObjects.length; i++) {
      this.setState({
        [this.savedObjects[i]]: next[this.savedObjects[i]]
      }, this.forceUpdate);
    }

    this.setState({
      redoing: true,
      selectedShapeName: this.shapeIsGone(history[historyStep])
        ? ""
        : this.state.selectedShapeName,
      selectedContextMenu: null
    });
  }

  getObjType = (name) => {
    return name.replace(/\d+$/, "");
  }

  handleCopy = () => {
    const toCopy = this.state.selectedShapeName ? [this.refs[this.state.selectedShapeName]] : this.state.groupSelection;
    if (toCopy) {
      this.setState({
        copied: toCopy,
        selectedContextMenu: null
      });
    }
  }

  getStateObjectById = (id) => {
    const type = this.getObjType(id);
    const item = this.state[type].filter((obj) => {
      return obj.id === id;
    });
    if (item.length) {
      return item[0];
    } else {
      return null;
    }
  }

  handlePaste = () => {
    if (
      this.state.copied === null ||
      this.state.copied === undefined ||
      document.activeElement.getAttribute("name") !== "pasteContainer"
    ) {
      // Ignore paste if nothing is copied or if focus is not on canvas
      return;
    }

    // Convert the copied items from konva objects to state objects
    const stateItems = [];
    for (let i = 0; i < this.state.copied.length; i++) {
      const copiedItem = this.state.copied[i];

      if (Array.isArray(copiedItem)) {
        // Enter into group if item is a group
        const stateGroup = []
        for (let j = 0; j < copiedItem.length; j++) {
          const stateObj = this.getStateObjectById(copiedItem[j].attrs.id);
          stateGroup.push(stateObj);
        }
        stateItems.push(stateGroup);
      } else {
        // Single item
        const stateObj = this.getStateObjectById(copiedItem.attrs.id);
        stateItems.push(stateObj);
      }
    }

    // Get group item ids
    const groupCopiedIds = [];
    for (let i = 0; i < stateItems.length; i++) {
      if (Array.isArray(stateItems[i])) {
        const group = stateItems[i].map((item) => {
          return item.id
        });
        groupCopiedIds.push(group);
      }
    }

    // Get the top left copied shape's x & y coords
    let originX = null;
    let originY = null;
    const itemsFlat = stateItems.flat();
    for (let i = 0; i < itemsFlat.length; i++) {
      if (originX === null || itemsFlat[i].x < originX) {
        originX = itemsFlat[i].x;
      }
      if (originY === null || itemsFlat[i].y < originY) {
        originY = itemsFlat[i].y;
      }
    }

    // Paste by type
    let types = [];
    for (let i = 0; i < itemsFlat.length; i++) {
      types.push(this.getObjType(itemsFlat[i].id));
    }
    types = [...new Set(types)];

    for (let i = 0; i < types.length; i++) {
      let objects = [...this.state[types[i]]];
      const typeIndex = this.savedObjects.indexOf(types[i]);
      const delCount = this.state[this.deletionCounts[typeIndex]];
      for (let j = 0; j < itemsFlat.length; j++) {
        if (this.getObjType(itemsFlat[j].id) === types[i]) {
          const num = objects.length + delCount + 1;
          const newX = this.state.selection.x1 + (itemsFlat[j].x - originX);
          const newY = this.state.selection.y1 + (itemsFlat[j].y - originY);
          const newId = types[i] + num;
          const newObject = {
            ...itemsFlat[j],
            id: newId,
            ref: newId,
            name: newId,
            x: newX,
            y: newY
          }
          objects.push(newObject);

          // Check if in group and replace with new id if so
          for (let x = 0; x < groupCopiedIds.length; x++) {
            for (let y = 0; y < groupCopiedIds[x].length; y++) {
              if (groupCopiedIds[x][y] === itemsFlat[j].id) {
                groupCopiedIds[x][y] = newId;
              }
            }
          }
        }
      }
      this.setState({
        [types[i]]: objects
      });
    }

    this.setState({
      selectedContextMenu: null
    }, () => {
      // All pasting has been completed, time to create groups
      for (let i = 0; i < groupCopiedIds.length; i++) {
        const group = groupCopiedIds[i].map((id) => {
          return this.refs[id];
        });
        this.handleGrouping(group);
      }
    });
  }

  handleDelete = () => {
    // Get list of each individual object being deleted
    let toDelete = [];
    if (this.state.selectedShapeName) {
      toDelete = [this.refs[this.state.selectedShapeName]];
    } else {
      toDelete = this.state.groupSelection.flat();
    }

    // Get a list of the affected types
    let affectedTypes = [];
    let customObjDeleted = false;
    for (let i = 0; i < toDelete.length; i++) {
      if (!toDelete[i].attrs) {
        customObjDeleted = true;
      }
      affectedTypes.push(this.getObjType(toDelete[i].attrs ? toDelete[i].attrs.id : toDelete[i].dataset.name));
    }
    affectedTypes = [...new Set(affectedTypes)];

    // Delete objects one type at a time
    this.handleUngrouping();
    for (let i = 0; i < affectedTypes.length; i++) {
      const type = affectedTypes[i];
      const toDeleteOfType = [];
      for (let j = 0; j < toDelete.length; j++) {
        if (this.getObjType(toDelete[j].attrs ? toDelete[j].attrs.id : toDelete[j].dataset.name) === type) {
          toDeleteOfType.push(toDelete[j].attrs ? toDelete[j].attrs.id : toDelete[j].dataset.name);
        }
      }
      let objs = [...this.state[type]];
      const deletedCountName = this.deletionCounts[this.savedObjects.indexOf(type)];
      let deletedCount = this.state[deletedCountName];
      deletedCount += toDeleteOfType.length;
      objs = objs.filter((obj) => {
        return !toDeleteOfType.includes(obj.id);
      });
      this.setState({
        [type]: objs,
        [deletedCountName]: deletedCount
      }, () => {
        this.handleSave(customObjDeleted);
      });
    }

    // Deselect
    this.setState({
      selectedShapeName: "",
      groupSelection: [],
      selectedContextMenu: null
    }, this.handleObjectSelection);
  }

  handleCut = () => {
    this.handleCopy();
    this.handleDelete();
    this.setState({
      selectedContextMenu: null
    });
  }

  handleCloseContextMenu = (e) => {
    this.setState({
      selectedContextMenu: null
    })
  }

  handlePersonalAreaOpen = (open) => {
    this.setState({
      personalAreaOpen: open ? 1 : 0,
      groupSelection: [],
      selectedShapeName: "",
    }, this.handleObjectSelection);

    if (open) {
      document.getElementById("personalMainContainer").focus();
    } else {
      document.getElementById("editMainContainer").focus();
    }
  }

  shapeIsGone = returnTo => {
    if (this.state.selectedShapeName) {
      let exists = false;
      const type = this.getObjType(this.state.selectedShapeName);
      returnTo[type].map((obj) => {
        if (obj.id === this.state.selectedShapeName) {
          exists = true;
        }
      });
      return !exists;
    } else {
      return true;
    }
  };

  IsJsonString = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  // Fill Color
  handleFillColor = (e) => {
    const type = this.getObjType(this.state.selectedShapeName);
    this.setState(prevState => ({
      [type]: prevState[type].map(obj =>
        obj.id === this.state.selectedShapeName
          ? {
            ...obj,
            fill: e.hex
          }
          : obj
      )
    }));
  }

  // Stroke Color
  handleStrokeColor = (e) => {
    const type = this.getObjType(this.state.selectedShapeName);
    this.setState(prevState => ({
      [type]: prevState[type].map(obj =>
        obj.id === this.state.selectedShapeName
          ? {
            ...obj,
            stroke: e.hex
          }
          : obj
      )
    }));
  }

  // Font Family
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

  // Font Size
  handleSize = (e) => {
    if (Number.isNaN(parseInt(e)) || parseInt(e) === 0) {
      e = 50;
    } else {
      e = parseInt(e);
    }
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

  // Stroke Width
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

  // Object Opacity
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

  handleGrouping = (inGroup) => {
    const groupSelection = inGroup ? inGroup : this.state.groupSelection;
    if (groupSelection.length > 1) {
      // Remove any existing groups which are part of the new group
      const newGroup = [...groupSelection.flat()];
      let newSavedGroups = [...this.state.savedGroups];
      let newGroupSameIndices = [];
      for (let i = 0; i < newGroup.length; i++) {
        if (newSavedGroups.flat().includes(newGroup[i])) {
          newGroupSameIndices.push(i);
        }
      }
      let savedGroupSameIndices = [];
      for (let i = 0; i < newSavedGroups.length; i++) {
        for (let j = 0; j < newGroupSameIndices.length; j++) {
          if (newSavedGroups[i].includes(newGroup[newGroupSameIndices[j]])) {
            savedGroupSameIndices.push(i);
          }
        }
      }
      savedGroupSameIndices = [...new Set(savedGroupSameIndices)];
      for (let i = 0; i < savedGroupSameIndices.length; i++) {
        newSavedGroups[savedGroupSameIndices[i]] = null;
      }
      newSavedGroups = newSavedGroups.filter(g => g !== null);
      newSavedGroups.push(newGroup);

      this.setState({
        selectedShape: "",
        groupSelection: [newGroup],
        savedGroups: newSavedGroups
      });
    }
  }

  handleUngrouping = () => {
    if (this.state.groupSelection.length && this.state.groupSelection.some(obj => Array.isArray(obj))) {
      for (let x = 0; x < this.state.groupSelection.length; x++) {
        const selection = this.state.groupSelection[x];
        // Item is a group (so ungroup it)
        if (Array.isArray(selection)) {
          const objId = selection[0].attrs.id;
          for (let i = 0; i < this.state.savedGroups.length; i++) {
            for (let j = 0; j < this.state.savedGroups[i].length; j++) {
              if (this.state.savedGroups[i][j].attrs.id === objId) {
                const newSavedGroups = [...this.state.savedGroups.slice(0, i), ...this.state.savedGroups.slice(i + 1)];
                this.setState({
                  selectedShape: "",
                  groupSelection: [],
                  savedGroups: newSavedGroups
                }, this.handleObjectSelection);
                return;
              }
            }
          }
        }
      }
    }
  }

  // Returns the group a shape is part of or null if it isn't in a group
  getShapeGroup = (shape) => {
    if (shape && !Array.isArray(shape)) {
      for (let i = 0; i < this.state.savedGroups.length; i++) {
        for (let j = 0; j < this.state.savedGroups[i].length; j++) {
          if (this.state.savedGroups[i][j].attrs.id === shape.id()) {
            return this.state.savedGroups[i];
          }
        }
      }
    }
    return null;
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
        topPx = 70;
      }
      const scaleVal = layer === this.refs.personalAreaLayer ?
        this.state.personalLayerScale : this.state.groupLayerScale;

      this.setState({
        textX: text.absolutePosition().x + sidebarPx,
        textY: text.absolutePosition().y + topPx,
        textEditVisible: !this.state.textEditVisible,
        text: text.attrs.text,
        currentTextRef: text.attrs.id,
        textareaWidth: text.attrs.width * scaleVal,
        textareaHeight: text.textHeight * text.textArr.length * scaleVal,
        textareaFill: text.attrs.fill,
        textareaFontFamily: text.attrs.fontFamily,
        textareaFontSize: text.attrs.fontSize * scaleVal,
        textRotation: text.attrs.rotation,
      }, () => {
        this.setState({
          textareaInlineStyle: {
            display: this.state.textEditVisible ? "block" : "none",
            width: this.state.textareaWidth,
            height: this.state.textareaHeight,
            fontSize: this.state.textareaFontSize + "px",
            fontFamily: this.state.textareaFontFamily,
            color: this.state.textareaFill,
            top: this.state.textY + "px",
            left: this.state.textX + "px",
            transform: `rotate(${this.state.textRotation}deg) translateY(2px)`
          }
        });
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
        layerDraggable: false
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
        layerDraggable: true
      });
    } else if (event.altKey && event.keyCode === r) {
      // Print refs
      console.log("REFS:");
      console.log(this.refs.groupAreaLayer.find('Group'));
      console.log({ ...this.refs });
      console.log({ ...this.state });
    }
  }

  deltaTransformPoint = (matrix, point) => {
    const dx = point.x * matrix.a + point.y * matrix.c + 0;
    const dy = point.x * matrix.b + point.y * matrix.d + 0;
    return {
      x: dx,
      y: dy
    };
  }

  decomposeMatrix = (matrix) => {
    // @See https://gist.github.com/2052247

    // Calculate delta transform point
    const px = this.deltaTransformPoint(matrix, { x: 0, y: 1 });
    const py = this.deltaTransformPoint(matrix, { x: 1, y: 0 });

    // Calculate skew
    const skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    const skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

    return {
      translateX: matrix.e,
      translateY: matrix.f,
      scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
      scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
      skewX: skewX,
      skewY: skewY,
      rotation: skewX // Rotation is the same as skew x
    };
  }

  // For Konva Objects: 
  // returns Konva object
  // For Custom Objects:
  // returns the Konva Group associated with the KonvaHtml of the object
  getKonvaObj = (id, updateState, showTransformer) => {
    if (id) {
      if (this.refs[id].attrs) {
        return this.refs[id];
      } else {
        const layer = this.state.personalAreaOpen ? "personalAreaLayer" : "groupAreaLayer";
        const groups = this.refs[layer].find('Group');
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].attrs.id === id) {
            const group = groups[i];
            if (updateState) {
              const customState = [...this.state[this.getObjType(id)]];

              const elem = this.refs[id];
              const style = window.getComputedStyle(elem);
              const matrix = this.decomposeMatrix(new DOMMatrix(style.transform));
              const x = matrix.translateX;
              const y = matrix.translateY;
              const width = elem.clientWidth;
              const height = elem.clientHeight;

              const paddingPercent = 0.05;
              this.setState({
                customRect: [{
                  ...this.state.customRect[0],
                  x: x - ((width * paddingPercent) / 2),
                  y: y - ((height * paddingPercent) / 2)
                }],
                [this.getObjType(id)]: customState
              });

              const sizeRect = this.refs.customRect;
              sizeRect.attrs.width = width * (1 + paddingPercent);
              sizeRect.attrs.height = height * (1 + paddingPercent);
              group.add(sizeRect);

              if (showTransformer) {
                this.setState({
                  selectedShapeName: id
                }, this.handleObjectSelection);
              }
            }
            return group;
          }
        }
        return null;
      }
    }
  }

  onObjectDragMove = (obj) => {
    this.state.arrows.map(arrow => {
      if (arrow.from !== undefined) {
        if (obj.name === arrow.from.attrs.name) {
          arrow.points = [
            obj.x,
            obj.y,
            arrow.points[2],
            arrow.points[3]
          ];
        }
      }

      if (arrow.to !== undefined) {
        if (obj.name === arrow.to.attrs.name) {
          arrow.points = [
            arrow.points[0],
            arrow.points[1],
            obj.x,
            obj.y
          ];
        }
      }
    }, this.forceUpdate);
  }

  onObjectClick = (obj) => {
    if (obj.link !== undefined && obj.link !== "") {
      this.setState({
        errMsg: "Links will not be opened in Edit Mode."
      }, () => {
        setTimeout(() => {
          this.setState({
            errMsg: ""
          });
        }, 1000);
      });
    }
  }

  onDocClick = () => {
    fetch(this.state.docsrc, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    }).then(response => response.blob()).then(blob => {
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', this.state.docsrc);

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    });
  }

  setPollJson = (json, id) => {
    this.setState(prevState => ({
      polls: prevState.polls.map(poll =>
        poll.id === id
          ? {
            ...poll,
            json: json
          }
          : poll
      )
    }));
  }

  onDragEndArrow = (arrow) => {
    // Set new points to current position
    let oldPoints = [
      arrow.points[0],
      arrow.points[1],
      arrow.points[2],
      arrow.points[3]
    ];

    let shiftX = this.refs[arrow.ref].attrs.x;
    let shiftY = this.refs[arrow.ref].attrs.y;

    let newPoints = [
      oldPoints[0] + shiftX,
      oldPoints[1] + shiftY,
      oldPoints[2] + shiftX,
      oldPoints[3] + shiftY
    ];

    this.refs[arrow.ref].position({ x: 0, y: 0 });

    this.setState(prevState => ({
      arrows: prevState.arrows.map(a =>
        a.name === arrow.name
          ? {
            ...a,
            points: newPoints
          }
          : a
      )
    }));
  }

  onObjectTransformStart = () => {
    this.setState({ isTransforming: true });
  }

  onObjectTransformEnd = (obj) => {
    this.setState({ isTransforming: false });
    const custom = this.customObjects.includes(this.getObjType(obj.id));
    let object = null;
    let type = null;
    if (!custom) {
      object = this.refs[obj.ref];
      type = this.getObjType(object.attrs.id);
    } else {
      const layer = this.state.personalAreaOpen ? "personalAreaLayer" : "groupAreaLayer";
      const customObjs = this.refs[layer].find('Group');
      for (let i = 0; i < customObjs.length; i++) {
        const id = customObjs[i].attrs.id;
        if (id === obj.id) {
          object = customObjs[i];
          break;
        }
      }
      type = this.getObjType(obj.id);
    }

    let transformOptions = {};
    switch (type) {
      case "texts":
        transformOptions = {
          width: object.width(),
          textWidth: object.textWidth,
          textHeight: object.textHeight
        };
        break;
      case "ellipses":
        transformOptions = {
          radiusX: object.radiusX() * object.scaleX(),
          radiusY: object.radiusY() * object.scaleY()
        };
        break;
      case "stars":
        transformOptions = {
          innerRadius: object.innerRadius() * object.scaleX(),
          outerRadius: object.outerRadius() * object.scaleY()
        };
        break;
      case "images":
      case "videos":
      case "audios":
        transformOptions = {
          scaleX: object.scaleX(),
          scaleY: object.scaleY()
        };
        break;
      default:
        transformOptions = {
          width: object.width() * object.scaleX(),
          height: object.height() * object.scaleY()
        };
        break;
    }

    if (this.customObjects.includes(type)) {
      transformOptions = {
        scaleX: object.scaleX(),
        scaleY: object.scaleY()
      };
    }

    this.setState(
      prevState => ({
        [type]: prevState[type].map(o =>
          o.id === object.attrs.id
            ? {
              ...o,
              ...transformOptions,
              rotation: object.rotation(),
              x: object.x(),
              y: object.y(),
            }
            : o
        )
      })
    );

    if (!(type === "images" || type === "videos" || type === "audios" || this.customObjects.includes(type))) {
      object.setAttr("scaleX", 1);
      object.setAttr("scaleY", 1);
    }
  }

  updateText = (e) => {
    if (!e || e.keyCode === 13) {
      this.setState({
        textEditVisible: false,
        shouldTextUpdate: true,
        textareaInlineStyle: {
          ...this.state.textareaInlineStyle,
          display: "none"
        }
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
    }
  }

  // Component Props
  defaultObjProps = (obj, index) => {
    return {
      key: index,
      visible: obj.visible,
      rotation: obj.rotation,
      ref: obj.ref,
      fill: obj.fill,
      opacity: obj.opacity,
      name: "shape",
      id: obj.id,
      x: obj.x,
      y: obj.y,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      strokeScaleEnabled: false,
      draggable: !this.state.layerDraggable,
      onClick: () => this.onObjectClick(obj),
      onTransformStart: this.onObjectTransformStart,
      onTransformEnd: () => this.onObjectTransformEnd(obj),
      onDragMove: () => this.onObjectDragMove(obj),
      onDragEnd: e => this.handleDragEnd(e, this.getObjType(obj.id), obj.ref),
      onContextMenu: this.onObjectContextMenu
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
      text: obj.text,
      link: obj.link,
      onTransform: this.handleTextTransform,
      onDblClick: () => this.handleTextDblClick(this.refs.graphicStage, this.refs[obj.ref], this.refs.groupAreaLayer),
      onContextMenu: (e) => {
        this.onObjectContextMenu(e);
        this.setState({
          selectedFont: this.refs[obj.ref]
        });
      }
    }
  }

  lineProps = (obj, index) => {
    return {
      id: obj.id,
      level: obj.level,
      key: index,
      points: obj.points,
      stroke: obj.color,
      strokeWidth: 5,
      tension: 0.5,
      lineCap: "round",
      globalCompositeOperation: obj.tool === 'eraser' ? 'destination-out' : 'source-over',
      draggable: !this.state.layerDraggable,
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
      draggable: !this.state.layerDraggable,
      onDragEnd: () => this.onDragEndArrow(obj)
    }
  }

  transformerProps = (type) => {
    return {
      selectedShapeName: this.state.selectedShapeName,
      ref: type + "Transformer",
      boundBoxFunc: (oldBox, newBox) => {
        // Limit resize
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }
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

  objectIsOnPersonalStage = (obj) => {
    return obj.level === this.state.level && obj.infolevel === true && obj.rolelevel === this.state.rolelevel;
  }

  customObjProps = () => {
    return {
      onMouseUp: (e) => this.handleMouseUp(e, false),
      onMouseDown: (e) => this.onMouseDown(e, false),
      onMouseMove: (e) => this.handleMouseOver(e, false),
      onTransformEnd: (e) => this.onObjectTransformEnd(e),
      updateKonva: this.getKonvaObj
    };
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

        {/* This Rect acts as the transform object for custom objects */}
        <Rect
          {...this.defaultObjProps(this.state.customRect[0], 0)}
          draggable={false}
        />

        {/* Load objects in state */}
        {this.state.rectangles.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Rect {...this.defaultObjProps(obj, index)} {...this.rectProps(obj)} /> : null
        })}
        {this.state.ellipses.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Ellipse {...this.defaultObjProps(obj, index)} {...this.ellipseProps(obj)} /> : null
        })}
        {this.state.lines.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Line {...this.lineProps(obj, index)} /> : null
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
        {this.state.polls.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Poll
              defaultProps={{
                ...this.defaultObjProps(obj, index),
                ...this.pollProps(obj)
              }}
              {...this.defaultObjProps(obj, index)}
              {...this.customObjProps()}
            /> : null
        })}
        {this.state.connect4s.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <Connect4
              defaultProps={{ ...this.defaultObjProps(obj, index) }}
              {...this.defaultObjProps(obj, index)}
              {...this.getInteractiveProps(obj.id)}
              {...this.customObjProps()}
            /> : null
        })}
        {this.state.tics.map((obj, index) => {
          return this.objectIsOnStage(obj) === stage ?
            <TicTacToe
              defaultProps={{ ...this.defaultObjProps(obj, index) }}
              {...this.defaultObjProps(obj, index)}
              {...this.getInteractiveProps(obj.id)}
              {...this.customObjProps()}
            /> : null
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

        <TransformerComponent {...this.transformerProps(stage)} />
        <Rect fill="rgba(0,0,0,0.5)" ref={`${stage}SelectionRect`} />
      </>
    );
  }

  render() {
    return (
      <React.Fragment>
        {/* The Top Bar */}
        <Level
          saveGame={this.handleSave}
          number={this.state.numberOfPages}
          pages={this.state.pages}
          level={this.handleLevel}
          handlePageTitle={this.handlePageTitle}
          handlePageNum={this.handleNumOfPagesChange}
          numOfPages={this.state.numberOfPages}
        />

        {/* The edit text area that appears when double clicking a Text object */}
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
          onKeyDown={(e) => this.updateText(e)}
          onBlur={() => this.updateText()}
          style={this.state.textareaInlineStyle}
        />

        {/* ---- GROUP CANVAS ---- */}
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
                objectLabels={this.savedObjects}
                deleteLabels={this.deletionCounts}
                drawLine={this.drawLine}
                stopDrawing={this.stopDrawing}
                handleImage={this.handleImage}
                handleVideo={this.handleVideo}
                handleAudio={this.handleAudio}
                handleDocument={this.handleDocument}
                choosecolor={this.chooseColor}
                close={() => this.setState({ groupAreaContextMenuVisible: false })}
              />
            )}
          <Stage
            height={document.getElementById("editMainContainer") ?
              document.getElementById("editMainContainer").clientHeight : 0}
            width={document.getElementById("editMainContainer") ?
              document.getElementById("editMainContainer").clientWidth : 0}
            ref="graphicStage"
            onMouseMove={(e) => this.handleMouseOver(e, false)}
            onMouseDown={(e) => this.onMouseDown(e, false)}
            onMouseUp={(e) => this.handleMouseUp(e, false)}
            onWheel={(e) => this.handleWheel(e, false)}
            onContextMenu={(e) => e.evt.preventDefault()}
          >
            <Layer
              ref="groupAreaLayer"
              name="group"
              scaleX={this.state.groupLayerScale}
              scaleY={this.state.groupLayerScale}
              x={this.state.groupLayerX}
              y={this.state.groupLayerY}
              height={window.innerHeight}
              width={window.innerWidth}
              draggable={this.state.layerDraggable}
              onDragMove={(e) => this.dragLayer(e, false)}
            >
              {this.loadObjects("group")}
            </Layer>
          </Stage>
        </div>

        {/* ---- PERSONAL CANVAS ---- */}
        <div
          id={"editPersonalContainer"}
          className={"info" + this.state.personalAreaOpen}
        >
          <div
            id="personalMainContainer"
            name="pasteContainer"
            tabIndex="0"
            className="personalAreaStageContainer"
            onKeyDown={this.contextMenuEventShortcuts}
            onKeyUp={this.keyUp}
          >
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
                  objectLabels={this.savedObjects}
                  deleteLabels={this.deletionCounts}
                  drawLine={this.drawLine}
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
              style={{ position: "relative", overflow: "hidden" }}
              height={document.getElementById("editPersonalContainer") ?
                document.getElementById("editPersonalContainer").clientHeight : 0}
              width={document.getElementById("editPersonalContainer") ?
                document.getElementById("editPersonalContainer").clientWidth : 0}
              ref="personalAreaStage"
              onMouseMove={(e) => this.handleMouseOver(e, true)}
              onMouseDown={(e) => this.onMouseDown(e, true)}
              onMouseUp={(e) => this.handleMouseUp(e, true)}
              onWheel={(e) => this.handleWheel(e, true)}
              onContextMenu={(e) => e.evt.preventDefault()}
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
                draggable={this.state.layerDraggable}
                onDragMove={(e) => this.dragLayer(e, true)}
              >
                {this.state.selectedContextMenu && this.state.selectedContextMenu.type === "ObjectMenu" && (
                  <Portal>
                    <ContextMenu
                      {...this.state.selectedContextMenu}
                      selectedShapeName={this.state.selectedShapeName}
                      getObj={this.getKonvaObj}
                      selectedFont={this.state.selectedFont}
                      handleUngrouping={this.handleUngrouping}
                      handleGrouping={this.handleGrouping}
                      handleStrokeColor={this.handleStrokeColor}
                      handleFillColor={this.handleFillColor}
                      handleWidth={this.handleWidth}
                      handleOpacity={this.handleOpacity}
                      handleFont={this.handleFont}
                      handleSize={this.handleSize}
                      close={this.handleCloseContextMenu}
                      copy={this.handleCopy}
                      cut={this.handleCut}
                      paste={this.handlePaste}
                      delete={this.handleDelete}
                      setJson={this.setPollJson}
                    />
                  </Portal>
                )}
                {this.loadObjects("personal")}
              </Layer>
            </Stage>
          </div>

          {/* The Personal Area Open / Close Caret */}
          {(this.state.personalAreaOpen !== 1)
            ? <button className="editPersonalAreaToggle" onClick={() => this.handlePersonalAreaOpen(true)}>
              <i className="fas fa-caret-square-up fa-3x" />
            </button>
            : <button className="editPersonalAreaToggle" onClick={() => this.handlePersonalAreaOpen(false)}>
              <i className="fas fa-caret-square-down fa-3x" />
            </button>
          }

          {/* The Role Picker */}
          <div id="rolesdrop">
            <DropdownRoles
              openInfoSection={() => this.setState(() => this.handlePersonalAreaOpen(true))}
              roleLevel={this.handleRoleLevel}
              gameid={this.state.gameinstanceid}
              handleCopyRole={this.handleCopyRole}
              handleEditRole={this.handleEditRole}
              editMode={true}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Graphics;
