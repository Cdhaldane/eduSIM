import React, { useState, useEffect } from 'react';
import fileDownload from 'js-file-download';
import axios from 'axios';
import Level from "../Level/Level";
import Portal from "./Shapes/Portal";
import DrawModal from "../DrawModal/DrawModal";
import Overlay from "./Overlay";
import { withTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import { flushSync } from 'react-dom'; // Note: react-dom, not react

// Dropdowns
import DropdownRoles from "../Dropdown/DropdownRoles";
import DropdownAddObjects from "../Dropdown/DropdownAddObjects";
import ContextMenu from "../ContextMenu/ContextMenu";
import DropdownOverlay from "../Dropdown/DropdownOverlay";

import Up from "../../../public/icons/chevron-up.svg"
import Down from "../../../public/icons/chevron-down.svg"
import Layers from "../../../public/icons/layers.svg"

// Standard Konva Components
import Konva from "konva";
import {
    Stage,
    Layer,
    Rect
} from "react-konva";

import "./Stage.css";
import "./Info.css";

const Graphics = (props) => {
    // Hooks and state initialization
    const [state, setState] = useState({
        customRenderRequested: false,
        arrows: [],
        guides: [],
        groupAreaContextMenuVisible: false,
        groupAreaContextMenuX: 0,
        groupAreaContextMenuY: 0,
        personalAreaContextMenuVisible: false,
        personalAreaContextMenuX: 0,
        personalAreaContextMenuY: 0,
        overlayAreaContextMenuVisible: false,
        overlayAreaContextMenuX: 0,
        overlayAreaContextMenuY: 0,
        savedGroups: [],
        customRect: [{ x: 0, y: 0 }],
        pages: [],
        numberOfPages: 6,
        level: 1,
        overlayOpen: false,
        overlayOptionsOpen: -1,
        overlayOpenIndex: -1,
        overlayImage: -1,
        selectedContextMenu: null,
        objectContext: 0,
        textInput: "",
        textX: 0,
        textY: 0,
        textEditVisible: false,
        text: "",
        currentTextRef: "",
        textareaWidth: 0,
        textareaHeight: 0,
        textareaInlineStyle: { display: "none" },
        textareaFill: null,
        textareaFontFamily: null,
        textareaFontSize: 10,
        textRotation: 0,
        shouldTextUpdate: true,
        selectedFont: null,
        vidsrc: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm",
        imgsrc: 'https://cdn.hackernoon.com/hn-images/0*xMaFF2hSXpf_kIfG.jpg',
        audsrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3",
        docsrc: "https://res.cloudinary.com/uottawaedusim/image/upload/v1643788961/pdfs/xzgxf449ecdymapdaukb.pdf",
        docimage: "",
        tool: 'pen',
        isDrawing: false,
        drawMode: false,
        color: "black",
        drawStrokeWidth: 5,
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
        colorf: "black",
        colors: "black",
        strokeWidth: 3.75,
        opacity: 1,
        lastFill: null,
        lock: false,
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
        title: "",
        category: "",
        description: "",
        thumbnail: "",
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
        personalAreaOpen: 0,
        state: false,
        saving: null,
        saved: [],
        roadmapId: null,
        alreadyCreated: false,
        publishing: false,
        isPasteDisabled: false,
        gameinstanceid: props.gameinstance,
        adminid: props.adminid,
        savedstates: [],
        savedStateLoaded: false,
        canvasLoading: false
    });

    useEffect(() => {
        // Component initialization logic
        let objectState = {};
        let objectDeleteState = {};
        for (let i = 0; i < props.savedObjects.length; i++) {
            objectState = {
                ...objectState,
                [props.savedObjects[i]]: []
            };
            objectDeleteState = {
                ...objectDeleteState,
                [`${props.savedObjects[i]}DeleteCount`]: 0
            };
        }

        let defaultPagesTemp = new Array(6);
        defaultPagesTemp.fill({
            primaryColor: "#8f001a",
            groupColor: "#FFF",
            personalColor: "#FFF",
            groupPositionRect: {
                x: 0,
                y: 0,
                w: 1920,
                h: 1080,
                scaleX: 1,
                scaleY: 1
            },
            personalPositionRect: {
                x: 0,
                y: 0,
                w: 1920,
                h: 1080,
                scaleX: 1,
                scaleY: 1
            },
            overlayColor: "#FFF",
            overlays: [],
            groupLayers: [],
            personalLayers: []
        });
        const defaultPages = defaultPagesTemp.map((page, index) => {
            return {
                ...page,
                name: props.t("admin.pageX", { page: (index + 1) })
            };
        });

        setState(prevState => ({
            ...prevState,
            ...objectState,
            ...objectDeleteState,
            pages: defaultPages
        }));

        reloadFromSavedState(props.doNotRecalculateBounds);
    }, []);

    // Function declarations and other code goes here...
    const tryParseJSONObject = (jsonString) => {
        try {
          const o = JSON.parse(jsonString);
      
          if (o && typeof o === "object") {
            return o;
          }
        } catch (e) { }
        return false;
      };
      
      const reloadFromSavedState = (doNotRecalculateBounds) => {
        axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstance/:adminid/:gameid', {
          params: {
            adminid: state.adminid,
            gameid: state.gameinstanceid
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
                const parsed = tryParseJSONObject(groupObj);
                const savedGroupData = (parsed !== false) ? parsed : groupObj;
                savedGroup.push(savedGroupData);
              }
              parsedSavedGroups.push(savedGroup);
            }
            objects.savedGroups = parsedSavedGroups;
      
            if (props.setTasks) {
              props.setTasks(objects.tasks || {});
            }
            if (props.setVars) {
              props.setVars(objects.variables || {});
            }
            if (props.setCons) {
              props.setCons(objects.cons || {});
            }
            if (props.setInts) {
              props.setInts(objects.ints || {});
            }
            if (props.setTrigs) {
              props.setTrigs(objects.trigs || {});
            }
            if (props.setNotes) {
              props.setNotes(objects.notes || {});
            }
      
            // Put parsed saved data into state
            savedState.forEach((object, index, arr) => {
              // Add backwards compatability for the new centering system
              if (object === "pages") {
                for (let i = 0; i < objects[object].length; i++) {
                  const page = objects[object][i];
                  const overlays = page.overlays;
                  if (!page.groupPositionRect) {
                    page.groupPositionRect = positionRect;
                  }
                  if (!page.personalPositionRect) {
                    page.personalPositionRect = null;
                  }
                  
                  for (let j = 0; j < overlays.length; j++) {
                    const overlay = overlays[j];
                    if (!overlay.positionRect) {
                      overlay.positionRect = positionRect;
                    }
                  }
                }
              }
              setState(prevState => ({
                ...prevState,
                [object]: objects[object],
                savedStateLoaded: true
              }), () => {
                if (index === arr.length - 1) {
                  // Get full objects for saved groups
                  let fullObjSavedGroups = [];
                  for (let i = 0; i < state.savedGroups.length; i++) {
                    let savedGroup = [];
                    for (let j = 0; j < state.savedGroups[i].length; j++) {
                      const groupObj = state.savedGroups[i][j];
                      const id = groupObj.attrs ? groupObj.attrs.id : groupObj;
                      savedGroup.push(groupObj.attrs ? refs[id] : id);
                    }
                    fullObjSavedGroups.push(savedGroup);
                  }
                  setState(prevState => ({
                    ...prevState,
                    savedGroups: fullObjSavedGroups
                  }), () => {
                    // Calculate positions on initial load
                    if (!doNotRecalculateBounds) {
                      setState(prevState => ({
                        ...prevState,
                        canvasLoading: true
                      }), () => {
                        props.setCanvasLoading(state.canvasLoading);
                        setTimeout(() => props.reCenter("edit"), 1000);
                      });
                    }
                  });
      
                  for (let j = 0; j < customObjects.length; j++) {
                    const type = customObjects[j];
                    if (state[type] === undefined) {
                      setState(prevState => ({
                        ...prevState,
                        [type]: []
                      }));
                      continue;
                    }
                    for (let i = 0; i < state[type].length; i++) {
                      const stateItem = state[type][i];
                      setCustomGroupPos(stateItem, "groupAreaLayer");
                      setCustomGroupPos(stateItem, "personalAreaLayer");
                      setCustomGroupPos(stateItem, "overlayAreaLayer");
                    }
                  }
                }
              });
            });
          } else {
            setState(prevState => ({
              ...prevState,
              canvasLoading: false,
              savedStateLoaded: true
            }));
          }
        }).catch(error => {
          console.error(error);
        });
      };

      

    return (
    <>
    </>
    );
}

export default Graphics;
