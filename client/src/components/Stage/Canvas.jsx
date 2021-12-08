import React, { Component } from 'react';
import fileDownload from 'js-file-download';
import axios from 'axios';
import Level from "../Level/Level";
import Portal from "./Shapes/Portal";
import Info from "../Information/InformationPopup";
import DrawModal from "../DrawModal/DrawModal";
import Overlay from "./Overlay";

// Dropdowns
import DropdownRoles from "../Dropdown/DropdownRoles";
import DropdownAddObjects from "../Dropdown/DropdownAddObjects";
import ContextMenu from "../ContextMenu/ContextMenu";
import DropdownOverlay from "../Dropdown/DropdownOverlay";

// Standard Konva Components
import Konva from "konva";
import {
  Stage,
  Layer
} from "react-konva";

import "./Stage.css";

let history = [];
let historyStep = 0;

class Graphics extends Component {

  // Save State
  // These are the names of the objects in state that are saved to the database
  customObjects = [
    ...this.props.customObjects
  ];
  customDeletes = [
    ...this.props.customDeletes
  ];
  savedObjects = [
    // Rendered Objects Only (shapes, media, etc.)
    ...this.props.savedObjects
  ];
  deletionCounts = [
    // Delete Counts (stored to keep object label #s in sync)
    // Must be in the same order as savedObjects
    ...this.props.allDeletes
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

    this.setState = this.setState.bind(this);

    let objectState = {};
    let objectDeleteState = {};
    for (let i = 0; i < this.props.savedObjects.length; i++) {
      objectState = {
        ...objectState,
        [this.props.savedObjects[i]]: []
      }
      objectDeleteState = {
        ...objectDeleteState,
        [`${this.props.savedObjects[i]}DeleteCount`]: 0
      }
    }

    let defaultPagesTemp = new Array(6);
    defaultPagesTemp.fill({
      primaryColor: "#8f001a",
      groupColor: "#FFF",
      personalColor: "#FFF",
      overlayColor: "#FFF",
      overlays: []
    });
    const defaultPages = defaultPagesTemp.map((page, index) => {
      return {
        ...page,
        name: "Page " + (index + 1)
      };
    });

    this.state = {
      // Objects and Delete Counts
      ...objectState,
      ...objectDeleteState,

      arrows: [],   // Arrows are used for transformations
      guides: [],   // These are the lines used for snapping

      // Right click menus
      groupAreaContextMenuVisible: false,
      groupAreaContextMenuX: 0,
      groupAreaContextMenuY: 0,
      personalAreaContextMenuVisible: false,
      personalAreaContextMenuX: 0,
      personalAreaContextMenuY: 0,
      overlayAreaContextMenuVisible: false,
      overlayAreaContextMenuX: 0,
      overlayAreaContextMenuY: 0,

      // An array of arrays containing grouped items
      savedGroups: [],

      // Transformer for custom objects
      // This manually gets updated to simulate a normal Konva transformer
      customRect: [
        {
          visible: true,
          x: 0,
          y: 0,
          id: "customRect",
          name: "customRect",
          ref: "customRect",
          opacity: 0
        }
      ],

      // Page Controls
      pages: defaultPages,
      numberOfPages: 6,
      level: 1, // Current page
      overlayOpen: false,
      overlayOptionsOpen: -1,
      overlayOpenIndex: -1,

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
      textareaInlineStyle: {
        display: "none"
      },
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
      tool: 'pen', // eraser or pen
      isDrawing: false,
      drawMode: false,
      color: "black",
      drawStrokeWidth: 5,

      // Variables for calculating responsive sizing 
      // (for different screen sizes)
      groupLayerX: 0,
      groupLayerY: 0,
      groupLayerScale: 1,
      personalLayerX: 0,
      personalLayerY: 0,
      personalLayerScale: 1,
      overlayLayerX: 0,
      overlayLayerY: 0,
      overlayLayerScale: 1,
      layerDraggable: false,

      // Fill and Stroke
      colorf: "black",
      colors: "black",
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

      // This is used to time the touch click on mobile devices to see if it was a right click
      touchTime: null,
      touchEvent: null,

      gamepieceStatus: {},

      lineTransformDragging: false,

      connectors: [],
      gameroles: [],
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
      savedStateLoaded: false,

      canvasLoading: false
    };

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

        if (this.props.setTasks) {
          this.props.setTasks(objects.tasks || {});
        }

        // Put parsed saved data into state
        this.savedState.forEach((object, index, arr) => {
          this.setState({
            [object]: objects[object] || []
          }, () => {
            if (index === arr.length - 1) {
              // This is the last loop so all saved data has been loaded
              this.setState({
                savedStateLoaded: true
              });
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
              }, () => {
                // Calculate positions on initial load
                if (!doNotRecalculateBounds) {
                  this.setState({
                    canvasLoading: true
                  }, () => {
                    this.props.setCanvasLoading(this.state.canvasLoading);
                    setTimeout(() => this.props.reCenter("edit"), 1000);
                  });
                }
              });

              for (let j = 0; j < this.customObjects.length; j++) {
                const type = this.customObjects[j];
                for (let i = 0; i < this.state[type].length; i++) {
                  const state = this.state[type][i];
                  this.setCustomGroupPos(state, "groupAreaLayer");
                  this.setCustomGroupPos(state, "personalAreaLayer");
                  this.setCustomGroupPos(state, "overlayAreaLayer");
                }
              }
            }
          });
        });
      } else {
        this.setState({
          savedStateLoaded: true
        });
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
    if (!this.refs[layer]) return;
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

  removeJSGIFS = () => {
    // Remove all jsGif elements created by gifs on screen
    const jsgifs = document.getElementsByClassName("jsgif");
    while (jsgifs.length > 0) {
      jsgifs[0].parentNode.removeChild(jsgifs[0]);
    }
  }

  saveInterval = null;
  drawInterval = null;
  componentDidMount = async () => {
    const MINUTE_MS = 1000 * 60;

    this.removeJSGIFS();

    // Auto save the canvas every minute
    this.saveInterval = setInterval(() => {
      this.handleSave();
      this.props.showAlert("Simulation Autosaved", "info");
    }, MINUTE_MS);

    // Redraw the canvas every 1 second
    this.drawInterval = setInterval(() => {
      if (this.state.savedStateLoaded) {
        const stageType = this.state.overlayOpen ? "overlayStage" :
          (this.personalAreaOpen ? "personalStage" : "groupStage");
        this.refs[stageType].draw();
      }
    }, 1000);

    // Reposition / scale objects on screen resize
    let resizeTimeout;
    window.onresize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.props.reCenter("edit");
      }, 100);
    };

    history.push(this.state);

    this.props.setPerformanceFunctions({
      setPollData: this.setPollData
    });
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
    if (this.state.savedStateLoaded) {
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

      // Delete temp image once image has loaded in
      if (
        prevState.images.length < this.state.images.length &&
        this.state.videos[this.state.videos.length - 1].temporary
      ) {
        let newVideos = [...this.state.videos];
        newVideos[this.state.videos.length - 1] = null
        newVideos = newVideos.filter(n => n);
        this.setState({
          videos: newVideos
        });
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

      if (prevState.canvasLoading !== this.state.canvasLoading) {
        this.props.setCanvasLoading(this.state.canvasLoading);
      }

      // This passes info all the way up to the App component so that it can be used in functions
      // shared between Canvas (Simulation Edit Mode) and CanvasGame (Simulation Play Mode)
      if (prevState !== this.state) {
        this.props.setGameEditProps({
          setState: this.setState,
          state: this.state,
          refs: this.refs,

          // These are functions used for manipulating objects that are directly used in object props
          customRect: el => { this.refs.customRect = el },
          onObjectClick: this.onObjectClick,
          onObjectTransformStart: this.onObjectTransformStart,
          onObjectDragMove: this.onObjectDragMove,
          onObjectContextMenu: this.onObjectContextMenu,
          onObjectTransformEnd: this.onObjectTransformEnd,
          handleDragEnd: this.handleDragEnd,
          handleTextTransform: this.handleTextTransform,
          handleTextDblClick: this.handleTextDblClick,
          onDragEndArrow: this.onDragEndArrow,
          handleMouseUp: this.handleMouseUp,
          handleMouseOver: this.handleMouseOver,
          objectSnapping: this.objectSnapping,
          onMouseDown: this.onMouseDown,
          getKonvaObj: this.getKonvaObj,
          getObjType: this.getObjType,
          getInteractiveProps: this.getInteractiveProps
        });

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
            canvasLoading: true,
            selectedShapeName: "",
            groupSelection: []
          });
          setTimeout(() => this.props.reCenter("edit", layer), 300);
        }
      }

      document.querySelector(':root').style.setProperty('--primary', this.state.pages[this.state.level - 1].primaryColor);
      this.props.setPageColor(this.state.pages[this.state.level - 1].groupColor);
    }
  }

  handlePageTitle = (newPageTitles) => {
    this.setState({
      pages: newPageTitles
    });
  }

  handleNumOfPagesChange = (e) => {
    this.setState({
      numberOfPages: parseInt(e)
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
    storedObj.tasks = this.props.tasks;

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
        this.props.setGameEditProps(undefined);
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
      console.error(error);
    });
  }

  handleEditRole = async ({ id, roleName, roleNum }) => {
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
      console.error(error);
    });
  }

  onObjectContextMenu = e => {
    if (
      (this.state.selectedShapeName || this.state.groupSelection.length) &&
      this.state.selectedShapeName !== "pencils" &&
      !this.state.drawMode
    ) {
      const event = e.evt ? e.evt : e;
      event.preventDefault(true);

      let mouseX = 0;
      let mouseY = 0;
      if (event.changedTouches) {
        mouseX = event.changedTouches[0].clientX;
        mouseY = event.changedTouches[0].clientY;
      } else {
        mouseX = event.clientX;
        mouseY = event.clientY;
      }

      const mousePosition = {
        x: mouseX,
        y: mouseY
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

  }

  updateSelectionRect = (personalArea) => {
    let node = this.refs.groupSelectionRect;
    if (this.state.overlayOpen) {
      node = this.refs.overlaySelectionRect;
    } else if (personalArea) {
      node = this.refs.personalSelectionRect;
    }
    if (!node) return;
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

    if (event.targetTouches) {
      this.setState({
        touchTime: Date.now(),
        touchEvent: event
      });
    } else {
      this.setState({
        touchTime: null,
        touchEvent: null
      });
    }

    if (event.target.parentElement.className === "konvajs-content") {
      const customObjs = document.getElementsByClassName("customObj");
      for (let i = 0; i < customObjs.length; i++) {
        const id = customObjs[i].dataset.name;
        const customObj = this.getKonvaObj(id);
        const rect = customObjs[i].getBoundingClientRect();
        if (
          (event.x ? event.x : event.targetTouches[0].clientX) > rect.x &&
          (event.y ? event.y : event.targetTouches[0].clientY) > rect.y &&
          (event.x ? event.x : event.targetTouches[0].clientX) < rect.x + rect.width &&
          (event.y ? event.y : event.targetTouches[0].clientY) < rect.y + rect.height &&
          customObj
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
        x: (event.clientX ? event.clientX : event.targetTouches[0].clientX) - sidebarPx,
        y: (event.clientY ? event.clientY : event.targetTouches[0].clientY)
      }
    }

    let scale = this.state.groupLayerScale;
    let xOffset = -this.state.groupLayerX;
    let yOffset = -this.state.groupLayerY;
    if (this.state.overlayOpen) {
      scale = this.state.overlayLayerScale;
      xOffset = -this.state.overlayLayerX;
      yOffset = -this.state.overlayLayerY;
    } else if (personalArea) {
      scale = this.state.personalLayerScale;
      xOffset = -this.state.personalLayerX;
      yOffset = -this.state.personalLayerY;
    }

    if (this.state.drawMode === true) {
      this.setState({
        isDrawing: true
      });
      const tool = this.state.tool;
      this.setState({
        pencils: [...this.state.pencils, {
          tool,
          points: [(pos.x + xOffset) / scale, (pos.y + yOffset) / scale],
          level: this.state.level,
          color: this.state.color,
          id: "pencils",
          infolevel: personalArea,
          rolelevel: this.state.rolelevel,
          strokeWidth: this.state.drawStrokeWidth
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

      const layer = personalArea ? "personalAreaLayer" :
        (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
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

    if (this.state.lineTransformDragging) {
      this.setState({
        lineTransformDragging: false
      });
      document.body.style.cursor = "auto";
    }

    let layerX = event.layerX;
    let layerY = event.layerY;

    // Determine how long screen has been clicked (if on mobile)
    if (this.state.touchTime && this.state.touchEvent) {
      const elapsedTimeMS = Date.now() - this.state.touchTime;
      if (elapsedTimeMS > 500) {
        event.button = 2;
      } else {
        event.button = 0;
      }

      let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
      if (this.state.personalAreaOpen) {
        sidebarPx += 20;
      }
      const topbarPx = this.state.personalAreaOpen ? 80 : 0;
      layerX = event.changedTouches[0].clientX - sidebarPx;
      layerY = event.changedTouches[0].clientY - topbarPx;

      this.setState({
        touchTime: null,
        touchEvent: null
      });
    }

    if (this.state.drawMode === true) {
      this.setState({
        isDrawing: false
      });
    } else {
      if (!this.state.selection.visible && !event.changedTouches) {
        return;
      }

      const layer = this.state.overlayOpen ? "overlayAreaLayer" :
        (personalArea ? "personalAreaLayer" : "groupAreaLayer");
      const selectionRect = this.state.overlayOpen ? "overlaySelectionRect" :
        (personalArea ? "personalSelectionRect" : "groupSelectionRect");
      const pointerPos = this.refs[layer].getStage().getPointerPosition();
      let shape = null;
      let clickShapeGroup = null;
      if (pointerPos) {
        shape = this.refs[layer].getIntersection(pointerPos);
        clickShapeGroup = this.getShapeGroup(shape);
      }

      if (event.button === 0) {
        // LEFT CLICK
        const selBox = this.refs[selectionRect] ? this.refs[selectionRect].getClientRect() : null;
        if (!selBox) return;
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
        if (personalArea && !this.state.rolelevel) {
          this.props.showAlert("Cannot edit the personal area without a role selected. Please select a role to add objects.", "warning");
          return;
        }

        if (this.isShape(shape) && shape.attrs.id !== "pencils") {
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

              if (event.changedTouches) {
                this.onObjectContextMenu(event);
              }
            }
          }
        } else {
          // Right click on the canvas -> show the add object menu
          const areaClicked = personalArea ? "personal" : (this.state.overlayOpen ? "overlay" : "group");
          let type;
          let notVisible;
          let visible;
          let contextMenuX;
          let contextMenuY;
          if (areaClicked === "personal") {
            type = "PersonalAddMenu";
            notVisible = "groupAreaContextMenuVisible";
            visible = "personalAreaContextMenuVisible";
            contextMenuX = "personalAreaContextMenuX";
            contextMenuY = "personalAreaContextMenuY";
          } else if (areaClicked === "overlay") {
            type = "OverlayAddMenu";
            notVisible = "groupAreaContextMenuVisible";
            visible = "overlayAreaContextMenuVisible";
            contextMenuX = "overlayAreaContextMenuX";
            contextMenuY = "overlayAreaContextMenuY";
          } else {
            type = "GroupAddMenu";
            notVisible = "personalAreaContextMenuVisible";
            visible = "groupAreaContextMenuVisible";
            contextMenuX = "groupAreaContextMenuX";
            contextMenuY = "groupAreaContextMenuY";
          }
          let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
          if (sidebarPx > 0 && layer === this.refs.personalAreaLayer) {
            sidebarPx = 100;
          }
          const rel = this.refs[`${areaClicked}AreaLayer`].getRelativePointerPosition();
          this.setState({
            selectedContextMenu: {
              type: type,
              position: {
                x: layerX + sidebarPx,
                y: layerY,
                relX: rel.x,
                relY: rel.y
              }
            },
            [notVisible]: false,
            [visible]: true,
            [contextMenuX]: layerX + sidebarPx,
            [contextMenuY]: layerY,
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
    const transformer = this.state.personalAreaOpen ? "personalTransformer" :
      (this.state.overlayOpen ? "overlayTransformer" : "groupTransformer");
    if (this.refs[this.state.selectedShapeName]) {
      this.refs[transformer].nodes([this.getKonvaObj(this.state.selectedShapeName, true, false)]);
    } else if (type === "" && this.state.groupSelection.length) {
      this.refs[transformer].nodes(this.state.groupSelection.flat());
    } else if (this.refs[transformer]) {
      this.refs[transformer].nodes([]);
    }
  }

  handleMouseOver = (e, personalArea) => {
    const event = e.evt ? e.evt : e;

    let scale = this.state.groupLayerScale;
    let xOffset = -this.state.groupLayerX;
    let yOffset = -this.state.groupLayerY;
    if (this.state.overlayOpen) {
      scale = this.state.overlayLayerScale;
      xOffset = -this.state.overlayLayerX;
      yOffset = -this.state.overlayLayerY;
    } else if (personalArea) {
      scale = this.state.personalLayerScale;
      xOffset = -this.state.personalLayerX;
      yOffset = -this.state.personalLayerY;
    }

    // Get the current arrow ref and modify its position by filtering & pushing again
    if (this.state.drawMode === true) {
      if (!this.state.isDrawing || event.ctrlKey) {
        return;
      }

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      let lastLine = this.state.pencils[this.state.pencils.length - 1];
      // Add point
      lastLine.points = lastLine.points.concat([
        (point.x + xOffset) / scale,
        (point.y + yOffset) / scale
      ]);

      // Replace last
      this.state.pencils.splice(this.state.pencils.length - 1, 1, lastLine);
      this.setState({
        pencils: this.state.pencils.concat()
      });
    } else {
      if (!this.state.selection.visible && !this.state.layerDraggable) {
        return;
      }

      const stage = personalArea ? "personal" :
        (this.state.overlayOpen ? "overlay" : "group");
      const pos = this.refs[stage + "Stage"].getPointerPosition();
      const shape = this.refs[stage + "Stage"].getIntersection(pos);

      if (this.state.lineTransformDragging) {
        const newLines = [...this.state.lines].filter(line => line.id !== this.state.selectedShapeName);
        const newLine = [...this.state.lines].filter(line => line.id === this.state.selectedShapeName)[0];

        const xIndex = this.state.lineTransformDragging === "top" ? 0 : 2;
        const yIndex = this.state.lineTransformDragging === "top" ? 1 : 3;

        newLine.points[xIndex] = newLine.points[xIndex] + (event.movementX / this.state[`${stage}LayerScale`]);
        newLine.points[yIndex] = newLine.points[yIndex] + (event.movementY / this.state[`${stage}LayerScale`]);

        this.setState({
          lines: [...newLines, newLine]
        });

        return;
      }

      if (shape && shape.attrs.link) {
        document.body.style.cursor = "pointer";
      } else if (shape) {
        // Only have drag select on left click and drag
        if (event.buttons === 1 && !this.state.layerDraggable) {
          if (this.state.selection.isDraggingShape && this.state.selectedShapeName !== "pencils") {
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
    this.setState({
      guides: []
    });

    let shape = null;
    const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
      (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
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

    const stageType = this.state.overlayOpen ? "overlayStage" :
      (this.personalAreaOpen ? "personalStage" : "groupStage");
    this.refs[stageType].draw();
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
      const layerScale = personalArea ? "personalLayerScale" :
        (this.state.overlayOpen ? "overlayLayerScale" : "groupLayerScale");
      this.setState({
        [layerScale]: newScale
      });
    }
  }

  dragLayer = (e, personalArea) => {
    const type = personalArea ? "personal" :
      (this.state.overlayOpen ? "overlay" : "group");
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
          }, () => {
            const stageType = this.state.overlayOpen ? "overlayStage" :
              (this.personalAreaOpen ? "personalStage" : "groupStage");
            this.refs[stageType].draw();
          });
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

    if (this.state.drawMode) {
      this.setDrawMode(false);
    }

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
        const stageType = this.state.overlayOpen ? "overlayStage" :
          (this.personalAreaOpen ? "personalStage" : "groupStage");
        this.refs[stageType].draw();
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
    this.props.handleLevel(e);
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
  handleTextDblClick = (text, layer) => {
    if (text) {
      // Adjust location based on info or main
      let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
      if (sidebarPx > 0 && layer === this.refs.personalAreaLayer) {
        sidebarPx = 100;
      } else if (sidebarPx > 0 && layer === this.refs.overlayLayer) {
        sidebarPx = 100;
      }
      let topPx = 0;
      if (layer === this.refs.personalAreaLayer) {
        topPx = 70;
      } else if (layer === this.refs.overlayLayer) {
        topPx = 30;
      }
      const scaleVal = layer === this.refs.personalAreaLayer ?
        this.state.personalLayerScale :
        (this.state.overlayOpen ? this.state.overlayLayerScale : this.state.groupLayerScale);

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

  setDrawMode = (drawing) => {
    this.setState({
      drawMode: drawing,
      color: drawing ? this.state.color : "black",
      tool: drawing ? this.state.tool : "pen",
      drawStrokeWidth: drawing ? this.state.drawStrokeWidth : 5
    }, () => {
      if (!this.state.drawMode) {
        this.props.showAlert("Draw mode deactivated", "info");
      } else {
        this.props.showAlert("Draw mode activated", "info");
      }
    });
  }

  setDrawStrokeWidth = (newWidth) => {
    this.setState({
      drawStrokeWidth: newWidth
    });
  }

  setDrawTool = (newTool) => {
    this.setState({
      tool: newTool
    });
  }

  chooseColor = (e) => {
    this.setState({
      color: e.hex
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
      const mainContainer = document.getElementById("editMainContainer");
      mainContainer.classList.remove("grabCursor");
      if (this.state.drawMode) {
        mainContainer.classList.add("noCursor");
      }
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
      this.props.reCenter("edit");
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
      const mainContainer = document.getElementById("editMainContainer");
      mainContainer.classList.remove("noCursor");
      mainContainer.classList.add("grabCursor");
      this.setState({
        layerDraggable: true
      });
    } else if (event.altKey && event.keyCode === r) {
      // Print Info (FOR DEBUGGING)
      console.log("Refs:");
      console.log({ ...this.refs });
      console.log("State:");
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

  getSelectedObj = () => {
    if (this.state.selectedShapeName) {
      for (let name of this.savedObjects) {
        if (this.state.selectedShapeName.startsWith(name)) {
          return this.state[name].filter(({ id }) => id === this.state.selectedShapeName)[0]
        }
      }
    }
  }
  updateSelectedObj = (newState) => {
    let type;
    if (this.state.selectedShapeName) {
      for (let name of this.savedObjects) {
        if (this.state.selectedShapeName.startsWith(name)) {
          type = name;
        }
      }
    } else return;
    if (!type) return;
    this.setState(prevState => ({
      [type]: prevState[type].map(obj =>
        obj.id === this.state.selectedShapeName
          ? {
            ...obj,
            ...newState
          }
          : obj
      )
    }));
    // there's a timeout here since placing this func in the
    // setState callback lags the transformer behind a little
    setTimeout(() => this.handleObjectSelection(), 20)
  }

  // For Konva Objects: 
  // returns Konva object
  // For Custom Objects:
  // returns the Konva Group associated with the KonvaHtml of the object
  getKonvaObj = (id, updateState, showTransformer) => {
    if (id && id !== "pencils") {
      if (this.refs[id].attrs) {
        return this.refs[id];
      } else {
        const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
          (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
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
                  currentId: id,
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

  getNearestGuide = (obj, stage) => {
    const stageRef = this.refs[`${stage}Stage`];
    const layerX = this.state[`${stage}LayerX`];
    const layerY = this.state[`${stage}LayerY`];
    const layerScale = this.state[`${stage}LayerScale`];

    const objBox = obj.getClientRect();
    const guides = stageRef.find('.guide');

    let pos = {
      x: null,
      y: null,
      type: null
    };
    for (let i = 0; i < guides.length; i++) {
      const g = guides[i];
      const gBox = g.getClientRect();
      const padding = 5;

      const collision = this.collide(objBox, gBox, padding);
      if (!collision) continue;
      const top = this.collide(objBox, gBox, padding, "top");
      const bottom = this.collide(objBox, gBox, padding, "bottom");
      const left = this.collide(objBox, gBox, padding, "left");
      const right = this.collide(objBox, gBox, padding, "right");
      let type = "";

      if (g.attrs.points[0] === g.attrs.points[2]) {
        // Vertical
        if (left) type = type + " left";
        if (right) type = type + " right";
        pos = {
          ...pos,
          x: (g.attrs.points[0] * layerScale) + layerX + (g.attrs.pos === "center" ?
            (left ? -objBox.width / 2 : objBox.width / 2) : 0),
          type: pos.type + type,
          pos: g.attrs.pos
        }
      } else {
        // Horizontal
        if (top) type = type + " top";
        if (bottom) type = type + " bottom";
        pos = {
          ...pos,
          y: (g.attrs.points[1] * layerScale) + layerY + (g.attrs.pos === "center" ?
            (top ? -objBox.height / 2 : objBox.height / 2) : 0),
          type: pos.type + type,
          pos: g.attrs.pos
        }
      }
    }
    return pos;
  }

  objectSnapping = (obj, e) => {
    if (e && e.evt.shiftKey) {
      const objStage = obj.attrs ? obj.attrs : obj;
      const stage = objStage.overlay ? "overlay" : (objStage.infolevel ? "personal" : "group");
      const objRef = obj.attrs ? obj : this.refs[obj.id];
      this.getLineGuideStops(stage, objRef);

      const pos = objRef.absolutePosition();
      const snaps = this.getNearestGuide(objRef, stage);
      const rect = objRef.getClientRect();
      const ctrOrigin = obj.attrs ? false : ["ellipses", "triangles", "stars"].includes(this.getObjType(obj.id));
      if (snaps.type) {
        objRef.absolutePosition({
          x: snaps.x ? snaps.x + (snaps.type.includes("right") ? -rect.width : 0) +
            (ctrOrigin ? rect.width / 2 : 0) : pos.x,
          y: snaps.y ? snaps.y + (snaps.type.includes("bottom") ? -rect.height : 0) +
            (ctrOrigin ? rect.height / 2 : 0) : pos.y
        });
      }
    } else {
      this.setState({
        guides: []
      });
    }
  }

  onObjectDragMove = (obj, e) => {
    this.objectSnapping(obj, e);
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

  // Snapping functionality based on:
  // https://konvajs.org/docs/sandbox/Objects_Snapping.html

  collide = (rect1, rect2, padding, part) => {
    let rect1Top = rect1.y;
    let rect1Bottom = rect1.y + rect1.height;
    let rect1Left = rect1.x;
    let rect1Right = rect1.x + rect1.width;
    if (part === "top") {
      rect1Bottom = rect1Bottom - (rect1.height / 2);
    } else if (part === "bottom") {
      rect1Top = rect1Top + (rect1.height / 2);
    } else if (part === "left") {
      rect1Right = rect1Right - (rect1.width / 2);
    } else if (part === "right") {
      rect1Left = rect1Left + (rect1.width / 2);
    }

    const rect2Top = rect2.y - padding;
    const rect2Bottom = rect2.y + rect2.height + padding;
    const rect2Left = rect2.x - padding;
    const rect2Right = rect2.x + rect2.width + padding;

    return !(
      rect1Top > rect2Bottom ||
      rect1Right < rect2Left ||
      rect1Bottom < rect2Top ||
      rect1Left > rect2Right
    );
  }

  // Where can we snap our objects?
  getLineGuideStops = (stage, skipShape) => {
    // The guide lines
    let vertical = [];
    let horizontal = [];

    const stageRef = this.refs[`${stage}Stage`];
    const layerX = this.state[`${stage}LayerX`];
    const layerY = this.state[`${stage}LayerY`];
    const layerScale = this.state[`${stage}LayerScale`];

    const compBox = skipShape.getClientRect();
    let foundGuideItem = false;
    stageRef.find('.shape, .customObj').forEach((guideItem) => {
      if (foundGuideItem) return;
      if (guideItem === skipShape || 
        (guideItem.attrs.currentId && guideItem.attrs.currentId === skipShape.attrs.id)) return;

      // Check if shape is close by
      if (guideItem.attrs.name === "customObj") this.getKonvaObj(guideItem.attrs.id, true);
      const box = guideItem.getClientRect();
      const padding = 100;
      if (this.collide(compBox, box, padding)) {
        const x = (box.x - layerX) / layerScale;
        const width = box.width / layerScale;

        const y = (box.y - layerY) / layerScale;
        const height = box.height / layerScale;

        // Get snap points at edges and center of each object
        vertical.push([x, x + width, x + width / 2]);
        horizontal.push([y, y + height, y + height / 2]);

        foundGuideItem = true;
      }
    });

    this.getKonvaObj(skipShape.attrs.id, true);

    vertical = vertical.flat();
    horizontal = horizontal.flat();

    const l = Math.max(window.innerWidth, window.innerHeight) / layerScale;
    const guidesV = [];
    for (let i = 0; i < vertical.length; i++) {
      const x = vertical[i];
      const r = (i % 3) - 2;
      const y = horizontal[i - r];
      guidesV.push({
        points: [x, -l + y, x, l + y],
        pos: i % 3 === 2 ? "center" : "edge"
      });
    }
    const guidesH = [];
    for (let i = 0; i < horizontal.length; i++) {
      const r = (i % 3) - 2;
      const x = vertical[i - r];
      const y = horizontal[i];
      guidesH.push({
        points: [-l + x, y, l + x, y],
        pos: i % 3 === 2 ? "center" : "edge"
      });
    }

    this.setState({
      guides: [...guidesV, ...guidesH]
    });

    return {
      vertical: vertical,
      horizontal: horizontal,
    };
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

  setPollData = (type, data, id) => {
    this.setState(prevState => ({
      polls: prevState.polls.map(poll =>
        poll.id === id
          ? {
            ...poll,
            [type]: data
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
      const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
        (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
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
    const node = this.refs[this.state.currentTextRef];
    if (!e) {
      this.setState({
        textEditVisible: false,
        shouldTextUpdate: true,
        textareaInlineStyle: {
          ...this.state.textareaInlineStyle,
          display: "none"
        }
      });
      node.show();
    }
  }

  setOverlayOpen = (val, index) => {
    this.setState({
      overlayOpen: val,
      overlayOpenIndex: index
    });
  }

  changeObjectPage = (initIndex, newIndex) => {
    for (let i = 0; i < this.savedObjects.length; i++) {
      const type = this.savedObjects[i];
      const objs = this.state[type];
      for (let j = 0; j < objs.length; j++) {
        const obj = objs[j];
        if (obj.level === initIndex + 1) {
          const newObj = {
            ...obj,
            level: newIndex + 1
          }

          // Delete objects on this level
          const newObjs = [...objs];
          newObjs.splice(j, 1);
          this.setState({
            [type]: newObjs
          }, () => {
            // Relocate objects to new level
            if (newIndex !== -1) {
              this.setState({
                [type]: [...this.state[type], newObj]
              });
            }
          });
        }
      }
    }
  }

  handleCopyPage = (index) => {
    // Copy all objects from chosen level to new level
    for (let i = 0; i < this.savedObjects.length; i++) {
      const type = this.savedObjects[i];
      const objs = this.state[type];
      for (let j = 0; j < objs.length; j++) {
        const obj = objs[j];
        if (obj.level === index + 1) {
          const objectsState = this.state[type];
          const objectsDeletedState = this.state[`${type}DeleteCount`];
          const numOfObj = objectsState.length + (objectsDeletedState ? objectsDeletedState.length : 0) + 1;
          const id = type + numOfObj;
          const newObj = {
            ...obj,
            id: id,
            ref: id,
            name: id,
            level: this.state.pages.length + 1
          }
          this.setState({
            [type]: [...objs, newObj]
          });
        }
      }
    }
  }

  render() {
    if (!this.state.savedStateLoaded) return null;
    return (
      <React.Fragment>
        {/* The Top Bar */}
        <Level
          refreshCanvas={() => {
            // Refresh canvas
            const layer = this.state.personalAreaOpen ? "personal" :
              (this.state.overlayOpen ? "overlay" : "group");
            this.setState({
              canvasLoading: true
            });
            setTimeout(() => this.props.reCenter("edit", layer), 0);
          }}
          changeObjectPage={this.changeObjectPage}
          handleCopyPage={this.handleCopyPage}
          number={this.state.numberOfPages}
          clearCanvasData={() => this.props.setGameEditProps(undefined)}
          removeJSGIFS={() => this.removeJSGIFS()}
          saveGame={this.handleSave}
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
            }, () => {
              // Get the current textNode we are editing, get the name from there
              // Match name with elements in this.state.texts,
              const node = this.refs[this.state.currentTextRef];
              const name = node.attrs.id;

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
                  this.setState({
                    textareaInlineStyle: {
                      ...this.state.textareaInlineStyle,
                      height: `${node.textHeight * (node.textArr.length + 2)}px`
                    }
                  });

                  const stageType = this.state.overlayOpen ? "overlayStage" :
                    (this.personalAreaOpen ? "personalStage" : "groupStage");
                  this.refs[stageType].findOne(".transformer").show();
                  this.refs[stageType].draw();
                }
              );
            });
          }}
          onKeyDown={(e) => this.updateText(e)}
          onBlur={() => this.updateText()}
          style={this.state.textareaInlineStyle}
        />

        {/* The button to edit the overlay (only visible if overlay is active on the current page) */}
        {this.state.pages[this.state.level - 1] && (
          <>
            {this.state.pages[this.state.level - 1].overlays.map((overlay, i) => {
              return (
                <div
                  key={i}
                  className="overlayButton"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    this.setState({
                      overlayOptionsOpen: i
                    });
                  }}
                  style={{
                    top: `${70 * (i + 1)}px`
                  }}
                  onClick={() => this.setOverlayOpen(true, overlay.id)}
                >
                  <i className="icons fa fa-window-restore" />
                </div>
              );
            })}
          </>
        )}

        {this.state.overlayOptionsOpen !== -1 && (
          <DropdownOverlay
            close={() => this.setState({ overlayOptionsOpen: -1 })}
            changePages={this.handlePageTitle}
            overlayIndex={this.state.overlayOptionsOpen}
            pages={this.state.pages}
            level={this.state.level}
          />
        )}

        {/* ---- OVERLAY CANVAS ---- */}
        {this.state.overlayOpen && (
          <>
            {/* The right click menu for the overlay area */}
            {this.state.overlayAreaContextMenuVisible
              && this.state.selectedContextMenu
              && this.state.selectedContextMenu.type === "OverlayAddMenu" && (
                <>
                  <DropdownAddObjects
                    title={"Edit Overlay Space"}
                    xPos={this.state.overlayAreaContextMenuX}
                    yPos={this.state.overlayAreaContextMenuY}
                    state={this.state}
                    layer={this.refs.groupAreaLayer}
                    objectLabels={this.savedObjects}
                    deleteLabels={this.deletionCounts}
                    setState={(obj) => this.setState(obj)}
                    setDrawMode={this.setDrawMode}
                    handleImage={this.handleImage}
                    handleVideo={this.handleVideo}
                    handleAudio={this.handleAudio}
                    handleDocument={this.handleDocument}
                    choosecolor={this.chooseColor}
                    close={() => this.setState({ overlayAreaContextMenuVisible: false })}
                  />
                </>
              )}
            <Overlay
              playMode={false}
              closeOverlay={() => this.setOverlayOpen(false, -1)}
              state={this.state}
              propsIn={this.props}
              onMouseDown={this.onMouseDown}
              onMouseUp={this.handleMouseUp}
              onMouseMove={this.handleMouseOver}
              onWheel={this.handleWheel}
              onDragMove={this.dragLayer}
              onKeyDown={this.contextMenuEventShortcuts}
              onKeyUp={this.keyUp}
              setRefs={(type, ref) => {
                this.refs[type] = ref;
              }}
            />
          </>
        )}

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
                objectLabels={this.savedObjects}
                deleteLabels={this.deletionCounts}
                setState={(obj) => this.setState(obj)}
                setDrawMode={this.setDrawMode}
                handleImage={this.handleImage}
                handleVideo={this.handleVideo}
                handleAudio={this.handleAudio}
                handleDocument={this.handleDocument}
                choosecolor={this.chooseColor}
                close={() => this.setState({ groupAreaContextMenuVisible: false })}
              />
            )}
          {this.state.drawMode && (
            <>
              <div className='cursor' id="cursor" />
              <DrawModal
                xPos={this.state.personalAreaOpen ?
                  this.state.personalAreaContextMenuX : this.state.groupAreaContextMenuX}
                yPos={this.state.personalAreaOpen ?
                  this.state.personalAreaContextMenuY : this.state.groupAreaContextMenuY}
                scale={this.state.personalAreaOpen ?
                  this.state.personalLayerScale : this.state.groupLayerScale}
                chooseColor={this.chooseColor}
                setDrawMode={this.setDrawMode}
                setDrawStrokeWidth={this.setDrawStrokeWidth}
                setDrawTool={this.setDrawTool}
              />
            </>
          )}
          <Stage
            height={document.getElementById("editMainContainer") ?
              document.getElementById("editMainContainer").clientHeight : 0}
            width={document.getElementById("editMainContainer") ?
              document.getElementById("editMainContainer").clientWidth : 0}
            ref="groupStage"
            onMouseDown={(e) => this.onMouseDown(e, false)}
            onMouseUp={(e) => this.handleMouseUp(e, false)}
            onMouseMove={(e) => this.handleMouseOver(e, false)}
            onWheel={(e) => this.handleWheel(e, false)}
            onContextMenu={(e) => e.evt.preventDefault()}
            // Mobile Event Listeners
            onTouchStart={(e) => this.onMouseDown(e, false)}
            onTouchEnd={(e) => this.handleMouseUp(e, false)}
          >
            <Layer
              ref="groupAreaLayer"
              scaleX={this.state.groupLayerScale}
              scaleY={this.state.groupLayerScale}
              x={this.state.groupLayerX}
              y={this.state.groupLayerY}
              height={window.innerHeight}
              width={window.innerWidth}
              draggable={this.state.layerDraggable}
              onDragMove={(e) => this.dragLayer(e, false)}
            >
              {!this.state.personalAreaOpen && !this.state.overlayOpen && (
                <>
                  {this.props.loadObjects("group", "edit")}
                </>
              )}
            </Layer>
          </Stage>
        </div>

        {/* ---- PERSONAL CANVAS ---- */}
        <div
          id={"editPersonalContainer"}
          style={{
            backgroundColor: this.state.personalAreaOpen ? this.state.pages[this.state.level - 1].personalColor : "transparent"
          }}
          className={"info" + this.state.personalAreaOpen + " personalAreaAnimOn"}
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
                  objectLabels={this.savedObjects}
                  deleteLabels={this.deletionCounts}
                  setState={(obj) => this.setState(obj)}
                  setDrawMode={this.setDrawMode}
                  handleImage={this.handleImage}
                  handleVideo={this.handleVideo}
                  handleAudio={this.handleAudio}
                  handleDocument={this.handleDocument}
                  choosecolor={this.chooseColor}
                  close={() => this.setState({ personalAreaContextMenuVisible: false })}
                />
              )}
            {this.state.selectedContextMenu && this.state.selectedContextMenu.type === "ObjectMenu" && (
              <Portal>
                <ContextMenu
                  {...this.state.selectedContextMenu}
                  selectedShapeName={this.state.selectedShapeName}
                  getObj={this.getKonvaObj}
                  getObjState={this.getSelectedObj}
                  updateObjState={this.updateSelectedObj}
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
                  setPollData={this.setPollData}
                />
              </Portal>
            )}
            <Stage
              style={{ position: "relative", overflow: "hidden" }}
              height={document.getElementById("editPersonalContainer") ?
                document.getElementById("editPersonalContainer").clientHeight : 0}
              width={document.getElementById("editPersonalContainer") ?
                document.getElementById("editPersonalContainer").clientWidth : 0}
              ref="personalStage"
              onMouseMove={(e) => this.handleMouseOver(e, true)}
              onMouseDown={(e) => this.onMouseDown(e, true)}
              onMouseUp={(e) => this.handleMouseUp(e, true)}
              onWheel={(e) => this.handleWheel(e, true)}
              onContextMenu={(e) => e.evt.preventDefault()}
              // Mobile Event Listeners
              onTouchStart={(e) => this.onMouseDown(e, true)}
              onTouchEnd={(e) => this.handleMouseUp(e, true)}
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
                {this.state.personalAreaOpen === 1 && !this.state.overlayOpen && (
                  <>
                    {this.props.loadObjects("personal", "edit")}
                  </>
                )}
              </Layer>
            </Stage>
          </div>

          {/* The Personal Area Open / Close Caret */}
          {(this.state.personalAreaOpen !== 1)
            ? <button
              className="personalAreaToggle"
              onClick={() => {
                document.getElementById("editPersonalContainer").classList.add("personalAreaAnimOn");
                this.handlePersonalAreaOpen(true);
                setTimeout(() => {
                  document.getElementById("editPersonalContainer").classList.remove("personalAreaAnimOn");
                }, 500);
              }}>
              <i className="fas fa-angle-up fa-3x" />
            </button>
            : <button
              className="personalAreaToggle"
              onClick={() => {
                document.getElementById("editPersonalContainer").classList.add("personalAreaAnimOn");
                this.handlePersonalAreaOpen(false);
              }}>
              <i className="fas fa-angle-down fa-3x" />
            </button>
          }

          {/* The Role Picker */}
          <div id="rolesdrop">
            <DropdownRoles
              refreshPersonalCanvas={() => {
                this.setState({
                  canvasLoading: true,
                  selectedShapeName: "",
                  groupSelection: []
                });
                setTimeout(() => this.props.reCenter("edit", "personal"), 0);
              }}
              personalAreaOpen={this.state.personalAreaOpen}
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
