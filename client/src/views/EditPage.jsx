import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar/Sidebar";
import Canvas from "../components/Stage/Canvas";
import CanvasFunctional from "../components/Stage/CanvasFunctional";
import styled from "styled-components"
import { useAlertContext } from "../components/Alerts/AlertContext";
import { useDropdownContext } from '../components/Dropdown/DropdownReactContext';
import { Container } from "react-bootstrap";
import ErrorBoundary from "../components/Loading/ErrorBoundary";
import Loading from "../components/Loading/Loading";
import { set } from "immutable";

const Grid = styled.div`
  display: grid;
  grid:
    "nav header" min-content
    "nav main" 1fr / min-content 1fr;
  min-height: 100vh;
  overflow: hidden;
`;

const GridNav = styled.div`
  grid-area: nav;
  z-index: 2000;
`;

const GridMain = styled.main`
  grid-area: main;
  margin-left: 70px;
  /*background-color: #e5e5e5;*/
  ${p => `background-color: ${p.color};`}
  background-size: 40px 40px;
  /*background-image:
  linear-gradient(to right, grey 1px, transparent 1px),
  linear-gradient(to bottom, grey 1px, transparent 1px);*/
  @media screen and (orientation: portrait) {
    margin-left: 0px;
  }
`;

const EditPage = (props) => {
  const [customObjs, setCustomObjs] = useState({});
  const [pageColor, setPageColor] = useState("#FFF");
  const [performanceFunctions, setPerformanceFunctions] = useState({});
  const [showNav, setShowNav] = useState(false);
  const [updater, setUpdater] = useState(0);
  const [canvasLoading, setCanvasLoading] = useState(false);

  const alertContext = useAlertContext();
  const dropdownContext = useDropdownContext();

  const [tasks, setTasks] = useState([]);
  const [globalVars, setGlobalVars] = useState([]);
  const [globalCons , setGlobalCons] = useState([]);
  const [globalInts, setGlobalInts] = useState([]);
  const [globalTrigs, setGlobalTrigs] = useState([]);
  const [localVars, setLocalVars] = useState([]);
  const [localCons , setLocalCons] = useState([]);
  const [localInts, setLocalInts] = useState([]);
  const [localTrigs, setLocalTrigs] = useState([]);

  const [page, setPage] = useState(1);
  const [shapes, setShapes] = useState([])
  const [allShapes, setAllShapes] = useState([])


  if (props.location.img) {
    localStorage.setItem('gameinstance', props.location.gameinstance);
    localStorage.setItem('adminid', props.location.adminid);
    localStorage.setItem('simimg', props.location.img);
    localStorage.setItem('simtitle', props.location.title);
  }

  const toggle = () => setShowNav(!showNav);

  useEffect(() => {
    if (updater % 2 !== 0) {
      setUpdater(updater + 1);
    }
    document.body.style.zoom = "100%";
  }, [updater]);

  const handlePage = (level) => {
    setPage(level);
  }

  const handleSetTasks = (data) => {
    setTasks(data)
  }

  const handleGlobalsVars = (data) => {
    setGlobalVars(data)
  }
  const handleGlobalsCons = (data) => {
    setGlobalCons(data)
  }
  const handleGlobalsInts = (data) => {
    setGlobalInts(data)
  }
  const handleGlobalsTrigs = (data) => {
    setGlobalTrigs(data)
  }
  const handleLocalVars = (data) => {
    setLocalVars(data)
  }
  const handleLocalCons = (data) => {
    setLocalCons(data)
  }
  const handleLocalInts = (data) => {
    setLocalInts(data)
  }
  const handleLocalTrigs = (data) => {
    setLocalTrigs(data)
  }
  
  const handleSetShapes = (data) => {
    setShapes(data.inputs)
  }
  const handleSetAllShapes = (data) => {
    setAllShapes(data)
  }

  return (
    <div className="editpage">
      <div className="editpage-container">
        <Grid>
          <GridNav>
            <Sidebar
              performanceFunctions={performanceFunctions}
              customObjs={customObjs}
              className="grid-sidebar"
              visible={showNav}
              close={toggle}
              globalVars={globalVars}
              globalCons={globalCons}
              globalInts={globalInts}
              globalTrigs={globalTrigs}
              localVars={localVars}
              localCons={localCons}
              localInts={localInts}
              localTrigs={localTrigs}
              
              shapes={shapes || {}}
              allShapes={allShapes || {}}
              img={localStorage.simimg}
              title={localStorage.simtitle}
              setGlobalVars={handleGlobalsVars}
              setGlobalCons={handleGlobalsCons}
              setGlobalInts={handleGlobalsInts}
              setGlobalTrigs={handleGlobalsTrigs}
              setLocalVars={handleLocalVars}
              setLocalCons={handleLocalCons}
              setLocalInts={handleLocalInts}
              setLocalTrigs={handleLocalTrigs}
              handleLevel={handlePage}
              random={props.random}
              customObjects={props.customObjects}
              savedObjects={props.savedObjects}
              loadObjects={props.loadObjects}
              page={page}
              setAlerts={handleSetTasks}
              alerts={tasks || []}
              
            />
          </GridNav>
          <GridMain color={pageColor}>
              <Canvas
                setPageColor={setPageColor}
                setCanvasLoading={setCanvasLoading}
                loadObjects={props.loadObjects}
                customDeletes={props.customDeletes}
                allDeletes={props.allDeletes}
                customObjects={props.customObjects}
                savedObjects={props.savedObjects}
                reCenter={props.reCenter}
                setGameEditProps={props.setGameEditProps}
                setPerformanceFunctions={setPerformanceFunctions}
                setCustomObjs={setCustomObjs}
                doNotRecalculateBounds={updater > 0}
                reloadCanvasFull={() => setUpdater(updater + 1)}
                setDropdownType={dropdownContext.setType}
                showAlert={alertContext.showAlert}
                adminid={localStorage.adminid}
                gameinstance={localStorage.gameinstance}
                globalVars={globalVars}
                globalCons={globalCons}
                globalInts={globalInts}
                globalTrigs={globalTrigs}
                localVars={localVars}
                localCons={localCons}
                localInts={localInts}
                localTrigs={localTrigs}
                tasks={tasks}
                page={page}
                setTasks={handleSetTasks}
                setShapes={handleSetShapes}
                setAllShapes={handleSetAllShapes}
                setGlobalVars={handleGlobalsVars}
                setGlobalCons={handleGlobalsCons}
                setGlobalInts={handleGlobalsInts}
                setGlobalTrigs={handleGlobalsTrigs}
                setLocalVars={handleLocalVars}
                setLocalCons={handleLocalCons}
                setLocalInts={handleLocalInts}
                setLocalTrigs={handleLocalTrigs}  
                setEditState={props.setEditState}
                handleLevel={handlePage}
              />
          </GridMain>
        </Grid>
      </div>
      {canvasLoading && (
        <div className="gameLoadingOverlay">
          <Loading />
        </div>
      )}
    </div>
  );
}

export default EditPage;
