import React, { Suspense, useState, useRef, useContext, useEffect } from "react";
import { SettingsContext } from "../App";
import Loading from "../components/Loading/Loading";
import WebFont from "webfontloader";

import TransformerComponent from "../components/Stage/TransformerComponent";
import URLVideo from "../components/Stage/URLVideos";
import URLDocument from "../components/Stage/URLDocument";
import URLImage from "../components/Stage/URLImage";
import TicTacToe from "../components/Stage/GamePieces/TicTacToe/TicTacToe";
import Deck from "../components/Stage/GamePieces/Deck/Deck";
import Dice from "../components/Stage/GamePieces/Dice/Dice";
import Connect4 from "../components/Stage/GamePieces/Connect4/Board";
import RichText from "../components/Stage/GamePieces/RichText/RichText";
import Poll from "../components/Stage/GamePieces/Poll/Poll";
import HTMLFrame from "../components/Stage/GamePieces/HTMLFrame";
import Timer from "../components/Stage/GamePieces/Timer";
import Input from "../components/Stage/GamePieces/Input";
import Rectangle from "../components/Stage/GamePieces/Rectangles/Rect";
import { flushSync } from 'react-dom'; // Note: react-dom, not react


const EditPage = React.lazy(() => import("./EditPage"));
const GamePage = React.lazy(() => import("./GamePage"));

// Standard Konva Components
import {
  Rect,
  Ellipse,
  Star,
  Text,
  RegularPolygon,
  Line,
  Arrow,
  Shape,
  Layer,
  Transformer,
  Group
} from "react-konva";
import { Socket } from "socket.io-client";
import { is } from "immutable";
import { to } from "react-spring";

const konvaObjects = [
  "rectangles",
  "ellipses",
  "stars",
  "texts",
  "triangles",
  "images",
  "audios",
  "documents",
  "lines",
  "pencils" // The drawings
];

