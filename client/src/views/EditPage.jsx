import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar/Sidebar";
import Canvas from "../components/Stage/Canvas";
import styled from "styled-components"
import { useAlertContext } from "../components/Alerts/AlertContext";
import { useDropdownContext } from '../components/Dropdown/DropdownReactContext';
import { Container } from "react-bootstrap";
import Loading from "../components/Loading/Loading";

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

  const [tasks, setTasks] = useState({});
  const [vars, setVars] = useState([]);
  const [cons, setCons] = useState([]);
  const [ints, setInts] = useState([]);
  const [trigs, setTrigs] = useState([]);
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

  const handleSetTasks = (f) => {
    if (typeof f === 'function') {
      setTasks(old => {
        let n = { ...old };
        n[page] = f(n[page] || []);
        return n;
      });
    } else {
      setTasks(old => {
        let n = { ...old };
        n[page] = f;
        return n;
      });
    }
  }

  const handleSetVars = (data) => {
    setVars(old => [...old, data])
  }

  const handleEditVars = (data) => {
    setVars(data)
  }

  const handleDeleteVars = (data) => {
    setVars(data)
  }

  const handleDeleteCons = (data) => {
    setCons(data)
  }
  const handleSetCons = (data) => {
    setCons(data)
  }
  const handleDeleteInts = (data) => {
    setInts(data)
  }
  const handleSetInts = (data) => {
    setInts(data)
  }
  const handleSetTrigs = (data) => {
    console.log(data)
    setTrigs(data)
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
              variables={vars || {}}
              cons={cons || {}}
              ints={ints || {}}
              trigs={trigs || {}}
              shapes={shapes || {}}
              allShapes={allShapes || {}}
              img={localStorage.simimg}
              title={localStorage.simtitle}
              setVars={handleSetVars}
              setTrigs={handleSetTrigs}
              setCons={handleSetCons}
              setInts={handleSetInts}
              editVars={handleEditVars}
              delVars={handleDeleteVars}
              delCons={handleDeleteCons}
              delInts={handleDeleteInts}
              random={props.random}
              customObjects={props.customObjects}
              savedObjects={props.savedObjects}
              loadObjects={props.loadObjects}
              alertProps={{
                alerts: tasks[page] || [],
                setAlerts: handleSetTasks
              }}
            />
          </GridNav>
          <GridMain color={pageColor}>
            {updater % 2 === 0 ? (
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
                variables={vars || {}}
                cons={cons || {}}
                ints={ints || {}}
                tasks={tasks || {}}
                trigs={trigs || {}}
                page={page}
                setTasks={setTasks}
                setTrigs={setTrigs}
                setShapes={handleSetShapes}
                setAllShapes={handleSetAllShapes}
                setInts={setInts}
                setVars={setVars}
                setCons={setCons}
                handleLevel={handlePage}
              />
            ) : null}
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
