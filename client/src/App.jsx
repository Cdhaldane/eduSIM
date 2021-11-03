import React, { useState } from "react";
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

const App = (props) => {

  const [gameEditProps, setGameEditProps] = useState({
    setState: null,
    state: null,
    refs: null,
    savedObjects: null
  });
  const [gamePlayProps, setGamePlayProps] = useState({
    setState: null,
    state: null,
    refs: null,
    savedObjects: null
  });

  const { isLoading } = props.auth0;
  if (isLoading) return <Loading />;

  // Shared Functions
  const recalculateCanvasSizeAndPosition = (isPersonalArea) => {
    const areaString = isPersonalArea ? "personal" : "group";
    // Reset to default position and scale
    this.setState({
      [`${areaString}LayerX`]: 0,
      [`${areaString}LayerY`]: 0,
      [`${areaString}LayerScale`]: 1
    }, () => {
      const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
      const sidebar = document.getElementsByClassName("grid-sidebar")[0].getBoundingClientRect();
      const personalArea = document.getElementById("editPersonalContainer").getBoundingClientRect();
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

      let { minX, maxX, minY, maxY } = recalculateMaxMin(isPersonalArea, sideMenuW);
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
        this.setState({
          [`${areaString}LayerX`]: x,
          [`${areaString}LayerY`]: y + topMenuH,
          [`${areaString}LayerScale`]: scale
        }, () => {
          // Center contents
          if (availableRatio > contentRatio) {
            y = scale > 1 ? padding / scale : padding;
            x = (availableW - (contentW * scale)) / 2;
          } else {
            x = scale > 1 ? padding / scale : padding;
            y = (availableH - (contentH * scale)) / 2;
          }
          this.setState({
            [`${areaString}LayerX`]: this.state[`${areaString}LayerX`] + x,
            [`${areaString}LayerY`]: this.state[`${areaString}LayerY`] + y
          });
        });
      }
    });
  }

  const recalculateMaxMin = (isPersonalArea, sideMenuW) => {
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;
    for (let i = 0; i < this.savedObjects.length; i++) {
      const objectType = this.savedObjects[i];
      const objects = this.state[objectType];
      if (objects) {
        for (let j = 0; j < objects.length; j++) {
          const object = objects[j];
          if (object.infolevel === isPersonalArea) {
            const rect = getRect(object, sideMenuW, isPersonalArea);
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

  const getRect = (obj, sideMenuW, isPersonalArea) => {
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
      obj = this.refs[obj.id];
      if (!obj) return;
      if (obj.nodeName === "DIV") {
        // Custom Object
        rect = obj.getBoundingClientRect();
        rect.x = rect.x - sideMenuW;
        if (!this.state.personalAreaOpen && isPersonalArea) {
          const pArea = document.getElementById("editPersonalContainer").getBoundingClientRect();
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
              {...props}
            />}
          />
          <Route exact path="/collab-invite" render={(props) => <CollabLogin {...props} />} />
          <Route exact path="/editpage" render={(props) =>
            <EditPage
              reCenter={recalculateCanvasSizeAndPosition}
              setGameEditProps={setGameEditProps}
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
