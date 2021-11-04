import React, { useState, useEffect, useRef } from "react";
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

// Save State
// These are the names of the objects in state that are saved to the database
// Used on CanvasGame and Canvas
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

const App = (props) => {

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

  const { isLoading } = props.auth0;
  if (isLoading) return <Loading />;

  const getUpdatedCanvasState = (mode) => {
    if (mode === "edit") {
      return gameEditPropsRef.current;
    } else if (mode === "play") {
      return gamePlayPropsRef.current;
    } else {
      return null;
    }
  }

  const recalculateCanvasSizeAndPosition = (mode) => {
    _recalculateCanvasSizeAndPosition(true, mode);
    _recalculateCanvasSizeAndPosition(false, mode);
  }

  const _recalculateCanvasSizeAndPosition = (isPersonalArea, mode) => {
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

  const getRect = (obj, sideMenuW, isPersonalArea, canvas, personalId) => {
    if (!obj) return;
    let rect = null;
    if (obj.tool) {
      if (obj.tool === "eraser") {
        return null;
      }
      // Drawing
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
              reCenter={recalculateCanvasSizeAndPosition}
              setGamePlayProps={setGamePlayProps}
              savedObjects={savedObjects}
              {...props}
            />}
          />
          <Route exact path="/collab-invite" render={(props) => <CollabLogin {...props} />} />
          <Route exact path="/editpage" render={(props) =>
            <EditPage
              reCenter={recalculateCanvasSizeAndPosition}
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
