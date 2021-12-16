import React, { Suspense, useState, useRef, useContext } from "react";
import { SettingsContext } from "../App";
import Loading from "../components/Loading/Loading";
import WebFont from "webfontloader";

import TransformerComponent from "../components/Stage/TransformerComponent";
import URLVideo from "../components/Stage/URLVideos";
import URLImage from "../components/Stage/URLImage";
import TicTacToe from "../components/Stage/GamePieces/TicTacToe/TicTacToe";
import Connect4 from "../components/Stage/GamePieces/Connect4/Board";
import Poll from "../components/Stage/GamePieces/Poll/Poll";
import HTMLFrame from "../components/Stage/GamePieces/HTMLFrame";
import JSRunner from "../components/Stage/GamePieces/JSRunner";
import Timer from "../components/Stage/GamePieces/Timer";
import Input from "../components/Stage/GamePieces/Input";

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
  Layer
} from "react-konva";

const CanvasPage = (props) => {

  const { settings: localSettings } = useContext(SettingsContext);

  /*------------------------------------------------------------------------------/
    * CANVAS FUNCTIONS
    * The following functions are used on both Edit Mode and Play Mode in order to
    * render the canvasses. They are passed down from here to both canvasses.
    *------------------------------------------------------------------------------*/

  // Save State
  // These are the names of the objects in state that are saved to the database
  const customObjects = props.customObjects;
  const konvaObjects = [
    "rectangles",
    "ellipses",
    "stars",
    "texts",
    "triangles",
    "images",
    "videos",
    "audios",
    "documents",
    "lines",
    "pencils" // The drawings
  ];
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

  const getUpdatedCanvasState = (mode) => {
    if (mode === "edit") {
      return gameEditPropsRef.current;
    } else if (mode === "play") {
      return gamePlayPropsRef.current;
    } else {
      return null;
    }
  }

  const [prevLayers, setPrevLayers] = useState([]);

  /*-------------------------------------------------------------------------------------------/
   * RECENTER OBJECTS
   * The following functions are used to reposition the objects so they all fit on the canvas
   *------------------------------------------------------------------------------------------*/
  const reCenterObjects = (mode, layer) => {
    let canvas = getUpdatedCanvasState(mode);
    if (!canvas) {
      return;
    }

    // Runs for personal and group area
    const _reCenterObjects = (isPersonalArea, mode, overlay) => {
      if (
        !(canvas &&
          canvas.setState &&
          canvas.state &&
          canvas.refs)
      ) {
        return;
      }

      const areaString = isPersonalArea ? "personal" : (overlay ? "overlay" : "group");
      if (mode === "play" && document.getElementById(`${areaString}GameContainer`)) {
        document.getElementById(`${areaString}GameContainer`).scrollTop = 0;
      }
      // Reset to default position and scale
      canvas.setState({
        [`${areaString}LayerX`]: 0,
        [`${areaString}LayerY`]: 0,
        [`${areaString}LayerScale`]: 1
      }, () => setTimeout(() => {
        canvas = getUpdatedCanvasState(mode);

        const personalId = mode === "edit" ? "editPersonalContainer" : "personalGameContainer";
        const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
        const sidebar = document.getElementsByClassName("grid-sidebar")[0].getBoundingClientRect();
        const personalArea = document.getElementById(personalId).getBoundingClientRect();
        const topBar = document.getElementById("levelContainer").childNodes[0].getBoundingClientRect();
        const sideMenuW = (isPersonalArea || overlay) ? personalArea.x : (isPortraitMode ? 0 : sidebar.width);
        const topMenuH = overlay ? 20 : (isPersonalArea ? 80 : topBar.height);
        const padding = 80;
        const doublePad = 2 * padding;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const availableW = isPersonalArea ? personalArea.width - doublePad : screenW - sideMenuW - doublePad;
        const availableH = isPersonalArea ? personalArea.height - topMenuH - doublePad : screenH - topMenuH - doublePad;
        const availableRatio = availableW / availableH;
        const level = canvas.state.level;

        let { minX, maxX, minY, maxY } = recalculateMaxMin(isPersonalArea, overlay, sideMenuW, canvas, personalId, level);
        if (!minX && !maxX && !minY && !maxY) {
          minX = maxX = minY = maxY = 1;
        }
        if (minX && maxX && minY && maxY) {
          let x = null;
          let y = null;
          let scale = null;
          const contentW = maxX - minX;
          const contentH = maxY - minY;
          const contentRatio = contentW / contentH;
          if (availableRatio > contentRatio && mode !== "play") {
            // Content proportionally taller
            scale = availableH / contentH;
          } else {
            // Content proportionally wider
            scale = availableW / contentW;
          }
          x = -minX * scale;
          y = -minY * scale;
          const scaleDown = 0.85;
          if (scale === Infinity) {
            // There is nothing on the canvas
            x = 0;
            y = 0;
            scale = 1;
          }
          // Scale and fit to top leftR
          canvas.setState({
            [`${areaString}LayerX`]: x,
            [`${areaString}LayerY`]: y + topMenuH,
            [`${areaString}LayerScale`]: scale
          }, () => setTimeout(() => {
            canvas = getUpdatedCanvasState(mode);

            if (mode === "play") {
              // Adjust the canvas container height (scroll-y will automatically appear if needed)
              const canvasH = Math.max((contentH * scale) + (topMenuH * 2) + padding, window.innerHeight);

              // Run this after a timeout so the DOM is fully loaded when checking lengths
              setTimeout(() => {
                // If group area scroll bar, move overlay buttons left
                const overlayButtons = [].slice.call(document.getElementsByClassName("overlayButton"));
                const groupArea = document.getElementById("groupGameContainer");
                if (
                  groupArea &&
                  groupArea.clientHeight < groupArea.scrollHeight
                ) {
                  overlayButtons.map(btn => {
                    btn.style.right = `20px`;
                  });
                } else if (groupArea) {
                  overlayButtons.map(btn => {
                    btn.style.right = `5px`;
                  });
                }

                // If personal area scroll bar, move personal toggle left
                const personalToggle = document.getElementById("personalInfoContainer");
                const personalArea = document.getElementById("personalGameContainer");
                if (
                  personalToggle && personalArea &&
                  personalArea.clientHeight < personalArea.scrollHeight &&
                  canvas.state.personalAreaOpen
                ) {
                  personalToggle.style.paddingRight = "25px";
                } else if (personalToggle) {
                  personalToggle.style.paddingRight = "10px";
                }

                // If overlay area scroll bar, move overlay exit icon left
                const overlayCloseBtn = document.getElementById("overlayCloseButton");
                const overlayArea = document.getElementById("overlayGameContainer");
                if (
                  overlayArea && overlayCloseBtn &&
                  overlayArea.clientHeight < overlayArea.scrollHeight &&
                  canvas.state.overlayOpen
                ) {
                  overlayCloseBtn.style.right = "25px";
                } else if (overlayCloseBtn) {
                  overlayCloseBtn.style.right = "10px";
                }
              }, 0);

              const newHeight = availableRatio * scaleDown > contentRatio ? canvasH : null;
              setPlayModeCanvasHeights({
                overlay: areaString === "overlay" ? newHeight : 0,
                personal: areaString === "personal" ? newHeight : 0,
                group: areaString === "group" ? newHeight : 0,
              });
            }

            const leftPadding = contentW * scale * (100 / window.innerWidth);

            // Center contents
            if (availableRatio > contentRatio) {
              y = 40;
              x = mode === "play" ? (areaString === "group" ? sideMenuW : 0) + leftPadding :
                sideMenuW + (availableW - (contentW * scale)) / 2;
            } else {
              y = (availableH - (contentH * scale)) / 2;
              x = mode === "play" ? (areaString === "group" ? sideMenuW : 0) + leftPadding : leftPadding;
            }
            canvas.setState({
              [`${areaString}LayerX`]: canvas.state[`${areaString}LayerX`] + x,
              [`${areaString}LayerY`]: canvas.state[`${areaString}LayerY`] + y,
              canvasLoading: false
            });
          }, 0));
        } else {
          canvas.setState({
            canvasLoading: false,
          });
        }
      }, 0));
    }
    if ((!layer || layer === "group") && !canvas.state.overlayOpen && !canvas.state.personalAreaOpen) {
      _reCenterObjects(false, mode, false);
    }
    if ((!layer || layer === "overlay") && canvas.state.overlayOpen) {
      _reCenterObjects(false, mode, true);
    }
    if ((!layer || layer === "personal") && !canvas.state.overlayOpen && canvas.state.personalAreaOpen) {
      _reCenterObjects(true, mode, false);
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
  const defaultObjProps = (obj, canvas, editMode) => {
    return {
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
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      infolevel: obj.infolevel,
      overlay: obj.overlay,
      strokeScaleEnabled: true,
      draggable: editMode ? !(canvas.state.layerDraggable || canvas.state.drawMode) : false,
      editMode: editMode,
      ...(editMode ?
        {
          onClick: () => canvas.onObjectClick(obj),
          onTransformStart: canvas.onObjectTransformStart,
          onTransformEnd: () => canvas.onObjectTransformEnd(obj),
          onDragMove: (e) => canvas.onObjectDragMove(obj, e),
          onDragEnd: e => canvas.handleDragEnd(e, canvas.getObjType(obj.id), obj.ref),
          onContextMenu: canvas.onObjectContextMenu
        } : {})
    }
  }

  const lineObjProps = (obj, index, canvas, editMode) => {
    return {
      key: index,
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
        } : {})
    }
  }

  const rectProps = (obj) => {
    return {
      width: obj.width,
      height: obj.height,
      fillPatternImage: obj.fillPatternImage,
      fillPatternOffset: obj.fillPatternOffset,
      image: obj.image
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
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      width: obj.width,
      height: obj.height
    }
  }

  const videoProps = (obj, layer) => {
    return {
      temporary: obj.temporary,
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

  const audioProps = (obj, layer) => {
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

  const documentProps = (obj, canvas) => {
    return {
      width: obj.width,
      height: obj.height,
      fillPatternImage: canvas.state.docimage,
      fillPatternOffset: obj.fillPatternOffset,
      fillPatternScaleY: 0.2,
      fillPatternScaleX: 0.2,
      image: obj.image
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
      text: editMode ? obj.text : canvas.formatTextMacros(obj.text),
      link: obj.link,
      ...(editMode ?
        {
          onTransform: canvas.handleTextTransform,
          onDblClick: () => canvas.handleTextDblClick(
            canvas.refs[obj.ref],
            obj.infolevel ? canvas.refs[`personalAreaLayer.main`] :
              (obj.overlay ? canvas.refs[`overlayAreaLayer.main`] : canvas.refs[`groupAreaLayer.main`])
          ),
          onContextMenu: (e) => {
            canvas.onObjectContextMenu(e);
            canvas.setState({
              selectedFont: canvas.refs[obj.ref]
            });
          }
        } : {})
    }
  }

  const lineProps = (obj, index, canvas, editMode) => {
    return {
      id: obj.id,
      visible: canvas.state.canvasLoading ? false : true,
      level: obj.level,
      key: index,
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
      globalCompositeOperation: 'source-over',
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

  const customObjProps = (canvas) => {
    return {
      objectSnapping: canvas.objectSnapping,
      onMouseUp: (e) => canvas.handleMouseUp(e, false),
      onMouseDown: (e) => canvas.onMouseDown(e, false),
      onMouseMove: (e) => canvas.handleMouseOver(e, false),
      onTransformEnd: (e) => canvas.onObjectTransformEnd(e),
      updateKonva: canvas.getKonvaObj
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

  const inputProps = (obj, canvas) => ({
    style: obj.style,
    varType: obj.varType,
    varName: obj.varName,
    refresh: canvas.refresh,
    label: obj.label,
    sync: obj.sync
  })

  const timerProps = (obj, canvas, editMode) => ({
    timeLimit: obj.timeLimit,
    varName: obj.varName,
    varEnable: obj.varEnable,
    refresh: canvas.refresh,
    invisible: obj.invisible && !editMode,
    controls: obj.controls
  });

  const layerProps = (canvas, stage, id) => ({
    ref: `${stage}AreaLayer.${id}`,
    name: stage,
    key: id,
    scaleX: canvas.state[`${stage}LayerScale`],
    scaleY: canvas.state[`${stage}LayerScale`],
    x: canvas.state[`${stage}LayerX`],
    y: canvas.state[`${stage}LayerY`],
    height: window.innerHeight,
    width: window.innerWidth,
    draggable: canvas.state.layerDraggable,
    onDragMove: (e) => canvas.dragLayer(e, false)
  });

  const pollProps = (obj, canvas, editMode) => {
    return {
      custom: {
        performanceEnabled: obj.performanceEnabled,
        customName: obj.customName,
        pollJson: obj.json
      },
      ...(!editMode ?
        {
          userId: canvas.userId
        } : {})
    };
  }

  // Copied from:
  // https://css-tricks.com/converting-color-spaces-in-javascript/
  const hexToHSLLightness = (H) => {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
      r = "0x" + H[1] + H[1];
      g = "0x" + H[2] + H[2];
      b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
      r = "0x" + H[1] + H[2];
      g = "0x" + H[3] + H[4];
      b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

    if (delta == 0)
      h = 0;
    else if (cmax == r)
      h = ((g - b) / delta) % 6;
    else if (cmax == g)
      h = (b - r) / delta + 2;
    else
      h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
      h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    //return "hsl(" + h + "," + s + "%," + l + "%)";
    return l;
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

  const renderGrid = (canvas, stage) => {
    const layerX = canvas.state[`${stage}LayerX`];
    const layerY = canvas.state[`${stage}LayerY`];
    const layerScale = canvas.state[`${stage}LayerScale`];
    const layerColor = canvas.state.pages[canvas.state.level - 1][`${stage}Color`];
    if (!layerColor) return;
    const layerLightness = hexToHSLLightness(layerColor);

    const horizontalLinesNum = maxCanvasScaleFactor * 100;
    const ratio = canvasW / canvasH;
    const verticalLinesNum = Math.floor(horizontalLinesNum * ratio);
    const expoZoom = layerScale.toExponential(0);
    const small = parseInt(expoZoom.substring(0, 1));
    const large = parseInt(expoZoom.substring(2, 4));
    const zoomVal = -large + ((10 - small) / 10);
    const mod = 2 * Math.floor(Math.pow(7, zoomVal));

    // Calculate the start index for horizontal lines
    let startingIndexH = 0;
    let endingIndexH = 0;
    const distanceBetweenLinesH = canvasH / horizontalLinesNum;
    if (layerY < 0) {
      // Below the x-axis
      startingIndexH = Math.floor((-layerY / layerScale) / distanceBetweenLinesH + (horizontalLinesNum / 2));
      endingIndexH = Math.ceil(((-layerY + window.innerHeight) / layerScale) / distanceBetweenLinesH + (horizontalLinesNum / 2));
    } else {
      // Above the x-axis
      startingIndexH = Math.floor(((layerY - window.innerHeight) / layerScale) / distanceBetweenLinesH);
      endingIndexH = Math.ceil(((layerY + window.innerHeight) / layerScale) / distanceBetweenLinesH);
    }
    const numOfLinesBetweenH = endingIndexH - startingIndexH;
    const linesArrH = [...Array(numOfLinesBetweenH)].map((num, i) => {
      return i + startingIndexH;
    });

    // Calculate the start index for vertical lines
    let startingIndexV = 0;
    let endingIndexV = 0;
    const distanceBetweenLinesV = canvasW / verticalLinesNum;
    if (layerX < 0) {
      // Right of y-axis
      startingIndexV = Math.floor(((-layerX - window.innerWidth) / layerScale) / distanceBetweenLinesV + (verticalLinesNum / 2));
      endingIndexV = Math.ceil(((-layerX + window.innerWidth)) / layerScale / distanceBetweenLinesV + (verticalLinesNum / 2));
    } else {
      // Left of y-axis
      startingIndexV = Math.floor(((layerX - window.innerWidth) / layerScale) / distanceBetweenLinesV);
      endingIndexV = Math.ceil(((layerX + window.innerWidth) / layerScale) / distanceBetweenLinesV);
    }
    const numOfLinesBetweenV = endingIndexV - startingIndexV;
    const linesArrV = [...Array(numOfLinesBetweenV)].map((num, i) => {
      return i + startingIndexV;
    });

    return (
      <>
        {linesArrH.map((i) => {
          if (i % mod === 0) {
            const sign = i < (horizontalLinesNum / 2) ? -1 : 1;
            const y = sign * (i - (sign > 0 ? Math.ceil(horizontalLinesNum / 2) : 0)) * (canvasH / horizontalLinesNum);
            if (
              y > (-layerY / layerScale) &&
              y < ((-layerY + window.innerHeight) / layerScale)
            ) {
              return (
                <Line
                  key={i}
                  id={"gridLine"}
                  points={[canvasX, y, canvasW / 2, y]}
                  stroke={layerLightness < 50 ? "white" : "black"}
                  strokeWidth={1}
                  strokeScaleEnabled={false}
                  globalCompositeOperation={"source-over"}
                  draggable={false}
                  opacity={0.5}
                />
              );
            }
          }
        })}
        {linesArrV.map((i) => {
          if (i % mod === 0) {
            const sign = i < (verticalLinesNum / 2) ? -1 : 1;
            const x = sign * (i - (sign > 0 ? Math.ceil(verticalLinesNum / 2) : 0)) * (canvasW / verticalLinesNum);
            if (
              x > (-layerX / layerScale) &&
              x < ((-layerX + window.innerWidth) / layerScale)
            ) {
              return (
                <Line
                  key={i}
                  id={"gridLine"}
                  points={[x, canvasY, x, canvasH / 2]}
                  stroke={layerLightness < 50 ? "white" : "black"}
                  strokeWidth={1}
                  strokeScaleEnabled={false}
                  globalCompositeOperation={"source-over"}
                  draggable={false}
                  opacity={0.5}
                />
              );
            }
          }
        })}
      </>
    );
  };

  const renderObject = (obj, index, canvas, editMode, type) => {
    const layer = canvas.refs[`groupAreaLayer.main`];
    switch (type) {
      case "rectangles":
        return <Rect {...defaultObjProps(obj, canvas, editMode)} {...rectProps(obj)} />;
      case "ellipses":
        return <Ellipse {...defaultObjProps(obj, canvas, editMode)} {...ellipseProps(obj)} />;
      case "pencils":
        return <Line {...lineProps(obj, index, canvas, editMode)} />;
      case "images":
        return layer ? <URLImage {...defaultObjProps(obj, canvas, editMode)} {...imageProps(obj, layer)} /> : null;
      case "videos":
        return layer ? <URLVideo {...defaultObjProps(obj, canvas, editMode)} {...videoProps(obj, layer)} /> : null;
      case "audios":
        return layer ? <URLVideo {...defaultObjProps(obj, canvas, editMode)} {...audioProps(obj, layer)} /> : null;
      case "documents":
        return <Rect {...defaultObjProps(obj, canvas, editMode)} {...documentProps(obj, canvas)} />;
      case "triangles":
        return <RegularPolygon {...defaultObjProps(obj, canvas, editMode)} {...triangleProps(obj)} />;
      case "stars":
        return <Star {...defaultObjProps(obj, canvas, editMode)} {...starProps(obj)} />;
      case "texts":
        return <Text {...defaultObjProps(obj, canvas, editMode)} {...textProps(obj, canvas, editMode)} />;
      case "lines":
        return <Line {...lineObjProps(obj, canvas, editMode)} />;
      case "polls":
        return <Poll
          defaultProps={{
            ...defaultObjProps(obj, canvas, editMode),
            ...pollProps(obj, canvas, editMode)
          }}
          {...canvas.getInteractiveProps(obj.id)}
          {...defaultObjProps(obj, canvas, editMode)}
          {...(editMode ? customObjProps(canvas) : {})}
        />;
      case "connect4s":
        return <Connect4
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(canvas) : {})}
        />;
      case "tics":
        return <TicTacToe
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(canvas) : {})}
        />;
      case "htmlFrames":
        return <HTMLFrame
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getVariableProps()}
          {...htmlProps(obj)}
          {...(editMode ? customObjProps(canvas) : {})}
        />;
      case "timers":
        return <Timer
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getInteractiveProps(obj.id)}
          {...(editMode ? customObjProps(canvas) : {})}
          {...timerProps(obj, canvas, editMode)}
        />;
      case "inputs":
        return <Input
          defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
          {...defaultObjProps(obj, canvas, editMode)}
          {...canvas.getVariableProps()}
          {...inputProps(obj, canvas)}
          {...(editMode ? customObjProps(canvas) : {})}
        />;
      default:
        return null;
    }
  }

  const loadObjects = (stage, mode) => {
    const editMode = mode === "edit";
    const canvas = getUpdatedCanvasState(mode);
    const checkStage = stage === "overlay" ? stage + canvas.state.overlayOpenIndex : stage;
    if (!canvas || !(canvas.state && canvas.refs)) {
      return (
        <>
        </>
      );
    }

    const page = canvas.state.pages[canvas.state.level - 1];
    let objectIds = [];
    if (stage === "group") {
      objectIds = page.groupLayers;
    } else if (stage === "personal") {
      objectIds = page.personalLayers;
    } else {
      if (canvas.state.overlayOpenIndex === -1) {
        return;
      }
      const overlay = page.overlays.filter(overlay => overlay.id === canvas.state.overlayOpenIndex)[0];
      objectIds = overlay.layers;
    }
    const newLayers = !arraysEqual(prevLayers, objectIds);

    return (
      <>
        {editMode && (
          <Layer {...layerProps(canvas, stage, "main")}>
            {/* This Rect is for dragging the canvas */}
            <Rect
              id="ContainerRect"
              x={canvasX}
              y={canvasY}
              height={canvasH}
              width={canvasW}
            // Canvas Drag Rect Outline - FOR DEBUGGING
            /*stroke={"red"}
            strokeWidth={2}
            strokeScaleEnabled={false}*/
            />

            {renderGrid(canvas, stage)}
          </Layer>
        )}

        {/* Render the object saved in state */}
        {objectIds.map((id, index) => {
          const type = id.replace(/\d+$/, "");
          const obj = canvas.state[type].filter(obj => obj.id === id)[0];

          const customChild = Array.from(document.getElementsByClassName("customObj")).filter(obj => obj.dataset.name === id)[0];
          const customObj = customChild ? customChild.parentElement : null;

          if (customObj && newLayers) {
            setTimeout(() => {
              let stageParentElem = "";
              if (stage === "overlay") {
                stageParentElem = "overlayGameContainer";
              } else if (stage === "personal") {
                stageParentElem = editMode ? "editPersonalContainer" : "personalGameContainer";
              } else {
                stageParentElem = editMode ? "editMainContainer" : "groupGameContainer";
              }
              const stageElems = document.getElementById(stageParentElem)?.querySelectorAll(".konvajs-content");
              const stageElem = stageElems && stageElems.length ? stageElems[0] : null;

              if (stageElem) {
                const canvasElems = stageElem.querySelectorAll("canvas");
                if (!editMode) {
                  for (let i = 0; i < canvasElems.length; i++) {
                    canvasElems[i].style.pointerEvents = "none";
                  }
                }
                const canvasElem = canvasElems[index + 1];
                stageElem.insertBefore(customObj, canvasElem);
              }
            }, 0);
            setPrevLayers(objectIds);
          }

          return obj && objectIsOnStage(obj, canvas) === checkStage ? (
            <Layer {...layerProps(canvas, stage, obj.id)}>
              {renderObject(obj, index, canvas, editMode, type)}
            </Layer>
          ) : null;
        })}

        {/*
          <JSRunner // WARNING: see JSRunner.jsx for extra info. this is dangerous code
            defaultProps={{ ...defaultObjProps(obj, canvas, editMode) }}
            {...canvas.getInteractiveProps(obj.id)}
            {...defaultObjProps(obj, canvas, editMode)}
            {...textProps(obj, canvas, editMode)}
          />
        */}

        <Layer {...layerProps(canvas, stage, "other")}>
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
              {canvas.state.guides.map((obj, index) => {
                return <Line {...guideProps(obj, index, canvas, editMode)} />
              })}
              {/* This is the blue transformer rectangle that pops up when objects are selected */}
              <TransformerComponent {...transformerProps(stage, canvas)} />
              <Rect fill="rgba(0,0,0,0.5)" ref={`${stage}SelectionRect`} />
            </>
          )}
        </Layer>

        {/* Puts a red circle at the origin (0, 0) - FOR DEBUGGING */}
        {/*<Ellipse
          fill={"red"}
          x={0}
          y={0}
          radius={{
            x: 10,
            y: 10
          }}
        />*/}
      </>
    );
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

          {...props}
        />
      )}
    </Suspense>
  );
}

export default CanvasPage;
