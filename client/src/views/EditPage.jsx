import React, { useState } from "react";
import Sidebar from "../components/SideBar/Sidebar";
import Canvas from "../components/Stage/Canvas";
import styled from "styled-components"

import { Container } from "react-bootstrap";
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

// const GridHeader = styled.header`
//   grid-area: header;
//   background-color: #e5e5e5;
// `;

const GridMain = styled.main`
  grid-area: main;
  background-color: #e5e5e5;
  background-size: 40px 40px;
  background-image:
  linear-gradient(to right, grey 1px, transparent 1px),
  linear-gradient(to bottom, grey 1px, transparent 1px);
`;

function EditPage(props) {
  const [showNav, setShowNav] = useState(false);
  const [mvisible, setMvisible] = useState("false");
  const [avisible, setAvisible] = useState("false");
  const [pavisible, setPavisible] = useState("false");
  const [svisible, setSvisible] = useState("false");
  const [pevisible, setPevisible] = useState("false");

  function handleMvisible(e) {
    setMvisible(e);
  }

  function handleAvisible(e) {
    setAvisible(e);
  }

  function handlePavisible(e) {
    setPavisible(e);
  }

  function handleSvisible(e) {
    setSvisible(e);
  }

  function handlePevisible(e) {
    setPevisible(e);
  }

  if (props.location.img) {
    localStorage.setItem('gameinstance', props.location.gameinstance);
    localStorage.setItem('adminid', props.location.adminid);
    localStorage.setItem('simimg', props.location.img);
    localStorage.setItem('simtitle', props.location.title);
  }

  const toggle = () => setShowNav(!showNav);

  return (
    <div className="editpage">
      <Container>
        <Grid>
          <GridNav>
            <Sidebar className="grid-sidebar" visible={showNav} close={toggle}
              mvisible={mvisible}
              avisible={avisible}
              pavisible={pavisible}
              svisible={svisible}
              pevisible={pevisible}
              img={props.location.img}
              title={props.location.gameinstance}
            />
          </GridNav>
          <GridMain>
            <Canvas
              adminid={localStorage.adminid}
              gameinstance={localStorage.gameinstance}
              mvisible={handleMvisible}
              avisible={handleAvisible}
              pavisible={handlePavisible}
              svisible={handleSvisible}
              pevisible={handlePevisible}
            />
          </GridMain>
        </Grid>
      </Container>
    </div>
  );
}

export default EditPage;
