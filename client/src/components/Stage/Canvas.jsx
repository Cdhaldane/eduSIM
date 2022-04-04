import React, { Component } from 'react';
import fileDownload from 'js-file-download';
import axios from 'axios';
import Level from "../Level/Level";
import Portal from "./Shapes/Portal";
import DrawModal from "../DrawModal/DrawModal";
import Overlay from "./Overlay";
import { withTranslation } from "react-i18next";
import { Image } from "cloudinary-react";

// Dropdowns
import DropdownRoles from "../Dropdown/DropdownRoles";
import DropdownAddObjects from "../Dropdown/DropdownAddObjects";
import ContextMenu from "../ContextMenu/ContextMenu";
import DropdownOverlay from "../Dropdown/DropdownOverlay";

// Standard Konva Components
import Konva from "konva";
import {
  Stage,
  Layer,
  Rect
} from "react-konva";

import "./Stage.css";
import "./Info.css";

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
    "overlayImage",

    // Pages
    "pages",
    "numberOfPages",

    "status",
  ];

  // This is the boundary of the scene (for the play mode)
  positionRect = {
    x: 0,
    y: 0,
    w: 1920,
    h: 1080,
    scaleX: 1,
    scaleY: 1
  };

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
      groupPositionRect: this.positionRect,
      personalPositionRect: this.positionRect,
      overlayColor: "#FFF",
      overlays: [],
      groupLayers: [],
      personalLayers: []
    });
    const defaultPages = defaultPagesTemp.map((page, index) => {
      return {
        ...page,
        name: this.props.t("admin.pageX", { page: (index + 1) })
      };
    });

    this.state = {
      // Objects and Delete Counts
      ...objectState,
      ...objectDeleteState,

      customRenderRequested: false,

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
          x: 0,
          y: 0
        }
      ],

      // Page Controls
      pages: defaultPages,
      numberOfPages: 6,
      level: 1, // Current page
      overlayOpen: false,
      overlayOptionsOpen: -1,
      overlayOpenIndex: -1,
      overlayImage: -1,

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
      docsrc: "https://res.cloudinary.com/uottawaedusim/image/upload/v1643788961/pdfs/xzgxf449ecdymapdaukb.pdf",
      docimage: "",

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
      movingCanvas: false,

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
            const savedGroupData = JSON.parse(objects.savedGroups[i][j]);
            savedGroup.push(savedGroupData);
          }
          parsedSavedGroups.push(savedGroup);
        }
        objects.savedGroups = parsedSavedGroups;

        if (this.props.setTasks) {
          this.props.setTasks(objects.tasks || {});
        }
        if (this.props.setVars) {
          this.props.setVars(objects.variables || {});
        }
        if (this.props.setNotes) {
          this.props.setNotes(objects.notes || {});
        }

        // Put parsed saved data into state
        this.savedState.forEach((object, index, arr) => {
          // Add backwards compatability for the new centering system
          if (object === "pages") {
            for (let i = 0; i < objects[object].length; i++) {
              const page = objects[object][i];
              const overlays = page.overlays;
              if (!page.groupPositionRect) {
                page.groupPositionRect = this.positionRect;
              }
              if (!page.personalPositionRect) {
                page.personalPositionRect = this.positionRect;
              }
              for (let j = 0; j < overlays.length; j++) {
                const overlay = overlays[j];
                if (!overlay.positionRect) {
                  overlay.positionRect = this.positionRect;
                }
              }
            }
          }
          this.setState({
            [object]: objects[object],
            savedStateLoaded: true
          }, () => {
            if (index === arr.length - 1) {
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
                if (this.state[type] === undefined) {
                  this.setState({
                    [type]: []
                  });
                  continue;
                }
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
          canvasLoading: false,
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
    const groups = this.refs[`${layer}.objects`].find('Group');
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
      this.props.showAlert(this.props.t("alert.simAutosave"), "info");
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
      setCustomObjData: this.setCustomObjData
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
          onDocClick: this.onDocClick,
          handleMouseUp: this.handleMouseUp,
          handleMouseOver: this.handleMouseOver,
          objectSnapping: this.objectSnapping,
          onMouseDown: this.onMouseDown,
          getKonvaObj: this.getKonvaObj,
          getObjType: this.getObjType,
          setCustomObjData: this.setCustomObjData,
          getInteractiveProps: this.getInteractiveProps,
          getVariableProps: () => { },
          getDragProps: () => { },
          dragLayer: this.dragLayer,
          getLayers: this.getLayers
        });

        // Recenter if the canvas has changed
        // This includes opening/closing personal and overlay areas and changing levels
        if (
          this.state.personalAreaOpen !== prevState.personalAreaOpen ||
          this.state.overlayOpen !== prevState.overlayOpen ||
          this.state.level !== prevState.level
        ) {
          this.refs.customRectCanvas.add(this.refs.customRect);
          const layer = this.state.personalAreaOpen ? "personal" :
            (this.state.overlayOpen ? "overlay" : "group");
          this.setState({
            canvasLoading: true,
            selectedShapeName: "",
            groupSelection: [],
            customRenderRequested: true
          });
          setTimeout(() => this.props.reCenter("edit", layer), 300);
        }
      }

      const changeList = Object.keys(this.state).filter(key => this.state[key] !== prevState[key]);
      if (changeList.some(change => {
        return change.includes("LayerX") || change.includes("LayerY") || change.includes("LayerScale")
      }) && !this.state.movingCanvas) {
        this.setState({
          movingCanvas: true
        });
      } else if (this.state.movingCanvas) {
        this.setState({
          movingCanvas: false
        });
      }

      let pageDownNum = 1;
      if (this.state.level > this.state.pages.length) {
        this.setState({
          level: this.state.level - 1
        });
        pageDownNum++;
      }
      document.querySelector(':root').style.setProperty('--primary', this.state.pages[this.state.level - pageDownNum].primaryColor);
      this.props.setPageColor(this.state.pages[this.state.level - pageDownNum].groupColor);
    }
  }

  handlePageTitle = (newPageTitles, pageCopied) => {
    this.setState({
      pages: newPageTitles
    }, () => {
      if (pageCopied !== undefined && pageCopied !== -1) {
        this.handleCopyPage(pageCopied);
      }
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
    storedObj.variables = this.props.variables;
    storedObj.notes = this.props.notes;
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
    this.props.setGameEditProps(undefined);
    await this.handleSave();
    return axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/copy', {
      gameroleid
    }).then((res) => {
      const objects = JSON.parse(res.data.gameinstance.game_parameters);
      const newIds = res.data.newIds;

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
      this.savedState.forEach((object, idx, array) => {
        this.setState({
          [object]: objects[object]
        }, () => {
          if (idx === array.length - 1) {
            this.setLayers([...this.getLayers(), ...newIds]);
          }
        });
      });

      return res.data.gamerole;
    }).catch(error => {
      console.error(error);
    });
  }

  handleEditRole = async ({ id, roleName, roleNum, roleDesc }) => {
    await this.handleSave();
    return axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/update', {
      id: id,
      name: roleName,
      numspots: roleNum,
      roleDesc: roleDesc,
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

  // Return the ID of top most object at a given position on screen
  // With some basic object info
  // If no object is found return null
  getTopObjAtPos = (pos) => {
    // pos should be in the form of {x: #, y: #}
    // where x and y are relative to the client (not the stage)
    const layer = this.state.overlayOpen ? "overlayAreaLayer" :
      (this.state.personalAreaOpen ? "personalAreaLayer" : "groupAreaLayer");
    let stageElem = null;
    if (layer === "overlayAreaLayer") {
      stageElem = document.getElementById("overlayGameContainer").querySelector(".konvajs-content");
    } else if (layer === "personalAreaLayer") {
      stageElem = document.getElementById("personalMainContainer").querySelector(".konvajs-content");
    } else {
      stageElem = document.getElementById("editMainContainer").querySelector(".konvajs-content");
    }
    const stageBox = stageElem.getBoundingClientRect();
    // This is the position relative to the stage (whereas pos is relative to the whole screen)
    const relPos = {
      x: pos.x - stageBox.x,
      y: pos.y - stageBox.y
    };
    const layerIds = this.getLayers();

    // First check Konva component intersections
    let shape = this.refs[`${layer}.objects`].getIntersection(relPos);
    if (shape?.attrs?.id === "customRect") {
      // Only run this if a customRect gets in the way but the object is in the back
      // because it is very inefficient
      shape = this.refs[`${layer}.objects`].getAllIntersections(relPos).filter(obj => {
        return obj?.attrs?.id !== "customRect" && obj?.attrs?.id !== "ContainerRect";
      }).pop();
    }
    if (shape && (shape.attrs.id === "ContainerRect" || shape.attrs.id === undefined)) {
      shape = null;
    }

    // Now check if a custom component is on top
    const customObjs = Array.from(document.getElementsByClassName("customObj")).reverse();
    for (let i = 0; i < customObjs.length; i++) {
      const obj = customObjs[i];
      const id = obj.dataset.name;
      const objType = this.getObjType(id);
      const objState = this.state[objType].filter(obj => obj.id === id)[0];
      const objBox = obj.getBoundingClientRect();
      if (layerIds.includes(id)) {
        if (
          pos.x > objBox.x && pos.x < objBox.x + objBox.width &&
          pos.y > objBox.y && pos.y < objBox.y + objBox.height &&
          (!shape || objState.onTop)
        ) {
          shape = objState;
          break;
        }
      } else {
        console.error("ERROR: Custom object not in current layers being rendered.");
      }
    }

    if (shape?.attrs?.id) {
      return {
        id: shape.attrs.id,
        custom: false
      };
    } else if (shape?.id) {
      return {
        id: shape.id,
        custom: true
      };
    } else {
      return null;
    }
  }

  onMouseDown = (e, personalArea) => {
    const event = e.evt ? e.evt : e;
    const shape = this.getTopObjAtPos({
      x: event.clientX,
      y: event.clientY
    });

    if (!event.ctrlKey) {
      this.setState({
        layerDraggable: false
      });
    }
    let fixX = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
    let fixY = 0;
    if (this.state.personalAreaOpen) {
      fixX = window.matchMedia("(orientation: portrait)").matches ? 30 : 100;
      fixY = window.matchMedia("(orientation: portrait)").matches ? 110 : 60;
    }
    if (this.state.overlayOpen) {
      fixX = window.matchMedia("(orientation: portrait)").matches ? 30 : 100;
      fixY = 30;
    }
    let pos = null;
    if (event.layerX) {
      pos = {
        x: event.clientX - fixX,
        y: event.clientY - fixY
      };
    } else {
      let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 70;
      if (sidebarPx > 0 && personalArea) {
        sidebarPx = 100;
      }
      pos = {
        x: (event.clientX ? event.clientX :
          (event.targetTouches ? event.targetTouches[0].clientX : this.state.mouseX)) - sidebarPx,
        y: (event.clientY ? event.clientY :
          (event.targetTouches ? event.targetTouches[0].clientY : this.state.mouseY))
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
      const newPencil = {
        tool,
        points: [(pos.x + xOffset) / scale, (pos.y + yOffset) / scale],
        level: this.state.level,
        color: this.state.color,
        id: `pencils${this.state.pencils.length}`,
        infolevel: personalArea,
        rolelevel: this.state.rolelevel,
        strokeWidth: this.state.drawStrokeWidth,
      };
      this.setState({
        pencils: [...this.state.pencils, newPencil]
      });
      this.setLayers([...this.getLayers(), newPencil.id]);
    } else {
      if (e.evt) {
        const isElement = e.target.findAncestor(".elements-container");
        const isTransformer = e.target.findAncestor("Transformer");
        if (isElement || isTransformer) {
          return;
        }
      }
      this.setState({
        selection: {
          isDraggingShape: shape ? shape.id : null,
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

  // Get list of object ids that are layers on the current canvas
  getLayers = () => {
    const page = this.state.pages[this.state.level - 1];
    if (this.state.overlayOpen) {
      const overlay = page.overlays.filter(overlay => overlay.id === this.state.overlayOpenIndex)[0];
      return overlay.layers;
    } else if (this.state.personalAreaOpen) {
      return page.personalLayers;
    } else {
      return page.groupLayers;
    }
  }

  setLayers = (newLayers) => {
    const page = { ...this.state.pages[this.state.level - 1] };
    if (this.state.overlayOpen) {
      let i = 0;
      const overlay = page.overlays.filter((overlay, index) => {
        if (overlay.id === this.state.overlayOpenIndex) {
          i = index;
          return true;
        } else {
          return false;
        }
      })[0];
      overlay.layers = newLayers;
      page.overlays[i] = overlay;
    } else if (this.state.personalAreaOpen) {
      page.personalLayers = newLayers;
    } else {
      page.groupLayers = newLayers;
    }
    const newPages = [...this.state.pages];
    newPages[this.state.level - 1] = page;
    this.setState({
      pages: newPages
    });
  }

  handleMouseUp = (e, personalArea) => {
    const event = e.evt ? e.evt : e;

    const shape = this.getTopObjAtPos({
      x: event.clientX,
      y: event.clientY
    });

    if (this.state.lineTransformDragging) {
      this.setState({
        lineTransformDragging: false
      });
      document.body.style.cursor = "auto";
    }

    let layerX = event.clientX - 60;
    let layerY = event.clientY;

    if (this.state.personalAreaOpen) {
      layerX = event.clientX - 135;
      layerY = event.clientY - 65;
    }

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
      if (
        !this.state.selection.visible &&
        !event.changedTouches &&
        !this.props.customObjects.includes(this.getObjType(this.state.selectedShapeName))
      ) {
        return;
      }

      if (shape?.custom) {
        this.setState({
          selectedShapeName: shape.id,
          groupSelection: [],
          selection: {
            ...this.state.selection,
            isDraggingShape: "customObj",
            visible: false
          }
        }, () => {
          this.handleObjectSelection();
          this.updateSelectionRect(personalArea);
        });
        return;
      }

      const clickShapeGroup = shape && !shape.custom ? this.getShapeGroup(this.refs[shape.id]) : null;

      if (event.button === 0) {
        // LEFT CLICK
        const layer = this.state.overlayOpen ? "overlayAreaLayer" :
          (this.state.personalAreaOpen ? "personalAreaLayer" : "groupAreaLayer");
        const selectionRect = this.state.overlayOpen ? "overlaySelectionRect" :
          (personalArea ? "personalSelectionRect" : "groupSelectionRect");
        const selBox = this.refs[selectionRect] ? this.refs[selectionRect].getClientRect() : null;
        if (!selBox) return;
        if (selBox.width > 1 && selBox.height > 1) {
          // This only runs if there has been a rectangle selection (click and drag selection)
          const elements = [];
          this.refs[`${layer}.objects`].find(".shape").forEach((elementNode) => {
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
          if (shape) {
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
                  if (obj.attrs.id === shape.id) {
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

              if (this.state.selectedShapeName !== shape.id || this.state.groupSelection.length) {
                if (!alreadySelectedCurrent) {
                  // ADD SELECTION
                  const newSelection = [...this.state.groupSelection];
                  if (
                    !alreadySelectedPrev &&
                    this.state.selectedShapeName !== shape.id &&
                    this.state.selectedShapeName &&
                    !this.customObjects.includes(this.getObjType(this.state.selectedShapeName))
                  ) {
                    // A shape is already selected in selectedShapeName but not in groupSelection
                    // Add it to groupSelection (unless it is a custom object since those cause
                    // cyclic object value errors when parsing the JSON)
                    newSelection.push(this.refs[this.state.selectedShapeName]);
                  }
                  if (newSelection.length === 0) {
                    // Shift select with nothing else selected so set it as the selection
                    if (!clickShapeGroup) {
                      this.setState({
                        selectedShapeName: this.checkName(shape.id),
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
                        groupSelection: [...newSelection, this.refs[shape.id]]
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
                      return obj.attrs.id !== shape.id;
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
                this.setState({
                  selectedShapeName: this.checkName(shape.id),
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
          this.props.showAlert(this.props.t("alert.personalEditAttemptNoRole"), "warning");
          return;
        }

        if (shape && shape.id !== "pencils") {
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
                this.state.groupSelection[i].attrs.id === shape.id
              ) {
                shapeIsInGroupSelection = true;
                break;
              }
            }

            if (!shapeIsInGroupSelection) {
              this.setState({
                selectedShapeName: this.checkName(shape.id),
                groupSelection: []
              }, this.handleObjectSelection);

              if (event.changedTouches) {
                this.onObjectContextMenu(event);
              }
            }
          }
        } else {
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
          if (sidebarPx > 0 && !this.state.overlayOpen && this.state.personalAreaOpen) {
            sidebarPx = 100;
          }

          const rel = this.refs[`${areaClicked}AreaLayer.objects`].getRelativePointerPosition();
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

  simulateMouseEvent = (el, event) => {
    if (window.MouseEvent && typeof window.MouseEvent === 'function') {
      event = new MouseEvent(event);
    } else {
      event = document.createEvent('MouseEvent');
      event.initMouseEvent(event);
    }

    el.dispatchEvent(event);
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
        console.log([...this.state.lines].filter(line => line.id === this.state.selectedShapeName))
        console.log(newLines)
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
              let shapeId = "";
              if (this.state.selection.isDraggingShape === "customObj") {
                const customObjs = Array.from(document.getElementsByClassName("customObj"));
                customObjs.reverse();
                for (let i = 0; i < customObjs.length; i++) {
                  const bounds = customObjs[i].getBoundingClientRect();
                  const id = customObjs[i].dataset.name;
                  const onTop = this.state[this.getObjType(id)].filter(obj => obj.id === id)[0].onTop;
                  if (
                    (!this.state.selection.isDraggingShape || this.state.selection.isDraggingShape === "customObj") &&
                    !(shape && !onTop) &&
                    pos.x > bounds.left && pos.x < bounds.right &&
                    pos.y > bounds.top && pos.y < bounds.bottom
                  ) {
                    shapeId = customObjs[i].dataset.name;
                    break;
                  }
                }
              } else {
                shapeId = shape.id();
              }
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
    let shape = null;
    const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
      (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
    if (this.customObjects.includes(objectsName)) {
      const customObjs = this.refs[`${layer}.objects`].find('Group');
      for (let i = 0; i < customObjs.length; i++) {
        const id = customObjs[i].attrs.id;
        if (id === ref) {
          shape = customObjs[i];
        }
      }
    } else {
      shape = this.refs[ref];
    }
    if (!this.customObjects.includes(objectsName)) {
      shape.moveTo(this.refs[`${layer}.objects`]);
      // Add one to zIndex go over ContainerRect
      shape.setZIndex(this.getLayers().indexOf(ref) + 1);
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

    this.setState({
      selectedShapeName: ref,
      groupSelection: [],
      guides: []
    }, this.handleObjectSelection);

    const stageType = this.state.overlayOpen ? "overlayStage" :
      (this.personalAreaOpen ? "personalStage" : "groupStage");
    this.refs[stageType].draw();

  }

  handleWheel = (e, personalArea) => {
    e.evt.preventDefault();

    const scaleBy = 1.2;
    const stage = this.state.overlayOpen ? "overlay" : (personalArea ? "personal" : "group");
    const layer = this.refs[`${stage}AreaLayer.objects`];

    const oldScale = layer.scaleX();
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const s = layer.getStage();
    const pointer = s.getPointerPosition();
    const mousePos = {
      x: (pointer.x - this.state[`${stage}LayerX`]) / oldScale,
      y: (pointer.y - this.state[`${stage}LayerY`]) / oldScale,
    }
    const maxZoom = 250;
    const newPos = {
      x: pointer.x - mousePos.x * Math.min(newScale, maxZoom),
      y: pointer.y - mousePos.y * Math.min(newScale, maxZoom),
    };

    layer.scale({
      x: Math.min(newScale, maxZoom),
      y: Math.min(newScale, maxZoom)
    });
    const layerScale = `${stage}LayerScale`;
    if (newScale > maxZoom) {
      this.props.showAlert(this.props.t("alert.maxZoomReached"), "info");
    }
    this.setState({
      [layerScale]: Math.min(newScale, maxZoom),
      [`${stage}LayerX`]: newPos.x,
      [`${stage}LayerY`]: newPos.y,
    });
  }

  dragLayer = (e) => {
    const type = this.state.overlayOpen ? "overlay" :
      (this.state.personalAreaOpen ? "personal" : "group");
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
    const name = this.state.selectedShapeName;
    const state = this.state[this.getObjType(name)];
    const toCopy = name ?
      [state ? state.filter(obj => obj.id === name)[0] : null] : this.state.groupSelection;
    if (toCopy) {
      this.setState({
        copied: toCopy,
        selectedContextMenu: null
      });
    }
  }

  getStateObjectById = (obj) => {
    if (obj.attrs) {
      const id = obj.attrs.id;
      const type = this.getObjType(id);
      const item = this.state[type].filter((obj) => {
        return obj.id === id;
      });
      if (item.length) {
        return item[0];
      } else {
        if (obj) {
          return obj.attrs;
        } else {
          return null;
        }
      }
    } else {
      if (obj) return obj;
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
          const stateObj = this.getStateObjectById(copiedItem[j]);
          stateGroup.push(stateObj);
        }
        stateItems.push(stateGroup);
      } else {
        // Single item
        const stateObj = this.getStateObjectById(copiedItem);
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
            y: newY,
            overlay: this.state.overlayOpen,
            overlayIndex: this.state.overlayOpenIndex ? this.state.overlayOpenIndex : -1,
            infolevel: this.state.overlayOpen ? false : (this.state.personalAreaOpen ? true : false),
            rolelevel: this.state.rolelevel,
            level: this.state.level
          }
          objects.push(newObject);

          // Add to layers
          const page = this.state.pages[this.state.level - 1];
          let layers = [];
          if (this.state.overlayOpen) {
            const i = 0;
            const overlay = page.overlays.filter((o, i) => {
              if (o.id === this.state.overlayOpenIndex) {
                i = i;
                return true;
              } else {
                return false;
              }
            })[0];
            layers = overlay.layers;
            layers.push(newId);
            page.overlays[i].layers = layers;
          } else if (this.state.personalAreaOpen) {
            layers = page.personalLayers;
            layers.push(newId);
            page.personalLayers = layers;
          } else {
            layers = page.groupLayers;
            layers.push(newId);
            page.groupLayers = layers;
          }
          const newPages = [...this.state.pages];
          newPages[this.state.level - 1] = page;
          this.setState({
            pages: newPages
          });

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

    // Remove from layers
    const layers = [...this.getLayers()];
    const delIds = toDelete.map(obj => obj.attrs ? obj.attrs.id : obj.dataset.name);
    const newLayers = layers.filter(layer => !delIds.includes(layer));
    this.setLayers(newLayers);

    // Get a list of the affected types
    let affectedTypes = [];
    for (let i = 0; i < toDelete.length; i++) {
      if (!toDelete[i].attrs) {
        this.refs.customRectCanvas.add(this.refs.customRect);
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
        this.handleSave();
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
      if (sidebarPx > 0 && layer === this.refs[`personalAreaLayer.objects`]) {
        sidebarPx = 100;
      } else if (sidebarPx > 0 && layer === this.refs[`overlayAreaLayer.objects`]) {
        sidebarPx = 100;
      }
      let topPx = 0;
      if (layer === this.refs[`personalAreaLayer.objects`]) {
        topPx = 50;
      } else if (layer === this.refs[`overlayAreaLayer.objects`]) {
        topPx = 30;
      }
      const scaleVal = layer === this.refs[`personalAreaLayer.objects`] ?
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
  getOverlayState = (index) => {
    return this.state.pages[this.state.level - 1].overlays[index];
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
      const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
        (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
      const groups = this.refs[`${layer}.objects`].find('Group');
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        group.moveToBottom();
        if (group.attrs.id === id) {
          if (updateState) {
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
              }]
            });

            const sizeRect = this.refs.customRect;
            sizeRect.attrs.currentId = id;
            sizeRect.attrs.width = width * (1 + paddingPercent);
            sizeRect.attrs.height = height * (1 + paddingPercent);
            group.add(sizeRect);
            group.moveToTop();

            if (showTransformer) {
              this.setState({
                selectedShapeName: id
              }, this.handleObjectSelection);
            }
          }
          return group;
        }
      }
      if (this.refs[id].attrs) {
        return this.refs[id];
      }
      return null;
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
    if (this.customObjects.includes(this.getObjType(obj.id))) {
      // Don't run this for custom objects
      return;
    }
    const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
      (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
    this.refs[obj.id].moveTo(this.refs[`${layer}.dragging`]);

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

  setCustomObjData = (customObj, type, data, id) => {
    this.setState(prevState => ({
      [customObj]: prevState[customObj].map(obj =>
        obj.id === id
          ? {
            ...obj,
            [type]: data
          }
          : obj
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
    this.setState({
      isTransforming: true
    });
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
      const customObjs = this.refs[`${layer}.objects`].find('Group');
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
    this.refs.customRectCanvas.add(this.refs.customRect);
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
    const groupLayers = Array(this.state.pages[this.state.level - 1].groupLayers.length);
    const personalLayers = Array(this.state.pages[this.state.level - 1].personalLayers.length);
    const overlayLayers = [];
    let toBeSaved = {};
    for (let i = 0; i < this.savedObjects.length; i++) {
      toBeSaved = {
        ...toBeSaved,
        [this.savedObjects[i]]: []
      }
    }
    for (let i = 0; i < this.savedObjects.length; i++) {
      const type = this.savedObjects[i];
      const objs = this.state[type];
      for (let j = 0; j < objs.length; j++) {
        const obj = objs[j];
        if (obj.level === index + 1) {
          const objectsState = this.state[type];
          const objectsDeletedState = this.state[`${type}DeleteCount`];
          const numOfObj = objectsState.length + (objectsDeletedState ? parseInt(objectsDeletedState) : 0) + toBeSaved[type].length + 1;
          const id = type + numOfObj;
          if (obj?.overlayIndex && obj.overlayIndex !== -1) {
            const inListIndex = overlayLayers.findIndex((layer => layer.id === obj.overlayIndex));
            const pageOverlays = this.state.pages[obj.level - 1].overlays;
            const currLayers = pageOverlays[pageOverlays.map(overlay => overlay.id).indexOf(obj.overlayIndex)].layers;
            if (inListIndex !== -1) {
              const layersArr = [...overlayLayers[inListIndex].layers];
              layersArr[currLayers.indexOf(obj.id)] = id;
              const newLayers = {
                id: overlayLayers[inListIndex].id,
                layers: layersArr
              }
              overlayLayers[inListIndex] = newLayers;
            } else {
              const layersArr = Array(currLayers.length);
              layersArr[currLayers.indexOf(obj.id)] = id;
              overlayLayers.push({
                id: obj.overlayIndex,
                layers: layersArr
              });
            }
          } else if (obj.infolevel) {
            personalLayers[this.state.pages[obj.level - 1].personalLayers.indexOf(obj.id)] = id;
          } else {
            groupLayers[this.state.pages[obj.level - 1].groupLayers.indexOf(obj.id)] = id;
          }
          const newObj = {
            ...obj,
            id: id,
            ref: id,
            name: id,
            level: this.state.pages.length
          }
          toBeSaved[type].push(newObj);
        }
      }
    }
    for (let i = 0; i < this.savedObjects.length; i++) {
      const type = this.savedObjects[i];
      this.setState({
        [type]: [...this.state[type], ...toBeSaved[type]]
      });
    }
    const newPages = [...this.state.pages];
    const newPage = { ...this.state.pages[this.state.pages.length - 1] };
    newPage.groupLayers = groupLayers;
    newPage.personalLayers = personalLayers;
    const overlays = [...newPage.overlays];
    for (let i = 0; i < overlayLayers.length; i++) {
      const overlayLayer = overlayLayers[i];
      const overlayIndex = overlays.map(overlay => overlay.id).indexOf(overlayLayer.id);
      const overlay = { ...overlays[overlayIndex] };
      overlay.layers = overlayLayer.layers;
      overlays[overlayIndex] = overlay;
    }
    newPage.overlays = overlays;
    newPages[this.state.pages.length - 1] = newPage;
    this.setState({
      pages: newPages
    });
  }

  layerUp = (id) => {
    const isCustom = this.customObjects.includes(this.getObjType(id));
    if (isCustom) {
      this.setState(prevState => ({
        [this.getObjType(id)]: prevState[this.getObjType(id)].map(obj =>
          obj.id === this.state.selectedShapeName
            ? {
              ...obj,
              onTop: true
            }
            : obj
        )
      }));
      this.setState({
        customRenderRequested: true
      });
    } else {
      const newLayers = [...this.getLayers()];
      const i = newLayers.indexOf(id);
      if (i < newLayers.length - 1) {
        const obj = newLayers[i];
        const next = newLayers[i + 1];
        newLayers[i + 1] = obj;
        newLayers[i] = next;
      }
      this.setLayers(newLayers);
    }
  }

  layerDown = (id) => {
    const isCustom = this.customObjects.includes(this.getObjType(id));
    if (isCustom) {
      this.setState(prevState => ({
        [this.getObjType(id)]: prevState[this.getObjType(id)].map(obj =>
          obj.id === this.state.selectedShapeName
            ? {
              ...obj,
              onTop: false
            }
            : obj
        )
      }));
      this.setState({
        customRenderRequested: true
      });
    } else {
      const newLayers = [...this.getLayers()];
      const i = newLayers.indexOf(id);
      if (i > 0) {
        const obj = newLayers[i];
        const prev = newLayers[i - 1];
        newLayers[i - 1] = obj;
        newLayers[i] = prev;
      }
      this.setLayers(newLayers);
    }
  }

  handleOverlayIcon = (img) => {
    this.setState({
      overlayImage: img
    })
    this.setState(prevState => ({
      ...prevState.savedState,
      [this.state.overlayImage]: img
    }))
  }

  render() {
    if (!this.state.savedStateLoaded) return null;
    return (
      <React.Fragment>
        {/* The Top Bar */}
        <Level
          positionRect={this.positionRect}
          refreshCanvas={() => {
            // Refresh canvas
            const layer = this.state.personalAreaOpen ? "personal" :
              (this.state.overlayOpen ? "overlay" : "group");
            this.setState({
              canvasLoading: true
            });
            setTimeout(() => this.props.reCenter("edit", layer), 0);
          }}
          updateObjState={this.updateSelectedObj}
          getObjState={this.getSelectedObj}
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
                  const stage = this.state.overlayOpen ? "overlay" : (this.state.personalAreaOpen ? "personal" : "group");
                  const scale = this.state[`${stage}LayerScale`];
                  this.setState({
                    textareaInlineStyle: {
                      ...this.state.textareaInlineStyle,
                      height: node.textHeight * (node.textArr.length + 1) * scale
                    }
                  });

                  const stageType = this.state.overlayOpen ? "overlayStage" :
                    (this.state.personalAreaOpen ? "personalStage" : "groupStage");
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
                    if (this.state.personalAreaOpen) return;
                    e.preventDefault();
                    this.setState({
                      overlayOptionsOpen: i
                    });
                  }}
                  style={{
                    top: window.matchMedia("(orientation: portrait)").matches ? 100 : `${70 * (i + 1)}px`
                  }}
                  onClick={() => {
                    if (this.state.personalAreaOpen) return;
                    this.setOverlayOpen(true, overlay.id);
                  }}
                >
                  {!this.state.overlayImage.length ? (
                    <i className="icons lni lni-credit-cards" />
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
            })}
          </>
        )}

        {this.state.overlayOptionsOpen !== -1 && (
          <DropdownOverlay
            close={() => this.setState({ overlayOptionsOpen: -1 })}
            changePages={this.handlePageTitle}
            overlayIndex={this.state.overlayOptionsOpen}
            pages={this.state.pages}
            getOverlayState={this.getOverlayState}
            level={this.state.level}
            updateObjState={this.updateSelectedObj}
            handleOverlayIcon={this.handleOverlayIcon}
          />
        )}

        {/* ---- CUSTOM RECT CANVAS ---- */}
        {<Stage
          id="customRectCanvas"
          style={{ display: "none" }}
          width={10}
          height={10}
        >
          <Layer ref="customRectCanvas">
            <Rect
              id={"customRect"}
              name={"customRect"}
              ref={"customRect"}
              draggable={false}
              visible={true}
              opacity={0}
              currentId={this.state.customRect[0].currentId}
              width={this.state.customRect[0].width || 0}
              height={this.state.customRect[0].height || 0}
              x={this.state.customRect[0].x || 0}
              y={this.state.customRect[0].y || 0}
              onClick={() => this.onObjectClick(this.state.customRect[0])}
              onTransformStart={this.onObjectTransformStart}
              onTransformEnd={() => this.onObjectTransformEnd(this.state.customRect[0])}
              onDragMove={(e) => this.onObjectDragMove(this.state.customRect[0], e)}
              onDragEnd={(e) => this.handleDragEnd(e, this.getObjType(this.state.customRect[0].id), this.state.customRect[0].ref)}
              onContextMenu={this.onObjectContextMenu}
            />
          </Layer>
        </Stage>}

        {/* ---- OVERLAY CANVAS ---- */}
        {this.state.overlayOpen && (
          <>
            {/* The right click menu for the overlay area */}
            {this.state.overlayAreaContextMenuVisible
              && this.state.selectedContextMenu
              && this.state.selectedContextMenu.type === "OverlayAddMenu" && (
                <>
                  <DropdownAddObjects
                    title={this.props.t("edit.editOverlaySpace")}
                    type="overlay"
                    xPos={this.state.overlayAreaContextMenuX}
                    yPos={this.state.overlayAreaContextMenuY}
                    state={this.state}
                    layer={this.refs['overlayAreaLayer.objects']}
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
                    customObjects={this.customObjects}
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
                title={this.props.t("edit.editGroupSpace")}
                type="group"
                xPos={this.state.groupAreaContextMenuX}
                yPos={this.state.groupAreaContextMenuY}
                state={this.state}
                layer={this.refs[`groupAreaLayer.objects`]}
                objectLabels={this.savedObjects}
                deleteLabels={this.deletionCounts}
                setState={(obj) => this.setState(obj)}
                setDrawMode={this.setDrawMode}
                handleImage={this.handleImage}
                handleVideo={this.handleVideo}
                handleAudio={this.handleAudio}
                handleDocument={this.handleDocument}
                choosecolor={this.chooseColor}
                customObjects={this.customObjects}
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
            height={window.innerHeight}
            width={window.innerWidth}
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
            {!this.state.personalAreaOpen && !this.state.overlayOpen && (
              <>
                {this.props.loadObjects("group", "edit", this.state.movingCanvas)}
              </>
            )}
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
                  title={this.props.t("edit.editPersonalSpace")}
                  type="personal"
                  xPos={this.state.personalAreaContextMenuX}
                  yPos={this.state.personalAreaContextMenuY}
                  state={this.state}
                  layer={this.refs['personalAreaLayer.objects']}
                  objectLabels={this.savedObjects}
                  deleteLabels={this.deletionCounts}
                  setState={(obj) => this.setState(obj)}
                  setDrawMode={this.setDrawMode}
                  handleImage={this.handleImage}
                  handleVideo={this.handleVideo}
                  handleAudio={this.handleAudio}
                  handleDocument={this.handleDocument}
                  choosecolor={this.chooseColor}
                  customObjects={this.customObjects}
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
                  handleLevel={this.handleLevel}
                  delete={this.handleDelete}
                  onDocClick={this.onDocClick}
                  setCustomObjData={this.setCustomObjData}
                  layerUp={this.layerUp}
                  layerDown={this.layerDown}
                  layers={this.getLayers()}
                  customCount={() => {
                    const layers = this.getLayers();
                    let count = 0;
                    for (let i = 0; i < layers.length; i++) {
                      if (this.customObjects.includes(this.getObjType(layers[i]))) {
                        count++;
                      }
                    }
                    return count;
                  }}
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
              {this.state.personalAreaOpen === 1 && !this.state.overlayOpen && (
                <>
                  {this.props.loadObjects("personal", "edit", this.state.movingCanvas)}
                </>
              )}
            </Stage>
          </div>

          {/* The Personal Area Open / Close Caret */}
          {(this.state.personalAreaOpen !== 1)
            ? <button
              className="personalAreaToggle"
              onClick={() => {
                this.refs.customRectCanvas.add(this.refs.customRect);
                document.getElementById("editPersonalContainer").classList.add("personalAreaAnimOn");
                this.handlePersonalAreaOpen(true);
                setTimeout(() => {
                  document.getElementById("editPersonalContainer").classList.remove("personalAreaAnimOn");
                }, 500);
              }}>
              <i className="lni lni-chevron-up" />
            </button>
            : <button
              className="personalAreaToggle"
              onClick={() => {
                this.refs.customRectCanvas.add(this.refs.customRect);
                document.getElementById("editPersonalContainer").classList.add("personalAreaAnimOn");
                this.handlePersonalAreaOpen(false);
              }}>

              <i className="lni lni-chevron-down"></i>

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
              openInfoSection={() => {
                this.refs.customRectCanvas.add(this.refs.customRect);
                this.setState(() => this.handlePersonalAreaOpen(true));
              }}
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

export default withTranslation()(Graphics);
