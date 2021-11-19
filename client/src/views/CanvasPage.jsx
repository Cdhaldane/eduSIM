import React, { Suspense, useState, useRef, useContext } from "react";
import { SettingsContext } from "../App";
import Loading from "../components/Loading/Loading";

import TransformerComponent from "../components/Stage/TransformerComponent";
import URLVideo from "../components/Stage/URLVideos";
import URLImage from "../components/Stage/URLImage";
import TicTacToe from "../components/Stage/GamePieces/TicTacToe/TicTacToe";
import Connect4 from "../components/Stage/GamePieces/Connect4/Board";
import Poll from "../components/Stage/GamePieces/Poll/Poll";
import HTMLFrame from "../components/Stage/GamePieces/HTMLFrame";
import JSRunner from "../components/Stage/GamePieces/JSRunner";
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
  const savedObjects = [
    // Rendered Objects Only (shapes, media, etc.)
    ...customObjects,
    "rectangles",
    "ellipses",
    "stars",
    "texts",
    "arrows", // Arrows are used for transformations
    "triangles",
    "images",
    "videos",
    "audios",
    "documents",
    "lines", // Lines are the drawings
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

  const [playModeCanvasHeights, setPlayModeCanvasHeights] = useState({
    group: 2000,
    overlay: 1000,
    personal: 1000
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

  /*-------------------------------------------------------------------------------------------/
   * RECENTER OBJECTS
   * The following functions are used to reposition the objects so they all fit on the canvas
   *------------------------------------------------------------------------------------------*/
  const reCenterObjects = (mode, layer) => {
    console.log(layer);
    // Runs for personal and group area
    const _reCenterObjects = (isPersonalArea, mode, overlay) => {
      let canvas = getUpdatedCanvasState(mode);
      if (
        !(canvas &&
          canvas.setState &&
          canvas.state &&
          canvas.refs)
      ) {
        return;
      }

      const areaString = isPersonalArea ? "personal" : (overlay ? "overlay" : "group");
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
        const availableW = isPersonalArea ? personalArea.width - doublePad : screenW - doublePad;
        const availableH = isPersonalArea ? personalArea.height - topMenuH - doublePad : screenH - topMenuH - doublePad;
        const availableRatio = availableW / availableH;
        const level = canvas.state.level;

        let { minX, maxX, minY, maxY } = recalculateMaxMin(isPersonalArea, overlay, sideMenuW, canvas, personalId, level);
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

            if (mode === "play" && layer === "group") {
              // Adjust the canvas container height (scroll-y will automatically appear if needed)
              const height = (scale * contentH) + topMenuH;
              console.log("NEW");
              console.log(scale);
              console.log(contentH);
              console.log(height);
              const canvasH = Math.max(height, window.innerHeight);
              setPlayModeCanvasHeights({
                ...playModeCanvasHeights,
                group: canvasH
              });
            }
          }
          x = -minX * scale;
          y = -minY * scale;
          // Scale and fit to top leftR
          canvas.setState({
            [`${areaString}LayerX`]: x,
            [`${areaString}LayerY`]: y + topMenuH,
            [`${areaString}LayerScale`]: scale
          }, () => setTimeout(() => {
            canvas = getUpdatedCanvasState(mode);

            // Center contents
            if (availableRatio > contentRatio) {
              y = scale > 1 ? padding / scale : padding;
              x = (availableW - (contentW * scale)) / 2;
            } else {
              x = scale > 1 ? padding / scale : padding;
              y = (availableH - (contentH * scale)) / 2;
            }
            canvas.setState({
              [`${areaString}LayerX`]: canvas.state[`${areaString}LayerX`] + x,
              [`${areaString}LayerY`]: canvas.state[`${areaString}LayerY`] + y,
              canvasLoading: false,
            });
          }, 0));
        } else {
          canvas.setState({
            canvasLoading: false,
          });
        }
      }, 0));
    }
    if (!layer || layer === "group") {
      _reCenterObjects(false, mode, false);
    }
    if (!layer || layer === "overlay") {
      _reCenterObjects(false, mode, true);
    }
    if (!layer || layer === "personal") {
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
          if (object.infolevel === isPersonalArea && object.overlay === overlay && object.level === level) {
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
  const defaultObjProps = (obj, index, canvas, editMode) => {
    return {
      key: index,
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
          onDragMove: () => canvas.onObjectDragMove(obj),
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
            obj.infolevel ? canvas.refs.personalAreaLayer :
              (obj.overlay ? canvas.refs.overlayLayer : canvas.refs.groupAreaLayer)
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

  const arrowProps = (obj, index, canvas, editMode) => {
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

  const objectIsOnStage = (obj, canvas) => {
    if (obj.level === canvas.state.level && obj.overlay) {
      return "overlay";
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
    varEnable: obj.varEnable || false
  });

  const inputProps = (obj, canvas) => ({
    varType: obj.varType,
    varName: obj.varName,
    refresh: canvas.refresh,
    label: obj.label
  })

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

  /*-------------------------------------------------------------/
   * RENDER FUNCTION
   * This renders the objects with their props to the canvasses.
   *------------------------------------------------------------*/
  const loadObjects = (stage, mode) => {
    const editMode = mode === "edit";
    const canvas = getUpdatedCanvasState(mode);
    if (!canvas || !(canvas.state && canvas.refs)) {
      return (
        <>
        </>
      );
    }

    return (
      <>
        {editMode && (
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
              {...defaultObjProps(canvas.state.customRect[0], 0, canvas, editMode)}
              draggable={false}
            />
          </>
        )}

        {/* Render the object saved in state */}
        {canvas.state.lines.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Line {...lineProps(obj, index, canvas, editMode)} /> : null
        })}
        {canvas.state.rectangles.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Rect {...defaultObjProps(obj, index, canvas, editMode)} {...rectProps(obj)} /> : null
        })}
        {canvas.state.ellipses.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Ellipse {...defaultObjProps(obj, index, canvas, editMode)} {...ellipseProps(obj)} /> : null
        })}
        {canvas.state.images.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <URLImage {...defaultObjProps(obj, index, canvas, editMode)} {...imageProps(obj, canvas.refs.groupAreaLayer)} /> : null
        })}
        {canvas.state.videos.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <URLVideo {...defaultObjProps(obj, index, canvas, editMode)} {...videoProps(obj, canvas.refs.groupAreaLayer)} /> : null
        })}
        {canvas.state.audios.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <URLVideo {...defaultObjProps(obj, index, canvas, editMode)} {...audioProps(obj, canvas.refs.groupAreaLayer)} /> : null
        })}
        {canvas.state.documents.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Rect {...defaultObjProps(obj, index, canvas, editMode)} {...documentProps(obj, canvas)} /> : null
        })}
        {canvas.state.triangles.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <RegularPolygon {...defaultObjProps(obj, index, canvas, editMode)} {...triangleProps(obj)} /> : null
        })}
        {canvas.state.stars.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Star {...defaultObjProps(obj, index, canvas, editMode)} {...starProps(obj)} /> : null
        })}
        {canvas.state.texts.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage && !editMode ?
            <JSRunner // WARNING: see JSRunner.jsx for extra info. this is dangerous code
                defaultProps={{ ...defaultObjProps(obj, index, canvas, editMode) }}
                {...canvas.getInteractiveProps(obj.id)}
                {...defaultObjProps(obj, index, canvas, editMode)}
                {...textProps(obj, canvas, editMode)}
            /> : null
        })}
        {canvas.state.texts.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Text {...defaultObjProps(obj, index, canvas, editMode)} {...textProps(obj, canvas, editMode)} /> : null
        })}
        {canvas.state.polls.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Poll
              defaultProps={{
                ...defaultObjProps(obj, index, canvas, editMode),
                ...pollProps(obj, canvas, editMode)
              }}
              {...canvas.getInteractiveProps(obj.id)}
              {...defaultObjProps(obj, index, canvas, editMode)}
              {...(editMode ? customObjProps(canvas) : {})}
            /> : null
        })}
        {canvas.state.connect4s.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Connect4
              defaultProps={{ ...defaultObjProps(obj, index, canvas, editMode) }}
              {...defaultObjProps(obj, index, canvas, editMode)}
              {...canvas.getInteractiveProps(obj.id)}
              {...(editMode ? customObjProps(canvas) : {})}
            /> : null
        })}
        {canvas.state.tics.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <TicTacToe
              defaultProps={{ ...defaultObjProps(obj, index, canvas, editMode) }}
              {...defaultObjProps(obj, index, canvas, editMode)}
              {...canvas.getInteractiveProps(obj.id)}
              {...(editMode ? customObjProps(canvas) : {})}
            /> : null
        })}
        {canvas.state.htmlFrames.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <HTMLFrame
              defaultProps={{ ...defaultObjProps(obj, index, canvas, editMode) }}
              {...defaultObjProps(obj, index, canvas, editMode)}
              {...canvas.getInteractiveProps(obj.id)}
              {...htmlProps(obj)}
              {...(editMode ? customObjProps(canvas) : {})}
            /> : null
        })}

        {canvas.state.inputs.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Input
              defaultProps={{ ...defaultObjProps(obj, index, canvas, editMode) }}
              {...defaultObjProps(obj, index, canvas, editMode)}
              {...canvas.getInteractiveProps(obj.id)}
              {...inputProps(obj, canvas)}
              {...(editMode ? customObjProps(canvas) : {})}
            /> : null
        })}
        {canvas.state.arrows.map((obj, index) => {
          return (
            !obj.from &&
            !obj.to &&
            obj.level === canvas.state.level &&
            obj.infolevel === (stage === "personal")
          ) ?
            <Arrow {...arrowProps(obj, index, canvas, editMode)} /> : null
        })}

        {/* This is the blue transformer rectangle that pops up when objects are selected */}
        {editMode && (
          <>
            <TransformerComponent {...transformerProps(stage, canvas)} />
            <Rect fill="rgba(0,0,0,0.5)" ref={`${stage}SelectionRect`} />
          </>
        )}
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
