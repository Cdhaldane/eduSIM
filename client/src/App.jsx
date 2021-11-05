import React, { useState, useRef } from "react";
import { Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Loading from "./components/Loading/Loading";
import Welcome from "./views/Welcome";
import Home from "./views/Home";
import About from "./views/About";
import Profile from "./views/Profile";
import CollabLogin from "./views/CollabLogin";
import Dashboard from "./views/Dashboard";
import GamePage from "./views/GamePage";
import EditPage from "./views/EditPage";
import Join from "./views/Join"
import { withAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./components/Auth0/protected-route";
import AlertPopup from "./components/Alerts/AlertPopup";
import AlertContextProvider from "./components/Alerts/AlertContext";

// Custom Konva Components
import TransformerComponent from "./components/Stage/TransformerComponent";
import URLVideo from "./components/Stage/URLVideos";
import URLImage from "./components/Stage/URLImage";
import TicTacToe from "./components/Stage/GamePieces/TicTacToe/TicTacToe";
import Connect4 from "./components/Stage/GamePieces/Connect4/Board";
import Poll from "./components/Stage/GamePieces/Poll/Poll";
import HTMLFrame from "./components/Stage/GamePieces/HTMLFrame";

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

const App = (props) => {

  /*------------------------------------------------------------------------------/
   * CANVAS FUNCTIONS
   * The following functions are used on both Edit Mode and Play Mode in order to
   * render the canvasses. They are passed down from here to both canvasses.
   *------------------------------------------------------------------------------*/

  // Save State
  // These are the names of the objects in state that are saved to the database
  const customObjects = [
    "polls",
    "connect4s",
    "tics",
    "htmlFrames"
  ];
  const savedObjects = [
    // Rendered Objects Only (shapes, media, etc.)
    ...customObjects,
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
  const reCenterObjects = (mode) => {
    // Runs for personal and group area
    const _reCenterObjects = (isPersonalArea, mode) => {
      let canvas = getUpdatedCanvasState(mode);
      if (
        !(canvas.setState &&
          canvas.state &&
          canvas.refs)
      ) {
        return;
      }

      const areaString = isPersonalArea ? "personal" : "group";
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
        const sideMenuW = isPersonalArea ? personalArea.x : (isPortraitMode ? 0 : sidebar.width);
        const topMenuH = isPersonalArea ? 80 : topBar.height;
        const padding = 80;
        const doublePad = 2 * padding;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const availableW = isPersonalArea ? personalArea.width - doublePad : screenW - doublePad;
        const availableH = isPersonalArea ? personalArea.height - topMenuH - doublePad : screenH - topMenuH - doublePad;
        const availableRatio = availableW / availableH;

        let { minX, maxX, minY, maxY } = recalculateMaxMin(isPersonalArea, sideMenuW, canvas, personalId);
        if (minX && maxX && minY && maxY) {
          let x = null;
          let y = null;
          let scale = null;
          const contentW = maxX - minX;
          const contentH = maxY - minY;
          const contentRatio = contentW / contentH;
          if (availableRatio > contentRatio) {
            // Content proportionally taller
            scale = availableH / contentH;
          } else {
            // Content proportionally wider
            scale = availableW / contentW;
          }
          x = -minX * scale;
          y = -minY * scale;
          // Scale and fit to top left
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
              [`${areaString}LayerY`]: canvas.state[`${areaString}LayerY`] + y
            });
          }, 0));
        }
      }, 0));
    }
    _reCenterObjects(true, mode);
    _reCenterObjects(false, mode);
  }

  // This gets the farthest left, top, right, and bottom coordinates of the objects
  // to create a bounding rectangle with coordinates
  const recalculateMaxMin = (isPersonalArea, sideMenuW, canvas, personalId) => {
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
          if (object.infolevel === isPersonalArea) {
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
      fontSize: obj.fontSize,
      text: obj.text,
      link: obj.link,
      ...(editMode ?
        {
          onTransform: canvas.handleTextTransform,
          onDblClick: () => canvas.handleTextDblClick(
            canvas.refs[obj.ref],
            obj.infolevel ? canvas.refs.personalAreaLayer : canvas.refs.groupAreaLayer
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
    if (obj.level === canvas.state.level && obj.infolevel === false) {
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
    containerHeight: obj.containerHeight
  });

  const pollProps = (obj) => {
    return {
      custom: {
        customName: obj.customName ? obj.customName : "",
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
                  isRequired: false
                }, {
                  id: 2,
                  type: "boolean",
                  name: "2",
                  title: "Sample Yes/No Question:",
                  isRequired: false
                }
              ]
            }
          ]
        }
      }
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
          return objectIsOnStage(obj, canvas) === stage ?
            <Text {...defaultObjProps(obj, index, canvas, editMode)} {...textProps(obj, canvas, editMode)} /> : null
        })}
        {canvas.state.polls.map((obj, index) => {
          return objectIsOnStage(obj, canvas) === stage ?
            <Poll
              defaultProps={{
                ...defaultObjProps(obj, index, canvas, editMode),
                ...pollProps(obj)
              }}
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

  const { isLoading } = props.auth0;
  if (isLoading) return <Loading />;

  return (
    <AlertContextProvider>
      <AlertPopup />
      {!(window.location.pathname.startsWith("/gamepage") || window.location.pathname === "/editpage") && (
        <Navbar />
      )}
      <div >
        <Switch>
          <Route exact path="/" >
            <Home />
          </Route>
          {!(window.location.pathname.startsWith("/gamepage") || window.location.pathname === "/editpage") && (
            <Route exact path="../components/Navbar" render={(props) => <Navbar {...props} />} />
          )}
          <Route exact path="/welcome" render={(props) => <Welcome {...props} />} />
          <Route exact path="/about" render={(props) => <About {...props} />} />
          <Route exact path="/gamepage/:roomid" render={(props) =>
            <GamePage
              loadObjects={loadObjects}
              reCenter={reCenterObjects}
              setGamePlayProps={setGamePlayProps}
              savedObjects={savedObjects}
              {...props}
            />}
          />
          <Route exact path="/collab-invite" render={(props) => <CollabLogin {...props} />} />
          <Route exact path="/editpage" render={(props) =>
            <EditPage
              loadObjects={loadObjects}
              reCenter={reCenterObjects}
              setGameEditProps={setGameEditProps}
              customObjects={customObjects}
              savedObjects={savedObjects}
              customDeletes={customDeletes}
              allDeletes={allDeletes}
              {...props}
            />}
          />
          <ProtectedRoute path="/profile" render={(props) => <Profile {...props} />} />
          <ProtectedRoute path="/dashboard" render={(props) => <Dashboard {...props} />} />
          <ProtectedRoute path="/join" render={(props) => <Join {...props} />} />
        </Switch>
      </div>
    </AlertContextProvider>
  );
}

export default withAuth0(App);
