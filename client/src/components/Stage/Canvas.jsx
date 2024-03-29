import React, { Component } from 'react';
import fileDownload from 'js-file-download';
import axios from 'axios';
import Level from "../Level/Level";
import Portal from "./Shapes/Portal";
import DrawModal from "../DrawModal/DrawModal";
import Overlay from "./Overlay";
import { withTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import { flushSync } from 'react-dom'; // Note: react-dom, not react
import ReactDOM from 'react-dom';


// Dropdowns
import DropdownRoles from "../Dropdown/DropdownRoles";
import DropdownAddObjects from "../Dropdown/DropdownAddObjects";
import ContextMenu from "../ContextMenu/ContextMenu";
import DropdownOverlay from "../Dropdown/DropdownOverlay";

import Up from "../../../public/icons/chevron-up.svg"
import Down from "../../../public/icons/chevron-down.svg"
import Layers from "../../../public/icons/layers.svg"

import CanvasUtils from './CanvasUtils';

// Standard Konva Components
import Konva from "konva";
import {
  Stage,
  Layer,
  Rect
} from "react-konva";

import "./Stage.css";
import "./Info.css";
import { is } from 'immutable';

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
    this.renderCounter = 11;

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
      customObjs: [],




      // Context Menu
      selectedContextMenu: null,
      objectContext: 0,
      contextDisabled: '',

      // The Text Editor (<textarea/>) & other text properties
      textInput: "",
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
      lock: false,

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
      groups: {},

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

  tryParseJSONObject = (jsonString) => {
    try {
      const o = JSON.parse(jsonString);

      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object",
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === "object") {
        return o;
      }
    } catch (e) { }
    return false;
  };

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
            const groupObj = objects.savedGroups[i][j];
            const parsed = this.tryParseJSONObject(groupObj);
            const savedGroupData = (parsed !== false) ? parsed : groupObj;
            savedGroup.push(savedGroupData);
          }
          parsedSavedGroups.push(savedGroup);
        }
        objects.savedGroups = parsedSavedGroups;

        let currentMainShapes = [];
        for (let i = 0; i < this.savedObjects.length; i++) {
          const type = this.savedObjects[i];
          currentMainShapes.push(objects[type]);
        }
        let uniqueShapesSet = []
        currentMainShapes.map((set, i) => {
          let uniqueArray = set.filter((shape, index, self) =>
            index === self.findIndex((s) => (
              s.id === shape.id
            ))
          );
          uniqueShapesSet.push(uniqueArray)
        })


        uniqueShapesSet.map((shape, i) => {
          if (shape.length === 0) return
          let type = shape[0].type
          this.setState({
            [type]: shape
          })
        })
        this.props.setAllShapes(uniqueShapesSet);

        if (this.props.setTasks) {
          this.props.setTasks(objects.tasks || []);
        }
        if (this.props.setGlobalVars) {
          this.props.setGlobalVars(objects.globalVars || []);
        }
        if (this.props.setGlobalCons) {
          this.props.setGlobalCons(objects.globalCons || []);
        }
        if (this.props.setGlobalInts) {
          this.props.setGlobalInts(objects.globalInts || []);
        }
        if (this.props.setGlobalTrigs) {
          this.props.setGlobalTrigs(objects.globalTrigs || []);
        }
        if (this.props.setLocalVars) {
          this.props.setLocalVars(objects.localVars || []);
        }
        if (this.props.setLocalCons) {
          this.props.setLocalCons(objects.localCons || []);
        }
        if (this.props.setLocalInts) {
          this.props.setLocalInts(objects.localInts || []);
        }
        if (this.props.setLocalTrigs) {
          this.props.setLocalTrigs(objects.localTrigs || []);
        }
        if (this.props.handleGroups)
          this.props.handleGroups(objects.groups || {});




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
                page.personalPositionRect = null;
              }
              // Get the personal roles and give them default values (if none exist yet)
              axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
                params: {
                  gameinstanceid: this.state.gameinstanceid,
                }
              }).then((res) => {
                const rolesData = [];
                for (let i = 0; i < res.data.length; i++) {
                  rolesData.push({
                    id: res.data[i].gameroleid,
                    roleName: res.data[i].gamerole,
                    numOfSpots: res.data[i].numspots,
                    roleDesc: res.data[i].roleDesc
                  });
                }
                for (let i = 0; i < rolesData.length; i++) {
                  const role = rolesData[i];
                  if (!page.personalPositionRect[role.roleName]) {
                    page.personalPositionRect[role.roleName] = this.positionRect;
                  }
                }
              }).catch(error => {
                console.error(error);
              });
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
                  const groupObj = this.state.savedGroups[i][j];
                  savedGroup.push(groupObj);
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


    history.push(this.state);

    this.props.setPerformanceFunctions({
      setCustomObjData: this.setCustomObjData
    });

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
      getVariableProps: this.getVariableProps,
      getPageProps: this.getPageProps,
      getDragProps: this.getDragProps,
      dragLayer: this.dragLayer,
      getLayers: this.getLayers

    });

    this.setState({ canvasLoading: false })
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
      let currentMainShapes = [];
      let allShapes = [];
      for (let i = 0; i < this.savedObjects.length; i++) {
        const type = this.savedObjects[i];
        prevMainShapes.push(prevState[type]);
        currentMainShapes.push(this.state[type]);
        allShapes = allShapes.concat(this.state[type]);
      }
      this.props.handleSetPages(this.state.pages.length)



      if (!this.state.isTransforming && !this.state.redoing) {
        if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
          if (JSON.stringify(prevMainShapes) !== JSON.stringify(currentMainShapes)) {
            this.props.setAllShapes(allShapes);
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
          this.props.setShapes(customObjs)
          break;
        }
      }

      if (prevState.canvasLoading !== this.state.canvasLoading) {
        this.props.setCanvasLoading(this.state.canvasLoading);
      }

      // This passes info all the way up to the App component so that it can be used in functions
      // shared between Canvas (Simulation Edit Mode) and CanvasGame (Simulation Play Mode)
      if (prevState !== this.state) {
        if (
          this.state.personalAreaOpen !== prevState.personalAreaOpen ||
          this.state.overlayOpen !== prevState.overlayOpen ||
          this.state.level !== prevState.level
        ) {
          //this.refs.customRectCanvas.add(this.refs.customRect);
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

      if (prevState.selectedShapeName !== this.state.selectedShapeName) this.setState({ contextDisabled: '' })

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
    storedObj.notes = this.props.notes;
    storedObj.globalVars = this.props.globalVars;
    storedObj.globalCons = this.props.globalCons;
    storedObj.globalInts = this.props.globalInts;
    storedObj.globalTrigs = this.props.globalTrigs;
    storedObj.localVars = this.props.localVars;
    storedObj.localCons = this.props.localCons;
    storedObj.localInts = this.props.localInts;
    storedObj.localTrigs = this.props.localTrigs;
    storedObj.groups = this.props.groups;

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
      x: pos.x - stageBox.left,
      y: pos.y - stageBox.top
    };
    const layerIds = this.getLayers();
    let objs = [...this.state['rectangles']];
    // (objs.forEach(obj => console.log(obj.x, obj.y)))
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
      const id = obj?.dataset.name;
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
        attrs: {
          id: shape.attrs.id,
        },
        id: shape.attrs.id,
        custom: true
      };
    } else if (shape?.id) {
      return {
        attrs: {
          id: shape.id,
        },
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

    let pos = null;
    if (event.layerX) {
      pos = {
        x: event.clientX - 70,
        y: event.clientY - (personalArea ? 50 : this.state.overlayOpen ? 20 : 0)
      };
    } else {
      let sidebarPx = window.matchMedia("(orientation: portrait)").matches ? 0 : 100;
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
    let yOffset = -this.state.groupLayerY - 40;

    if (personalArea) {
      scale = this.state.personalLayerScale;
      xOffset = -this.state.personalLayerX - 20;
      yOffset = -this.state.personalLayerY;
    } else if (this.state.overlayOpen) {
      scale = this.state.overlayLayerScale;
      xOffset = -this.state.overlayLayerX - 20;
      yOffset = -this.state.overlayLayerY;
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
    const page = this.state.pages[this.state.level - 1]; // deep copy
    let out = new Set();
    let newLay = new Set(newLayers)

    this.savedObjects.forEach(type => {
      const objs = this.state[type];
      objs.forEach(obj => {
        if (obj.id && obj.level === this.state.level && newLay.has(obj.id)) {
          out.add(obj.id);
        }
      });
    });

    newLay = new Set([...newLay].filter(layer => out.has(layer)));

    // Logs
    [...newLay].forEach(layer => {
      if (out.has(layer)) {
      }
    })



    newLayers = Array.from(newLay);
    if (this.state.overlayOpen) {
      const overlayIndex = page.overlays.findIndex(overlay => overlay.id === this.state.overlayOpenIndex);
      if (overlayIndex !== -1 && page.overlays[overlayIndex].layers) {
        page.overlays[overlayIndex].layers = newLayers;
      }
    } else if (this.state.personalAreaOpen && page.personalLayers) {
      page.personalLayers = newLayers;
    } else if (page.groupLayers) {
      page.groupLayers = newLayers;
    }

    const newPages = [...this.state.pages];
    newPages[this.state.level - 1] = page;

    this.setState({
      pages: newPages
    }, () => console.log(this.state.pages));  // log after state update
  }




  handleMouseUp = (e, personalArea) => {
    this.setState({
      selection: {
        ...this.state.selection,
        visible: false
      }
    });
    const event = e.evt ? e.evt : e;
    this.setState({ redoing: false })
    let shape = this.getTopObjAtPos({
      x: event.clientX,
      y: event.clientY
    });


    if (this.state.lineTransformDragging) {
      this.setState({
        lineTransformDragging: false
      });
      document.body.style.cursor = "auto";
    }

    let layerX = event.clientX - (personalArea ? 100 : 70);
    let layerY = event.clientY - (personalArea ? 60 : this.state.overlayOpen ? 0 : 50);


    // Determine how long screen has been clicked (if on mobile)
    if (this.state.touchTime && this.state.touchEvent) {
      const elapsedTimeMS = Date.now() - this.state.touchTime;
      if (elapsedTimeMS > 500) {
        event.button = 2;
      } else {
        event.button = 0;
      }


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
      const clickShapeGroup = shape ? this.getShapeGroup(shape.custom ? shape.id : this.refs[shape.id]) : null;


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
          this.refs[`${layer}.objects`].find(".shape, .customObj").forEach((elementNode) => {
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
                if (elemIds.includes(group[j])) {
                  selectedGroups.push(group);
                  break;
                }
              }
            }
            for (let i = 0; i < selectedGroups.length; i++) {
              const group = selectedGroups[i];
              for (let j = 0; j < group.length; j++) {
                elemIds = elemIds.filter(e => group[j] !== e);
              }
            }
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
                  if (obj.attrs ? obj.attrs.id === shape.id : obj === shape.id) {
                    alreadySelectedCurrent = true;
                  }
                  if (obj.attrs ?
                    this.state.selectedShapeName && obj.attrs.id === this.state.selectedShapeName :
                    this.state.selectedShapeName && obj === this.selectedShapeName) {
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
                    this.state.selectedShapeName
                  ) {
                    newSelection.push(this.state.selectedShapeName);
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
                        groupSelection: [
                          ...newSelection,
                          shape.id
                        ]
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
                      return obj.attrs ? obj.attrs.id !== shape.id : obj !== shape.id;
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
                        selectedShapeName: this.checkName(newGroupSelection[0]),
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
                (this.state.groupSelection[i].attrs ?
                  this.state.groupSelection[i].attrs.id === shape.id :
                  this.state.groupSelection[i] === shape.id)
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
            }
          }
          this.onObjectContextMenu(event);
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

          const rel = this.refs[`${areaClicked}AreaLayer.objects`].getRelativePointerPosition();
          this.setState({
            selectedContextMenu: {
              type: type,
              position: {
                x: layerX,
                y: layerY,
                relX: rel.x,
                relY: rel.y
              }
            },
            [notVisible]: false,
            [visible]: true,
            [contextMenuX]: layerX,
            [contextMenuY]: layerY,
          });
        }
      }

      flushSync(() => {
        this.setState({
          selection: {
            ...this.state.selection,
            visible: false
          }
        });
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
      const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
        (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
      const groups = this.refs[`${layer}.objects`].find('Group');
      const groupObjs = this.state.groupSelection.flat().map(obj => {
        if (this.customObjects.includes(this.getObjType(obj))) {
          return groups.find(groupObj => groupObj.attrs.id === obj);
        } else {
          return this.refs[obj];
        }
      });
      this.refs[transformer].nodes(groupObjs);
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

      if (this.state.lineTransformDragging && this.state.selectedShapeName) {
        const newLines = [...this.state.lines].filter(line => line.id !== this.state.selectedShapeName);
        const newLine = [...this.state.lines].filter(line => line.id === this.state.selectedShapeName)[0];

        const xIndex = this.state.lineTransformDragging === "top" ? 0 : 2;
        const yIndex = this.state.lineTransformDragging === "top" ? 1 : 3;
        if(newLine){
          newLine.points[xIndex] = newLine.points[xIndex] + (event.movementX / this.state[`${stage}LayerScale`]);
          newLine.points[yIndex] = newLine.points[yIndex] + (event.movementY / this.state[`${stage}LayerScale`]);
          this.setState({
            lines: [...newLines, newLine]
          });
        }
        
        

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
                  const id = customObjs[i]?.dataset?.name;
                  const onTop = this.state[this.getObjType(id)].filter(obj => obj.id === id)[0].onTop;
                  if (
                    (!this.state.selection.isDraggingShape || this.state.selection.isDraggingShape === "customObj") &&
                    !(shape && !onTop) &&
                    pos.x > bounds.left && pos.x < bounds.right &&
                    pos.y > bounds.top && pos.y < bounds.bottom
                  ) {
                    shapeId = customObjs[i]?.dataset?.name;
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

    let out = this.state[objectsName].map(eachObj =>
      eachObj.id === shape.attrs.id
        ? {
          ...eachObj,
          x: e.target.x(),
          y: e.target.y()
        }
        : eachObj
    )
    flushSync(() => {
      this.setState({
        [objectsName]: out,
        selectedShapeName: this.state.groupSelection.length ? "" : this.state.selectedShapeName,
        guides: []
      }, this.handleObjectSelection);
    });

    const stageType = this.state.overlayOpen ? "overlayStage" :
      (this.personalAreaOpen ? "personalStage" : "groupStage");
    this.refs[stageType].draw();

  }

  handleWheel = (e, personalArea) => {
    const scaleBy = 1.2;
    const stage = this.state.overlayOpen ? "overlay" : (personalArea ? "personal" : "group");

    const layer = this.refs[`${stage}AreaLayer.objects`];
    const oldScale = layer.scaleX();
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const stageArea = layer.getStage();
    const pointer = stageArea.getPointerPosition();
    const mousePos = {
      x: (pointer.x - this.state[`${stage}LayerX`]) / oldScale,
      y: (pointer.y - this.state[`${stage}LayerY`]) / oldScale,
    }
    const maxZoom = 250;
    const maxUnZoom = 0.1;
    if (newScale > maxZoom) {
      this.props.showAlert(this.props.t("alert.maxZoomReached"), "info");
      newScale = 250
    }
    if (newScale < maxUnZoom) {
      this.props.showAlert(this.props.t("alert.maxZoomReached"), "info");
      newScale = 0.1
    }
    const newPos = {
      x: pointer.x - mousePos.x * newScale,
      y: pointer.y - mousePos.y * newScale,
    };


    layer.scale({
      x: newScale,
      y: newScale
    });
    const layerScale = `${stage}LayerScale`;


    flushSync(() => {
      this.setState({
        [layerScale]: newScale,
        [`${stage}LayerX`]: newPos.x,
        [`${stage}LayerY`]: newPos.y,
      });
    });
  }

  dragLayer = (e) => {
    const type = this.state.overlayOpen ? "overlay" :
      (this.state.personalAreaOpen ? "personal" : "group");
    if (this.state.layerDraggable) {
      this.setState({
        [`${type}LayerX`]: e.target.x(),
        [`${type}LayerY`]: e.target.y(),
      });
    }
  }

  handleUndo = () => {
    this.handleSave();
    const stageType = this.state.overlayOpen ? "overlayLayers" :
      (this.personalAreaOpen ? "personalLayers" : "groupLayers");
    if (!this.state.isTransforming) {
      if (!this.state.textEditVisible) {
        if (historyStep === 0) {
          return;
        }
        historyStep--;
        const previous = history[historyStep];
        for (let i = 0; i < this.savedObjects.length; i++) {
          this.setState({
            [this.savedObjects[i]]: previous[this.savedObjects[i]],
          }, () => {
            const stageType = this.state.overlayOpen ? "overlayStage" :
              (this.personalAreaOpen ? "personalStage" : "groupStage");
            this.refs[stageType].draw();
          });
        }
        this.setState({
          pages: previous.pages,
        });

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
    this.handleSave();
    if (!this.state.isTransforming) {
      if (!this.state.textEditVisible) {
        if (historyStep === history.length - 1) {
          return;
        }
        historyStep++;
        const next = history[historyStep];
        for (let i = 0; i < this.savedObjects.length; i++) {
          this.setState({
            [this.savedObjects[i]]: next[this.savedObjects[i]],
          }, () => {
            const stageType = this.state.overlayOpen ? "overlayStage" :
              (this.personalAreaOpen ? "personalStage" : "groupStage");
            this.refs[stageType].draw();
          });
        }
        this.setState({
          pages: next.pages,
        });
      }

      this.setState({
        selectedContextMenu: null,
        redoing: true,
        selectedShapeName: ''
      });
    }
  }

  getObjType = (name) => {
    // console.log(name)
    if (typeof name !== 'string') {
      name = name?.dataset ? name?.dataset?.name : name?.attrs?.id;
    }

    try {
      // console.log('meows', name)
      return name.replace(/\d+$/, "");;
    }
    catch (e) {
      // console.log('meow')
      return null;
    }

  }

  handleCopy = () => {
    const name = this.state.selectedShapeName;
    const state = this.state[this.getObjType(name)];
    const toCopy = name ? [state ? state.filter(obj => obj.id === name)[0] : null] : [];

    this.state.groupSelection.forEach(obj => {
      if (Array.isArray(obj)) {
        toCopy.push(...obj.map(o => this.state[this.getObjType(o)].filter(obj => obj.id === o)[0]))
      } else {
        const type = this.getObjType(obj);
        toCopy.push(this.state[type].filter(o => o.id === obj)[0]);
      }
    })


    if (toCopy) {
      this.setState({
        copied: toCopy,
        selectedContextMenu: null
      });
    }
  }

  handleLock = () => {
    const type = this.getObjType(this.state.selectedShapeName);

    this.setState(
      prevState => ({
        [type]: prevState[type]?.map(obj =>
          obj.id === this.state.selectedShapeName
            ? {
              ...obj,
              lock: !obj.lock,
            }
            : obj
        ),
      }),
      () => {
        const lockedObj = this.state[type]?.find(
          obj => obj.id === this.state.selectedShapeName
        );
        this.props.showAlert(`Object is ${lockedObj.lock ? "locked" : "unlocked"}`, "info");
      }
    );

    this.setState({
      selectedContextMenu: null,
    });
  };


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
            const overlayLayer = page.overlays.filter((obj, i) => {
              return obj.id === this.state.overlayOpenIndex;
            })
            layers = overlayLayer[0].layers;
            layers.push(newId);
            page.overlays.map((obj, i) => {
              if (obj.id === this.state.overlayOpenIndex) {
                obj.layers = layers;
              }
            })
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
    if (this.state.selectedShapeName) toDelete = [this.state.selectedShapeName]
    else toDelete = this.state.groupSelection.flat();
    toDelete.map((id) => {
      const type = this.getObjType(id);
      let objs = this.state[type];
      objs.map((obj) => {
        if (obj.id === id) {
          objs.splice(objs.indexOf(obj), 1);
        }
      })
    })

    const layers = [...this.getLayers()];
    //const delIds = toDelete.map(obj => obj.attrs ? obj.attrs.id : obj.dataset.name);
    const newLayers = layers.filter(layer => !toDelete.includes(layer));
    this.setLayers(newLayers);

    this.setState({
      selectedShapeName: "",
      groupSelection: [],
      selectedContextMenu: null
    }, this.handleObjectSelection);
  }

  handleClearPage = () => {
    this.setState({
      selectedShapeName: "",
      groupSelection: [],
      selectedContextMenu: null
    }, this.handleObjectSelection);

    const page = this.state.pages[this.state.level - 1];
    const newPages = [...this.state.pages];
    newPages[this.state.level - 1] = {
      ...page,
      groupLayers: [],
    };
    this.setState({
      pages: newPages
    }, this.handleSave);
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
    const objType = this.getObjType(this.state.selectedShapeName);
    const objects = JSON.parse(JSON.stringify(this.state[objType]));
    if (Array.isArray(objects) && objects.length) {
      objects.forEach((object) => {
        if (object.id === this.state.selectedShapeName) {
          const index = objects.map(object => object.id).indexOf(this.state.selectedShapeName);
          this.setState(prevState => {
            const objects = JSON.parse(JSON.stringify(prevState[objType]));
            objects.splice(index, 1);
            return {
              ...prevState,
              [objType]: objects.concat({ ...object, strokeWidth: e })
            }
          });
        }
      });
    }
  }

  // Object Opacity
  handleOpacity = (e) => {
    const objType = this.getObjType(this.state.selectedShapeName);
    const objects = JSON.parse(JSON.stringify(this.state[objType]));
    if (Array.isArray(objects) && objects.length) {
      objects.forEach((object) => {
        if (object.id === this.state.selectedShapeName) {
          const index = objects.map(object => object.id).indexOf(this.state.selectedShapeName);
          this.setState(prevState => {
            const objects = JSON.parse(JSON.stringify(prevState[objType]));
            objects.splice(index, 1);
            return {
              ...prevState,
              [objType]: objects.concat({ ...object, opacity: e })
            }
          });
        }
      });
    }
  }

  handleGrouping = (inGroup) => {
    const groupSelection = inGroup ? inGroup : this.state.groupSelection;
    if (groupSelection.length > 1) {
      // Remove any existing groups which are part of the new group
      const newGroup = [...groupSelection.flat()];
      let newSavedGroups = [...this.state.savedGroups];
      let out = []
      newGroup.map((obj) => {
        out.includes(obj) ? null : out.push(obj)
      });


      newSavedGroups.push(out)
      this.setState({
        selectedShape: "",
        groupSelection: [out],
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
          const objId = selection[0].attrs ? selection[0].attrs.id : selection[0];
          for (let i = 0; i < this.state.savedGroups.length; i++) {
            for (let j = 0; j < this.state.savedGroups[i].length; j++) {
              if (this.state.savedGroups[i][j].attrs ?
                this.state.savedGroups[i][j].attrs.id === objId :
                this.state.savedGroups[i][j] === objId) {
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


  getShapeGroup = (shape) => {
    let shapeId;
    if (typeof shape !== 'object') {
      shapeId = shape
    } else {
      shapeId = shape.attrs.id
    }
    let saved = this.state.savedGroups;
    let group = this.state.groupSelection;
    if (group.flat().includes(shapeId)) {
      return (group.flat())
    }
    for (let i = 0; i < saved.length; i++) {
      if (saved[i].includes(shapeId)) {
        return (saved[i]);
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
      let topPx = 57;
      if (layer === this.refs[`personalAreaLayer.objects`]) {
        topPx = 57;
      } else if (layer === this.refs[`overlayAreaLayer.objects`]) {
        topPx = 57;
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
      if (!this.state.layerDraggable) {
        this.setState({
          layerDraggable: true
        });
      }

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
        if (group.attrs.id === id) {
          if (updateState) {
            if (showTransformer) {
              this.setState({
                selectedShapeName: id
              }, this.handleObjectSelection);
            }
          }
          return group.children[0];
        }
      }
      if (this.refs[id]?.attrs) {
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

    for (let i = 0; i < guides.length; i++) {
      const g = guides[i];
      let gBox = g.getClientRect();
      let paddingW = objBox.width / 2;
      let paddingH = objBox.height / 2;

      gBox.x -= paddingW
      gBox.y -= paddingH

      // Make box bigger for easier selection
      if (objBox.x > gBox.x - paddingW && objBox.x < gBox.x + paddingW) {
        obj.absolutePosition({
          x: gBox.x,
          y: objBox.y
        });
      }
      if (objBox.y > gBox.y - paddingH && objBox.y < gBox.y + paddingH) {
        obj.absolutePosition({
          x: objBox.x,
          y: gBox.y
        });
      }
    }
  };

  objectSnapping = (obj, e) => {
    if (e && e.evt.shiftKey) {
      const objStage = obj.attrs ? obj.attrs : obj;
      const stage = objStage.overlay ? "overlay" : (objStage.infolevel ? "personal" : "group");
      const objRef = obj.attrs ? obj : this.refs[obj.id];
      const layerScale = this.state[`${stage}LayerScale`];
      this.getLineGuideStops(stage, objRef);

      const stageRef = this.refs[`${stage}Stage`];
      const objBox = objRef.getClientRect();
      const guides = stageRef.find('.guide');

      for (let i = 0; i < guides.length; i++) {
        const g = guides[i];
        let gBox = g.getClientRect();
        let paddingW = objBox.width / 2;
        let paddingH = objBox.height / 2;
        gBox.x -= paddingW
        gBox.y -= paddingH

        if (objBox.x > gBox.x - paddingW && objBox.x < gBox.x + paddingW) {
          objRef.absolutePosition({
            x: gBox.x,
            y: objBox.y
          });
        }
        if (objBox.y > gBox.y - paddingH && objBox.y < gBox.y + paddingH) {
          objRef.absolutePosition({
            x: objBox.x,
            y: gBox.y
          });
        }
      }
    } else {
      this.setState({
        guides: []
      });
    }
  };

  onObjectDragMove = (obj, e) => {
    // if (this.customObjects.includes(this.getObjType(obj.id))) {
    //   // Don't run this for custom objects
    //   return;
    // }
    // const layer = this.state.personalAreaOpen ? "personalAreaLayer" :
    //   (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
    // this.refs[obj.id].moveTo(this.refs[`${layer}.dragging`]);

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
  collide = (rect1, rect2, padding) => {
    let rect1Top = rect1.y;
    let rect1Bottom = rect1.y + rect1.height;
    let rect1Left = rect1.x;
    let rect1Right = rect1.x + rect1.width;
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
    this.setState({
      isTransforming: false
    });

    const custom = this.customObjects.includes(this.getObjType(obj.id));
    const type = this.getObjType(obj.id);
    let object = null;
    if (!custom) {
      object = this.refs[obj.ref];
    } else {
      const layer = this.state.personalAreaOpen ? "personalAreaLayer" : (this.state.overlayOpen ? "overlayAreaLayer" : "groupAreaLayer");
      const customObjs = this.refs[`${layer}.objects`].find('Group');
      for (let i = 0; i < customObjs.length; i++) {
        const id = customObjs[i].attrs.id;
        if (id === obj.id) {
          object = customObjs[i].children[0];
          break;
        }
      }
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

    if (custom) {
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
              x: object.x() + (custom ? obj.x : 0),
              y: object.y() + (custom ? obj.y : 0)
            }
            : o
        )
      })
    );

    if (custom) {
      object.x(0);
      object.y(0);
    }

    if (!(type === "videos" || type === "audios" || this.customObjects.includes(type))) {
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
    //this.refs.customRectCanvas.add(this.refs.customRect);
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

  isTouching = (obj1, obj2) => {
    return !(
      obj1.x + obj1.width < obj2.x ||
      obj1.y + obj1.height < obj2.y ||
      obj1.x > obj2.x + obj2.width ||
      obj1.y > obj2.y + obj2.height
    );
  }

  getLocalLayer = (id, layers, isCustom) => {
    const name = this.state.selectedShapeName;
    const state = this.state[this.getObjType(name)];
    const mainObj = name ? state ? state.filter(obj => obj.id === name)[0] : null : [];
    const objRef = mainObj.attrs ? mainObj : this.refs[mainObj.id];
    const objBox = isCustom ? objRef.getBoundingClientRect() : objRef.getClientRect();
    let layer = []
    layers.map(id => {
      if (this.refs[id] === undefined) return;
      const tempRef = this.refs[id];
      const tempBox = isCustom ? tempRef.getBoundingClientRect() : tempRef.getClientRect();
      if (this.isTouching(objBox, tempBox)) {
        layer.push(id)
      }
    })
    return layer
  }

  layerTo = (id, dir) => {
    if (this.state.groupSelection.length > 0) return;
    let isCustom = this.customObjects.includes(this.getObjType(id));
    let newLayers = this.getLayers();
    let i;
    let inputIds = [];
    let newObject = [];
    let tempInputs = []
    let tempObject = []
    for (let i = 0; i < newLayers.length; i++) {
      if (newLayers[i]?.includes('inputs')) {
        inputIds.push(newLayers[i]);
      } else {
        newObject.push(newLayers[i]);
      }
    }
    if (isCustom) {
      tempInputs = this.getLocalLayer(id, inputIds, isCustom);
      newLayers = newLayers.filter(item => !tempInputs.includes(item))
    } else {
      tempObject = this.getLocalLayer(id, newObject, isCustom);
      newLayers = newLayers.filter(item => !tempObject.includes(item))
    }
    if (isCustom) {
      const customChild = Array.from(document.getElementsByClassName("customObj")).filter(obj => obj.dataset.name === id)[0].parentNode;
      const parentElement = customChild.parentNode;
      i = tempInputs.indexOf(id);
      if (dir === 'up') {
        if (i < tempInputs.length - 1) {
          const nextChild = customChild.nextSibling;
          let obj = tempInputs[i];
          tempInputs[i] = tempInputs[i + 1];
          tempInputs[i + 1] = obj;
          parentElement.insertBefore(nextChild, customChild);
        } if (i + 1 >= tempObject.length - 1) {
          // this.setState({ contextDisabled: 'up' })
        }
      } else {
        if (i > 0) {
          const previousChild = customChild.previousSibling;
          const obj = tempInputs[i];
          tempInputs[i] = tempInputs[i - 1];
          tempInputs[i - 1] = obj;
          parentElement.insertBefore(customChild, previousChild);
        } if (i <= 1) {
          // this.setState({ contextDisabled: 'down' })
        }
      }
    } else {
      i = tempObject.indexOf(id);
      if (dir === 'up') {
        if (i < tempObject.length - 1) {
          let obj = tempObject[i];
          tempObject[i] = tempObject[i + 1];
          tempObject[i + 1] = obj;
        } if (i + 1 >= tempObject.length - 1) {
          // this.setState({ contextDisabled: 'up' })
        }
      } else {
        if (i > 0) {
          const obj = tempObject[i];
          tempObject[i] = tempObject[i - 1];
          tempObject[i - 1] = obj;
        } if (i <= 1) {
          // this.setState({ contextDisabled: 'down' })
        }
      }
    }
    newLayers.unshift(...tempObject);
    newLayers.unshift(...tempInputs);

    newLayers = [...newLayers];
    this.setLayers(newLayers);
  }

  layerToBottom = (id) => {
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
        const obj = newLayers.splice(i, 1)[0];
        newLayers.unshift(obj);
      }
      this.setLayers(newLayers);
    }
  }

  handleOverlayIcon = (img) => {
    const { pages, level, overlayOptionsOpen } = this.state;

    const updatedPages = [...pages]; // Create a shallow copy of the pages array
    const currentOverlay = { ...updatedPages[level - 1].overlays[overlayOptionsOpen] }; // Create a shallow copy of the current overlay object
    currentOverlay.image = img; // Update the overlay object with the new image

    updatedPages[level - 1].overlays[overlayOptionsOpen] = currentOverlay; // Replace the updated overlay object in the pages array

    this.setState({
      pages: updatedPages
    });

  }


  getDragProps = () => { }
  getPageProps = () => { }
  getVariableProps = () => { }

  handleFillRoles = (shapes) => {
    const roleTypes = ['Students', 'Teachers', 'Admins']; // your array of strings

    let roles = roleTypes.reduce((obj, role) => {
      obj[role] = [];
      return obj;
    }, {});
    for (let i = 0; i < shapes.length; i++) {
      shapes[i].length > 0 && Array.isArray(shapes[i]) && shapes[i].map(shape => {
        if (shape.rolelevel === 'Students') {
          roles['Students'].push(shape);
        }
      })
    }
    console.log(roles, this.state.roles)
    if (roles !== this.state.roles) {
      this.setState({
        roles: roles
      })
    }
  }

  renderAllObjects = () => {
    return this.props.loadObjects("group", "edit", this.state.movingCanvas, this)
  }

  render() {

    if (!this.state.savedStateLoaded) return null;
    return (
      <React.Fragment>
        {/* The Top Bar */}
        {/* <CanvasUtils state={this.state} savedObjects={this.savedObjects} /> */}

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
          handleLevel={this.handleLevel}
          handlePageTitle={this.handlePageTitle}
          handlePageNum={this.handleNumOfPagesChange}
          numOfPages={this.state.numberOfPages}
          loadObjects={this.props.loadObjects}
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

                  {this.state.pages[this.state.level - 1].overlays.map((image, i) => {
                    if (image.id === overlay.id && image.image) {
                      return (
                        <Image
                          key={i}
                          className="overlayIcons"
                          cloudName="uottawaedusim"
                          publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/" + image.image}
                        />
                      );
                    } else if (overlay.id === image.id) {
                      return (
                        <i><Layers className="icon overlay-icon" /></i>
                      )
                    }
                  })
                  }
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
            variables={this.props.globalVars}

          />
        )}

        {/* ---- CUSTOM RECT CANVAS ---- */}
        {/*<Stage
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
        </Stage>*/}

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
              canvasState={this}
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
          <input value={this.state.textInput} onChange={(event) => this.setState({ textInput: event.target.value })} />
          {/* <button onClick={() => this.handleClearPage()} className='clear'>Clear</button> */}
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
            {!this.state.personalAreaOpen && !this.state.overlayOpen && (
              <>
                {this.renderAllObjects()}
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
                  lock={this.handleLock}
                  level={this.state.level}
                  handleLevel={this.handleLevel}
                  delete={this.handleDelete}
                  onDocClick={this.onDocClick}
                  globalVars={this.props.globalVars}
                  setCustomObjData={this.setCustomObjData}
                  layerTo={this.layerTo}
                  pages={this.state.pages}
                  layerToBottom={this.layerToBottom}
                  layers={this.getLayers()}
                  contextDisabled={this.state.contextDisabled}
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
                  {this.props.loadObjects("personal", "edit", this.state.movingCanvas, this)}
                </>
              )}
            </Stage>
          </div>

          {/* The Personal Area Open / Close Caret */}
          {(this.state.personalAreaOpen !== 1)
            ? <button
              className="personalAreaToggle"
              onClick={() => {
                //this.refs.customRectCanvas.add(this.refs.customRect);
                document.getElementById("editPersonalContainer").classList.add("personalAreaAnimOn");
                this.handlePersonalAreaOpen(true);
                setTimeout(() => {
                  document.getElementById("editPersonalContainer").classList.remove("personalAreaAnimOn");
                }, 500);
              }}>
              <i><Up className="icon chevrons" /></i>
            </button>
            : <button
              className="personalAreaToggle"
              onClick={() => {
                //this.refs.customRectCanvas.add(this.refs.customRect);
                document.getElementById("editPersonalContainer").classList.add("personalAreaAnimOn");
                this.handlePersonalAreaOpen(false);
              }}>

              <i><Down className="icon chevrons" /></i>

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
                //this.refs.customRectCanvas.add(this.refs.customRect);
                this.setState(() => this.handlePersonalAreaOpen(true));
              }}
              roleLevel={this.handleRoleLevel}
              gameid={this.state.gameinstanceid}
              handleCopyRole={this.handleCopyRole}
              handleEditRole={this.handleEditRole}
              roleRef={"rolesdrop"}
              savedRoles={this.state.roles}
              editMode={true}
              addNewRoleRect={(name) => {
                const pages = JSON.parse(JSON.stringify(this.state.pages));
                for (let i = 0; i < this.state.pages.length; i++) {
                  const page = pages[i];
                  page.personalPositionRect[name] = this.positionRect;
                  pages[i] = page;
                }
                this.setState({
                  pages: pages
                });
              }}
              deleteRoleRect={(name) => {
                const pages = JSON.parse(JSON.stringify(this.state.pages));
                for (let i = 0; i < this.state.pages.length; i++) {
                  const page = pages[i];
                  delete page.personalPositionRect[name];
                  pages[i] = page;
                }
                this.setState({
                  pages: pages
                });
              }}
              renameRoleRect={(oldName, newName) => {

                const pages = JSON.parse(JSON.stringify(this.state.pages));
                for (let i = 0; i < this.state.pages.length; i++) {
                  const page = pages[i];

                  page.personalPositionRect[newName] = page.personalPositionRect[oldName];
                  delete page.personalPositionRect[oldName];
                  pages[i] = page;
                }
                this.setState({
                  pages: pages
                });
              }}
              roles={this.state.roles}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withTranslation()(Graphics);