const CanvasPage = (props) => {
  const layerRef = useRef();

  const [img, setImg] = useState(null);

  const { settings: localSettings } = useContext(SettingsContext);

  /*------------------------------------------------------------------------------/
    * CANVAS FUNCTIONS
    * The following functions are used on both Edit Mode and Play Mode in order to
    * render the canvasses. They are passed down from here to both canvasses.
    *------------------------------------------------------------------------------*/

  // Save State
  // These are the names of the objects in state that are saved to the database
  const customObjects = props.customObjects;
  const savedObjects = [
    // Rendered Objects Only (shapes, media, etc.)
    ...customObjects, ...konvaObjects
  ];
  const customDeletes = [
    ...customObjects.map(name => `${name}DeleteCount`)
  ];
  const allDeletes = [
    ...savedObjects.map(name => `${name}DeleteCount`)
  ];

  const positionRectRef = useRef(null);
  const positionRectPersonalRef = useRef(null);
  const positionRectOverlayRef = useRef(null);

  const [gameEditProps, _setGameEditProps] = useState();
  const gameEditPropsRef = useRef();
  const setGameEditProps = (props) => {
    _setGameEditProps(props);
    gameEditPropsRef.current = props;
  }

  const [gamePlayProps, _setGamePlayProps] = useState();
  const gamePlayPropsRef = useRef();
  const setGamePlayProps = (props) => {
    _setGamePlayProps(props);
    gamePlayPropsRef.current = props;
  }

  const [loadedFonts, _setLoadedFonts] = useState([]);
  const loadedFontsRef = useRef(loadedFonts);
  const setLoadedFonts = (fonts) => {
    _setLoadedFonts(fonts);
    loadedFontsRef.current = fonts;
  }

  const [playModeCanvasHeights, setPlayModeCanvasHeights] = useState({
    group: null,
    overlay: null,
    personal: null
  });

  const getUpdatedCanvasState = (mode, editState) => {
    if (mode === "edit") {
      return gameEditPropsRef.current;
    } else if (mode === "play") {
      return gamePlayPropsRef.current;
    } else {
      return null;
    }
  }

  // In game mode to prevent screen resizing due to dragging shapes out of bounds
  // It will use the initial zoom settings until a resize occurs
  const [zoomSettings, setZoomSettings] = useState({
    group: { x: null, y: null, scale: null, resize: false },
    overlay: { x: null, y: null, scale: null, resize: false },
    personal: { x: null, y: null, scale: null, resize: false }
  });

  const [prevLayers, setPrevLayers] = useState([]);

  useEffect(() => {
    if (
      zoomSettings.group.x === null &&
      zoomSettings.personal.x === null &&
      zoomSettings.overlay.x === null
    ) {
      const poll2 = Array.from(document.getElementsByClassName("customObj")).filter(obj => obj.dataset.name === "polls2")[0];
      reCenterObjects(props.edit ? "edit" : "play");
    }
  }, [zoomSettings]);



  /*-------------------------------------------------------------------------------------------/
   * RECENTER OBJECTS
   * The following functions are used to reposition the objects so they all fit on the canvas
   *------------------------------------------------------------------------------------------*/
  const reCenterObjects = (mode, layer, from) => {
    if (from === "resize") {
      setZoomSettings({
        group: { x: null, y: null, scale: null, resize: false },
        overlay: { x: null, y: null, scale: null, resize: false },
        personal: { x: null, y: null, scale: null, resize: false }
      });
      return;
    }

    let canvas = getUpdatedCanvasState(mode);

    if (!canvas) {
      return;
    }

    const topBar = document.getElementById("levelContainer")?.childNodes[0].getBoundingClientRect();
    const sidebar = document.getElementsByClassName("grid-sidebar")[0]?.getBoundingClientRect();
    const personalArea = document.getElementById("editPersonalContainer")?.getBoundingClientRect();
    const overlayArea = document.getElementById("overlayGameContainer")?.getBoundingClientRect();
    let clientRect = { width: window.innerWidth, height: window.innerHeight };


    let defaultPagesTemp = new Array(6);
    defaultPagesTemp.fill({
      primaryColor: "#8f001a",
      groupColor: "#FFF",
      personalColor: "#FFF",
      groupPositionRect: { h: 1080, scaleX: 1, scaleY: 1, w: 1920, x: 0, y: 0 },
      personalPositionRect: { h: 1080, scaleX: 1, scaleY: 1, w: 1920, x: 0, y: 0 },
      overlayColor: "#FFF",
      overlays: [],
      groupLayers: [],
      personalLayers: []
    });
    const defaultPages = defaultPagesTemp.map((page, index) => {
      return {
        ...page,
        name: "Page " + (index + 1)
      };
    });
    if ((canvas.state.pages).length === 0) {
      canvas.state.pages = defaultPages;
    }
    const areaString = canvas.state.overlayOpen ? "overlay" :
      (canvas.state.personalAreaOpen ? "personal" : "group");
    const page = canvas.state.pages[canvas.state.level - 1];
    const group = page?.groupPositionRect;
    const personal = page.personalPositionRect[canvas.state.rolelevel];
    const overlayI = canvas.state.overlayOpen ? page.overlays.findIndex(overlay =>
      overlay.id === canvas.state.overlayOpenIndex
    ) : null;
    const overlay = overlayI !== null ? page.overlays[overlayI].positionRect : null;
    let positionRect = null;
    if (areaString === "overlay") {
      positionRect = overlay;
      clientRect = overlayArea;
    } else if (areaString === "personal") {
      positionRect = personal;
      clientRect = personalArea;
    } else {
      positionRect = group;

    }
    if (mode === "play") {
      const positionWidth = (positionRect.w * positionRect.scaleX);
      const positionHeight = (positionRect.h * positionRect.scaleY);
      const isPersonalArea = areaString === "personal";
      const overlay = areaString === "overlay";
      let groupGameContainer = document.getElementById('groupGameContainer');
      let personalGameContainer = document.getElementById('personalGameContainer');
      let overlayGameContainer = document.getElementById('overlayGameContainer');
      // console.log(groupGameContainer, personalGameContainer, overlayGameContainer)
      // if(!groupGameContainer || !personalGameContainer || !overlayGameContainer) return;
      let area = {
        width: groupGameContainer.clientWidth - 70,
        height: groupGameContainer.clientHeight
      };

      if (areaString === "personal") {
        area = {
          width: personalGameContainer.clientWidth,
          height: personalGameContainer.clientHeight
        }
      }
      if (areaString === "overlay") {
        area = {
          width: overlayGameContainer.clientWidth,
          height: overlayGameContainer.clientHeight
        }
      }
      const viewableWidth = area.width;
      const viewableHeight = area.height;

      let scaleX = viewableWidth / (positionWidth);
      let scaleY = viewableHeight / (positionHeight);

      const scale = Math.min(scaleX, scaleY) / 1.01;
      // Calculate the center position relative to the viewable area
      const centerPositionX = (viewableWidth - (positionWidth * scale)) / 2;
      const centerPositionY = (viewableHeight - (positionHeight * scale)) / 2;

      canvas.setState({
        [`${areaString}LayerX`]: -positionRect.x * scale + centerPositionX,
        [`${areaString}LayerY`]: -positionRect.y * scale + centerPositionY,
        [`${areaString}CenterX`]: centerPositionX,
        [`${areaString}CenterY`]: centerPositionY,
        [`${areaString}LayerScale`]: scale,
        canvasLoading: false
      });
      return;
    }

    // Edit mode centering with no objects
    if (canvas.getLayers().length >= 0 && positionRect && clientRect && topBar && sidebar) {

      const positionWidth = (positionRect.w * positionRect.scaleX);
      const positionHeight = (positionRect.h * positionRect.scaleY);
      const isPersonalArea = areaString === "personal";
      const overlay = areaString === "overlay";


      const sideBarPadding = isPersonalArea || overlay ? 0 : sidebar.width;
      const topBarPadding = isPersonalArea || overlay ? 0 : topBar.height;

      // Account for sidebar and topBar in calculations
      const viewableWidth = clientRect.width - sideBarPadding;
      const viewableHeight = clientRect.height - topBarPadding;
      const padding = 10;

      // console.log(viewableWidth, viewableHeight, positionWidth, positionHeight)

      let scaleX = viewableWidth / (positionWidth + 2 * padding);
      let scaleY = viewableHeight / (positionHeight + 2 * padding);

      const scale = Math.min(scaleX, scaleY) / 1.1;

      // Calculate the center position relative to the viewable area
      const centerPositionX = (viewableWidth - (positionWidth * scale)) / 2;
      const centerPositionY = (viewableHeight - (positionHeight * scale)) / 2;
      // Log information for debugging

      canvas.setState({
        [`${areaString}LayerX`]: -positionRect.x * scale + centerPositionX,
        [`${areaString}LayerY`]: -positionRect.y * scale + centerPositionY,
        [`${areaString}LayerScale`]: scale,
        canvasLoading: false
      });

      return;
    }
  }

  // This gets the farthest left, top, right, and bottom coordinates of the objects
  // to create a bounding rectangle with coordinates
  const recalculateMaxMin = (isPersonalArea, overlay, sideMenuW, canvas, personalId, level) => {
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;
    for (let i = 0; i < savedObjects.length; i++) {
      const objectType = savedObjects[i];
      const objects = canvas.state[objectType];
      if (objects) {
        for (let j = 0; j < objects.length; j++) {
          const object = objects[j];
          if (
            object.infolevel === isPersonalArea &&
            object.overlay === overlay &&
            object.overlayIndex === canvas.state.overlayOpenIndex &&
            object.level === level
          ) {
            const rect = getRect(object, sideMenuW, isPersonalArea, canvas, personalId);
            if (!rect) continue;
            if (minX === null || minX > rect.x) {
              minX = rect.x;
            }
            if (minY === null || minY > rect.y) {
              minY = rect.y;
            }
            if (maxX === null || maxX < (rect.x + rect.width)) {
              maxX = (rect.x + rect.width);
            }
            if (maxY === null || maxY < (rect.y + rect.height)) {
              maxY = (rect.y + rect.height);
            }
          }
        }
      }
    }
    return {
      maxX: maxX,
      minX: minX,
      maxY: maxY,
      minY: minY
    }
  }

  // This gets the x, y, width & height of one specified object
  const getRect = (obj, sideMenuW, isPersonalArea, canvas, personalId) => {
    if (!obj) return;
    let rect = null;
    // Object is a drawing
    if (obj.tool) {
      if (obj.tool === "eraser") {
        return null;
      }
      let xMax = null;
      let yMax = null;
      let xMin = null;
      let yMin = null;
      // Points array has form [x1, y1, x2, y2, ...]
      // Every even index is start of new coord so skip by 2 each iteration
      const strokeW = parseInt(obj.strokeWidth);
      for (let k = 0; k < obj.points.length; k += 2) {
        const point = {
          x: obj.points[k],
          y: obj.points[k + 1],
        }
        if (xMax === null || point.x + (strokeW / 2) > xMax) {
          xMax = point.x + (strokeW / 2);
        }
        if (yMax === null || point.y + (strokeW / 2) > yMax) {
          yMax = point.y + (strokeW / 2);
        }
        if (xMin === null || point.x - (strokeW / 2) < xMin) {
          xMin = point.x - (strokeW / 2);
        }
        if (yMin === null || point.y - (strokeW / 2) < yMin) {
          yMin = point.y - (strokeW / 2);
        }
      }
      const lineW = xMax - xMin;
      const lineH = yMax - yMin;
      rect = {
        x: xMin,
        y: yMin,
        width: lineW,
        height: lineH
      }
    } else {
      // Get the actual reference if not a drawing
      obj = canvas.refs[obj.id];
      if (!obj) return;
      if (obj.nodeName === "DIV") {
        // Custom Object
        rect = obj.getBoundingClientRect();
        rect.x = rect.x - sideMenuW;
        if (!canvas.state.personalAreaOpen && isPersonalArea) {
          const pArea = document.getElementById(personalId).getBoundingClientRect();
          const yDiff = pArea.height - (window.innerHeight - pArea.y);
          rect.y = rect.y - yDiff;
        }
      } else {
        // Konva Object
        rect = obj.getClientRect();
      }
    }
    return rect;
  }

  /*-----------------------------------------------------/
   * OBJECT PROPS
   * The following functions return the props that
   * are used by the objects rendered to the canvasses.
   *----------------------------------------------------*/
  const isSelected = (id, canvas) => {
    return true;
    if (canvas.state.selectedShapeName === id) {
      return true;
    } else if (canvas.state.groupSelection.flat().some(obj => obj?.attrs?.id === id)) {
      return true;
    } else {
      return false;
    }
  }

  const defaultObjProps = (obj, canvas, editMode) => {
    return {
      key: obj.id,
      visible: canvas.state.canvasLoading ? false :
        (obj.visible && (!editMode ? canvas.checkObjConditions(obj.conditions) : true)),
      rotation: obj.rotation,
      ref: obj.ref,
      fill: obj.fill,
      opacity: obj.opacity,
      name: "shape",
      id: obj.id,
      x: obj.x,
      y: obj.y,
      lock: obj.lock,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      infolevel: obj.infolevel,
      overlay: obj.overlay,
      strokeScaleEnabled: true,
      draggable: editMode && !obj.lock ? !(canvas.state.layerDraggable || canvas.state.drawMode) : obj.draggable,
      editMode: editMode,
      onDragMove: (e) => canvas.onObjectDragMove(obj, e),
      ...(editMode ?
        {
          onClick: () => canvas.onObjectClick(obj),
          onTransformStart: canvas.onObjectTransformStart,
          onTransformEnd: () => canvas.onObjectTransformEnd(obj),
          onDragEnd: e => canvas.handleDragEnd(e, canvas.getObjType(obj.id), obj.ref)
        } : {
          onDragEnd: e => canvas.handleDragEnd(obj, e),
          userId: canvas.userId
        })
    }
  }


  const lineObjProps = (obj, canvas, editMode) => {
    return {
      key: obj.id,
      draggable: true,
      strokeEnabled: !canvas.state.canvasLoading,
      id: obj.id,
      name: "shape",
      ref: obj.ref,
      infolevel: obj.infolevel,
      level: obj.level,
      overlay: obj.overlay,
      overlayIndex: obj.overlayIndex,
      points: obj.points,
      rolelevel: obj.rolelevel,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth ? Math.max(obj.strokeWidth, 10) : 10,
      visible: obj.visible,
      opacity: obj.opacity,
      x: obj.x,
      y: obj.y,
      ...(editMode ?
        {
          onClick: () => canvas.onObjectClick(obj),
          onDragMove: (e) => canvas.onObjectDragMove(obj, e),
          onDragEnd: e => canvas.handleDragEnd(e, canvas.getObjType(obj.id), obj.ref),
          onContextMenu: canvas.onObjectContextMenu
        } : {}),

    }
  }


  const rectProps = (obj, canvas, editMode) => {
    return {
      width: obj.width,
      height: obj.height,

    }
  }



  const ellipseProps = (obj) => {
    return {
      radiusX: obj.radiusX,
      radiusY: obj.radiusY
    }
  }

  const imageProps = (obj, layer) => {
    return {
      src: obj.imgsrc,
      image: obj.imgsrc,
      layer: layer,

      width: obj.width,
      height: obj.height
    }
  }

  const deckProps = (obj, layer) => {
    return {
      src: obj.imgsrc,
      deck: obj.deck
    }
  }

  const videoProps = (obj, layer) => {
    return {
      type: "video",
      src: obj.vidsrc,
      autoStart: obj.autoStart,
      volume: obj.volume,
    }
  }

  const audioProps = (obj, layer) => {
    return {
      type: "audio",
      src: obj.audsrc,
      volume: obj.volume,
      autoStart: obj.autoStart,
      image: obj.imgsrc,
      layer: layer,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      width: obj.width,
      height: obj.height,
      fillPatternImage: true
    }
  }


  const documentProps = (obj, canvas) => {

    return {
      width: obj.width,
      height: obj.height,
      fillPatternImage: img,
      fillPatternScaleY: 1,
      fillPatternScaleX: 1,
      image: obj.image,
      onDblClick: () => canvas.onDocClick(obj)
    }
  }

  const triangleProps = (obj) => {
    return {
      width: obj.width,
      height: obj.height,
      sides: obj.sides
    }
  }

  const starProps = (obj) => {
    return {
      innerRadius: obj.innerRadius,
      outerRadius: obj.outerRadius,
      numPoints: obj.numPoints
    }
  }

  const textRectProps = (obj, canvas, editMode) => {
    return {
      width: obj.width,
      height: obj.height,
      fill: obj.backgroundColor,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      fontFamily: 'Calibri',
      ref: obj.ref,
      id: obj.id,
      padding: 5,
      align: 'center',
    }
  }

  const groupProps = (obj, canvas, editMode) => {
    return {
      x: obj.x,
      y: obj.y,
      draggable: editMode,
      opacity: obj.opacity,
      width: obj.width,
      key: obj.id,
      onDragMove: (e) => {
        const group = e.target;
        const newPosition = group.position();

        // update the obj's x and y values to match the new position
        obj.x = newPosition.x;
        obj.y = newPosition.y;
      },
    }
  }

  const textProps = (obj, canvas, editMode) => {
    // Load in the font if it hasn't been loaded yet
    if (!loadedFontsRef.current.includes(obj.fontFamily)) {
      WebFont.load({
        google: {
          families: [obj.fontFamily]
        },
        fontactive: (fontFamily, fvd) => {
          if (!loadedFontsRef.current.includes(obj.fontFamily)) {
            setLoadedFonts([...loadedFontsRef.current, fontFamily])
          }
        }
      });
    }
    return {
      textDecoration: obj.link ? "underline" : "",
      width: obj.width,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize * (parseFloat(localSettings.textsize) || 1),
      text: editMode ? obj.text : canvas.formatTextMacros(true, obj.text),
      link: obj.link,
      ...(editMode ?
        {
          onTransform: canvas.handleTextTransform,
          onDblClick: () => {
            canvas.handleTextDblClick(
              canvas.refs[obj.ref],
              obj.infolevel ? canvas.refs[`personalAreaLayer.objects`] :
                (obj.overlay ? canvas.refs[`overlayAreaLayer.objects`] : canvas.refs[`groupAreaLayer.objects`])
            )
          },
          onContextMenu: (e) => {
            canvas.onObjectContextMenu(e);
            canvas.setState({
              selectedFont: canvas.refs[obj.ref]
            });
          }
        } : {})
    }
  }

  const pencilProps = (obj, index, canvas, editMode) => {
    return {
      id: obj.id,
      name: obj.name,
      ref: obj.ref,
      key: index,
      visible: canvas.state.canvasLoading ? false : true,
      level: obj.level,
      points: obj.points,
      stroke: obj.color,
      strokeWidth: obj.strokeWidth,
      tension: 0.5,
      lineCap: "round",
      globalCompositeOperation: obj.tool === 'eraser' ? 'destination-out' : 'source-over',
      draggable: false,
      ...(editMode ?
        {
          onContextMenu: canvas.onObjectContextMenu
        } : {})
    }
  }

  const guideProps = (obj, index) => {
    return {
      name: "guide",
      visible: true,
      key: index,
      pos: obj.pos,
      points: obj.points,
      stroke: obj.pos === "center" ? "blue" : "red",
      strokeWidth: 1,
      strokeScaleEnabled: false,
      // globalCompositeOperation: 'source-over',
      draggable: false,
      dash: [5, 5]
    }
  }

  const arrowProps = (obj, index, canvas, editMode) => {
    return {
      key: index,
      visible: obj.visible,
      ref: obj.ref,
      id: obj.id,
      name: "arrow",
      points: [
        obj.points[0],
        obj.points[1],
        obj.points[2],
        obj.points[3]
      ],
      stroke: obj.stroke,
      fill: obj.fill,
      draggable: !canvas.state.layerDraggable,
      ...(editMode ?
        {
          onDragEnd: () => canvas.onDragEndArrow(obj)
        } : {})
    }
  }

  const transformerProps = (type, canvas) => {
    return {
      selectedShapeName: canvas.state.selectedShapeName,
      refs: canvas.refs,
      ref: type + "Transformer",
      setState: canvas.setState,
      state: canvas.state,
      boundBoxFunc: (oldBox, newBox) => {
        // Limit resize
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }
    }
  }

  const objectIsOnStage = (obj, canvas) => {
    if (obj.level === canvas.state.level && obj.overlay) {
      return "overlay" + obj.overlayIndex;
    } else if (obj.level === canvas.state.level && obj.infolevel === false) {
      return "group";
    } else if (obj.level === canvas.state.level && obj.infolevel === true && obj.rolelevel === canvas.state.rolelevel) {
      return "personal";
    } else {
      return "";
    }
  }

  const customObjProps = (obj, canvas) => {
    return {
      draggable: true,
      onTop: obj.onTop,
      objectSnapping: canvas.objectSnapping,
      zIndex: obj.zIndex,
      onDragMove: (e) => canvas.onObjectDragMove(obj, e),
      onMouseUp: (e) => canvas.handleMouseUp(e, false),
      onMouseDown: (e) => canvas.onMouseDown(e, false),
      onMouseMove: (e) => canvas.handleMouseOver(e, false),
      onTransformEnd: (e) => canvas.onObjectTransformEnd(e)
    };
  }

  const htmlProps = (obj) => ({
    iframeSrc: obj.iframeSrc,
    htmlValue: obj.htmlValue || "<h1>Edit me!</h1>",
    containerWidth: obj.containerWidth,
    containerHeight: obj.containerHeight,
    varName: obj.varName,
    varInterval: obj.varInterval || false,
    varEnable: obj.varEnable || false,
    sync: obj.sync || false
  });

  const inputProps = (obj, canvas) => {
    let style = obj.style;
    if(!style) style = {};
    if (!style.backgroundColor) 
      style.backgroundColor = obj.fill;
    if (!style.color) 
      style.color = obj.textColor;

    if (!style.borderColor) 
      style.borderColor = obj.stroke;
    
    if (!style.borderWidth) 
      style.borderWidth = 1;
    

    return {
      style: style,
      varType: obj.varType,
      varName: obj.varName,
      varValue: obj.varValue,
      varOne: obj.varOne,
      conEquals: obj.conEquals,
      varTwo: obj.varTwo,
      math: obj.math,
      amount: obj.amount,
      variableAmount: obj.variableAmount,
      conditionAmount: obj.conditionAmount,
      varCon: obj.varCon,
      incr: obj.incr,
      radioText: obj.radioText,
      refresh: canvas.refresh,
      label: obj.label,
      sync: obj.sync || true,
      conditional: obj.conditional,
    }
  }

  const timerProps = (obj, canvas, editMode) => ({
    timeLimit: obj.timeLimit,
    varName: obj.varName,
    varEnable: obj.varEnable,
    refresh: canvas.refresh,
    invisible: obj.invisible && !editMode,
    controls: obj.controls,
    sync: obj.sync,
  });

  const layerProps = (canvas, stage, id) => ({
    ref: `${stage}AreaLayer.${id}`,
    name: stage,
    key: id,
    scaleX: canvas.state[`${stage}LayerScale`],
    scaleY: canvas.state[`${stage}LayerScale`],
    x: canvas.state[`${stage}LayerX`],
    y: canvas.state[`${stage}LayerY`],
    //height: window.innerHeight,
    //width: window.innerWidth,
    draggable: canvas.state.layerDraggable,
    onDragMove: (e) => canvas.dragLayer(e, false)
  });

  const richTextProps = (obj, canvas, editMode) => {
    return {
      editMode: editMode,
      selected: canvas.state.selectedShapeName === obj.id,
      editorState: obj.editorState,
      stateWithMacros: editMode ? null : canvas.formatTextMacros(false, obj.editorState),
      isDraggable: editMode ? obj.draggable : false,
      ...(editMode ?
        {
          setDraggable: (data) => {
            canvas.setCustomObjData("richTexts", "draggable", data, obj.id);
          },
          setEditorState: (data) => {
            canvas.setCustomObjData("richTexts", "editorState", data, obj.id);
          }
        } : {})
    };
  }

  const positionRectProps = (canvas, stage) => {
    const page = canvas.state.pages[canvas.state.level - 1];
    const group = page.groupPositionRect;
    const personal = page.personalPositionRect[canvas.state.rolelevel];
    const overlayI = canvas.state.overlayOpen ? page.overlays.findIndex(overlay =>
      overlay.id === canvas.state.overlayOpenIndex
    ) : null;
    const overlay = overlayI !== null ? page.overlays[overlayI].positionRect : null;

    let positionRect = null;
    if (stage === "group") {
      positionRect = group;
    } else if (stage === "personal") {
      positionRect = personal;
    } else {
      positionRect = overlay;
    }
    if (positionRect === undefined) return {};

    return {
      label: {
        text: `${Math.round(positionRect.w * positionRect.scaleX)} x ${Math.round(positionRect.h * positionRect.scaleY)}`,
        fontSize: 20,
        fill: "#808080",
        padding: 10,
        x: positionRect.x,
        y: positionRect.y
      },
      scaleX: positionRect.scaleX,
      scaleY: positionRect.scaleY,
      width: positionRect.w,
      height: positionRect.h,
      x: positionRect.x,
      y: positionRect.y,
      listening: false,
      onTransform: (e) => {
        const scaleX = e.target.scaleX();
        const scaleY = e.target.scaleY();
        const x = e.target.x();
        const y = e.target.y();
        const newPage = { ...page };
        const newRect = {
          ...positionRect,
          x: x,
          y: y,
          scaleX: scaleX,
          scaleY: scaleY,
        };
        if (stage === "group") {
          newPage.groupPositionRect = newRect;
        } else if (stage === "personal") {
          newPage.personalPositionRect[canvas.state.rolelevel] = newRect;
        } else {
          newPage.overlays[overlayI].positionRect = newRect;
        }
        const newPages = [...canvas.state.pages];
        newPages[canvas.state.level - 1] = newPage;
        canvas.setState({
          pages: newPages
        });
      }
    }
  }

  const pollProps = (obj, canvas, editMode) => {
    return {
      custom: {
        performanceEnabled: obj.performanceEnabled,
        customName: obj.customName,
        pollJson: obj.json,
        varName: obj.varName,
      },
      ...(!editMode ?
        {
          userId: canvas.userId
        } : {})
    };
  }

  const insertNodeAfter = (newNode, existingNode) => {

  }

  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /*-------------------------------------------------------------/
   * RENDER FUNCTION
   * This renders the objects with their props to the canvasses.
   *------------------------------------------------------------*/
  const maxCanvasScaleFactor = 1000;
  const canvasX = -(maxCanvasScaleFactor / 2) * window.innerWidth;
  const canvasY = -(maxCanvasScaleFactor / 2) * window.innerHeight;
  const canvasW = window.innerWidth * maxCanvasScaleFactor;
  const canvasH = window.innerHeight * maxCanvasScaleFactor;


  const renderObject = (obj, index, canvas, editMode, type, stage) => {
    const layer = canvas.refs[`${stage}AreaLayer.objects`];
    if (Object.keys(canvas.refs).length === 0) return null; //important! prevents render before canvas is ready

    switch (type) {
      case "rectangles":
        return <Rect {...defaultObjProps(obj, canvas, editMode)} {...rectProps(obj, canvas, editMode)} {...canvas.getDragProps(obj.id)} />;
      case "ellipses":
        return <Ellipse {...defaultObjProps(obj, canvas, editMode)} {...ellipseProps(obj)} {...canvas.getDragProps(obj.id)} />;
      case "pencils":
        return <Line {...pencilProps(obj, index, canvas, editMode)} />;
      case "images":
        return <URLImage {...defaultObjProps(obj, canvas, editMode)} {...imageProps(obj, layer)} {...canvas.getInteractiveProps(obj.id)} {...canvas.getDragProps(obj.id)} canvas={canvas} stage={stage} />;
      case "videos":
        return <URLVideo
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...videoProps(obj, canvas)}
          {...canvas.getVariableProps()}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "audios":
        return <URLVideo
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...audioProps(obj, canvas)}
          {...canvas.getVariableProps()}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "documents":
        return <URLDocument
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...documentProps(obj, canvas)}
          {...(editMode ? customObjProps(obj, canvas) : {})} />
      case "triangles":
        return <RegularPolygon {...defaultObjProps(obj, canvas, editMode)} {...triangleProps(obj)}  {...canvas.getDragProps(obj.id)} />;
      case "stars":
        return <Star {...defaultObjProps(obj, canvas, editMode)} {...starProps(obj)} {...canvas.getDragProps(obj.id)} />;
      case "texts":
        return <Text {...defaultObjProps(obj, canvas, editMode)} {...textProps(obj, canvas, editMode)} {...canvas.getDragProps(obj.id)} />;
      // return (
      //   <Group {...groupProps(obj, canvas, editMode)}>
      //     <Rect {...textRectProps(obj, canvas, editMode)} />
      //     <Text {...textProps(obj, canvas, editMode)} {...canvas.getDragProps(obj.id)} />
      //   </Group>
      // );
      case "lines":
        return <Line {...lineObjProps(obj, canvas, editMode)} />;
      case "richTexts":
        return <RichText
          defaultProps={{
            ...defaultObjProps(obj, canvas, editMode),
            ...richTextProps(obj, canvas, editMode)
          }}
          {...canvas.getInteractiveProps(obj.id)}
          {...defaultObjProps(obj, canvas, editMode)}
          {...richTextProps(obj, canvas, editMode)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "polls":
        return <Poll
          defaultProps={{
            ...defaultObjProps(obj, canvas, editMode),
            ...pollProps(obj, canvas, editMode)
          }}
          {...canvas.getVariableProps()}
          {...canvas.getInteractiveProps(obj.id)}
          {...defaultObjProps(obj, canvas, editMode)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "connect4s":
        return <Connect4
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "tics":
        return <TicTacToe
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "decks":
        return <Deck
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...canvas.getDragProps(obj.id)}
          {...deckProps(obj, canvas)}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
          {...canvas.getVariableProps()}
        />;
      case "dice":
        return <Dice
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "htmlFrames":
        return <HTMLFrame
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getVariableProps()}
          {...htmlProps(obj)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      case "timers":
        return <Timer
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getVariableProps()}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(obj, canvas) : {})}
          {...timerProps(obj, canvas, editMode)}
        />;
      case "inputs":
        return <Input
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...inputProps(obj, canvas)}
          {...canvas.getVariableProps()}
          {...canvas.getPageProps()}
          {...(editMode ? customObjProps(obj, canvas) : {})}
        />;
      default:
        return null;
    }
  }

  const deepDiff = (obj1, obj2, path = "") => {
    if (obj1 === obj2) return;

    if (typeof obj1 !== "object" || typeof obj2 !== "object") {
      console.log(`Difference at ${path}: ${obj1} vs ${obj2}`);
      return;
    }

    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (let key of keys) {
      deepDiff(obj1[key], obj2[key], path ? `${path}.${key}` : key);
    }

    return 'No Diff';
  }


  const loadObjects = (stage, mode, moving, editState) => {
    const editMode = mode === "edit";

    let canvas = getUpdatedCanvasState(mode, editState);

    if (editMode) {
      canvas.state = editState.state
      canvas.refs = editState.refs
    }



    const checkStage = stage === "overlay" ? stage + canvas.state.overlayOpenIndex : stage;
    if (!canvas || !canvas.state || !canvas.refs) {
      return (
        <>
        </>
      );
    }

    // Get the positionRect
    const page = canvas.state.pages[canvas.state.level - 1];
    if (!page) {
      return;
    }
    const group = page.groupPositionRect;
    const personal = page.personalPositionRect[canvas.state.rolelevel];
    const overlayI = canvas.state.overlayOpen ? page.overlays.findIndex(overlay =>
      overlay.id === canvas.state.overlayOpenIndex
    ) : null;

    const overlay = overlayI !== null ? page.overlays[overlayI].positionRect : null;
    let positionRect = null;
    if (stage === "group") {
      positionRect = group;
    } else if (stage === "personal") {
      positionRect = personal;
    } else {
      positionRect = overlay;
    }

    if (!page) return null;

    let objectIds = [];
    if (stage === "group") {
      objectIds = page.groupLayers;
    } else if (stage === "personal") {
      objectIds = page.personalLayers;
    } else {
      if (canvas.state.overlayOpenIndex === -1) {
        return;
      }
      const overlay = page.overlays.find(overlay => overlay.id === canvas.state.overlayOpenIndex)
      objectIds = overlay.layers;
    }

    objectIds = [objectIds.filter(id => id && id.includes("pencils")), ...objectIds.filter(id => id && !id.includes("pencils"))];


    let inputIds = [];
    let newObject = []

    for (let i = 0; i < objectIds.length; i++) {
      if (objectIds[i].includes('inputs')) {
        inputIds.push(objectIds[i]);
      } else {
        newObject.push(objectIds[i]);
      }
    }

    inputIds = [...new Set(inputIds)]
    newObject = [...new Set(newObject)]
    objectIds = [[...newObject], [...inputIds]]


    return (
      <>
        <Layer {...layerProps(canvas, stage, "objects")}>
          {/* This Rect is for dragging the canvas */}
          {editMode && (
            <>
              <Rect
                id="ContainerRect"
                x={canvasX}
                y={canvasY}
                height={canvasH}
                width={canvasW}
              // Canvas Drag Rect Outline - FOR DEBUGGING
              // stroke={"red"}
              // strokeWidth={2}
              // strokeScaleEnabled={false}
              />
            </>
          )}


          {/* Puts a red circle at the origin (0, 0) - FOR DEBUGGING */}
          {/*
            <Ellipse
              fill={"red"}
              x={0}
              y={0}
              radius={{
                x: 10,
                y: 10
              }}
            />
            */}

          {/* Render the objects in the layer */}

          {objectIds.map(subArray => {
            let out = []
            subArray.map((id, index) => {
              if (id.length > 0) {
                const type = id.replace(/\d+$/, "");
                const obj = canvas.state[type].filter(obj => obj?.id === id)[0];
                if (obj && objectIsOnStage(obj, canvas))
                  out.push(renderObject(obj, index, canvas, editMode, type, stage))
              }
            });
            return out
          })}
        </Layer>
        <Layer {...layerProps(canvas, stage, "dragging")}>
          {editMode && (
            <>
              {canvas.state.arrows.map((obj, index) => {
                return (
                  !obj.from &&
                  !obj.to &&
                  obj.level === canvas.state.level &&
                  obj.infolevel === (stage === "personal")
                ) ?
                  <Arrow {...arrowProps(obj, index, canvas, editMode)} /> : null
              })}

              {/* This is the stage container (positionRect) */}
              {positionRect && (
                <>
                  <Shape
                    sceneFunc={(ctx) => {
                      // Make background
                      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
                      ctx.fillRect(canvasX + 100000, canvasY, canvasH, canvasW);

                      // Make the hole
                      ctx.clearRect(
                        positionRect.x,
                        positionRect.y,
                        positionRect.w * positionRect.scaleX,
                        positionRect.h * positionRect.scaleY
                      );
                    }}
                    listening={false}
                  />
                  <Rect
                    ref={
                      canvas.state.personalAreaOpen ? positionRectPersonalRef : (canvas.state.overlayOpen ? positionRectOverlayRef : positionRectRef)
                    }
                    {...positionRectProps(canvas, stage)}
                  />
                  <Text
                    {...positionRectProps(canvas, stage).label}
                  />

                  <Transformer
                    nodes={
                      (positionRectRef.current ? [positionRectRef.current] : positionRectOverlayRef.current ?
                        [positionRectOverlayRef.current] : positionRectPersonalRef.current && canvas.state.personalAreaOpen ?
                          [positionRectPersonalRef.current] : [])
                    }
                    name="transformer"
                    keepRatio={false}
                    rotateEnabled={false}
                    anchorStroke={'white'}
                    anchorFill={'black'}
                    anchorSize={10}
                    anchorCornerRadius={5}
                    borderStrokeWidth={2}
                    borderStroke={'white'}
                    borderDash={[3, 3]}
                    flipEnabled={false}
                  />
                </>
              )}
              {canvas.state.guides.map((obj, index) => {
                return <Line {...guideProps(obj, index, canvas, editMode)} />
              })}
              {/* This is the blue transformer rectangle that pops up when objects are selected */}
              <TransformerComponent {...transformerProps(stage, canvas)} />
              <Rect fill="rgba(0,0,0,0.5)" ref={`${stage}SelectionRect`} />
            </>
          )}
        </Layer>
      </>
    );

    /*if (objectIdsNoPencils.filter(id =>
      id.length > 0 && customObjects.some(obj =>
        id.startsWith(obj)
      )
    ).length == 0 && newLayers) setPrevLayers(objectIdsNoPencils);
  
    return returnValue;*/
  }

  return (
    <Suspense fallback={<Loading />}>
      {props.edit ? (

        <EditPage
          loadObjects={loadObjects}
          reCenter={reCenterObjects}
          setGameEditProps={setGameEditProps}
          customObjects={customObjects}
          savedObjects={savedObjects}
          customDeletes={customDeletes}
          allDeletes={allDeletes}
          {...props}
        />
      ) : (
        <GamePage
          canvasHeights={playModeCanvasHeights}
          customObjectsLabels={customObjects}
          loadObjects={loadObjects}
          reCenter={reCenterObjects}
          setGamePlayProps={setGamePlayProps}
          savedObjects={savedObjects}
          random={Math.random()}
          {...props}
        />
      )}
    </Suspense>
  );
}

export default CanvasPage;