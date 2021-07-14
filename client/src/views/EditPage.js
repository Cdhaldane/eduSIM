import React, { useState } from "react";
import {Link } from "react-router-dom";
import Level from "../components/Level/Level";
import Info from "../components/Information/InformationPopup";
import EditShapes from "../components/EditShapes/EditShapes";
import Pencil from "../components/Pencils/Pencil";
import Sidebar from "../components/SideBar/Sidebar";
import Header from "../components/SideBar/Header";
import Canvas from "../components/Stage/Canvas";
import styled from "styled-components"
import Stages from "../components/Stage/Stage";

import { Container, Row, Col } from "react-bootstrap";


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

const GridHeader = styled.header`
  grid-area: header;
  background-color: #e5e5e5;
`;

const GridMain = styled.main`
  grid-area: main;
  background-color: #e5e5e5;
  background-size: 40px 40px;
  background-image:
  linear-gradient(to right, grey 1px, transparent 1px),
  linear-gradient(to bottom, grey 1px, transparent 1px);
`;

function EditPage(props){
    const [showNav, setShowNav] = useState(false);
    const [number, setNumber] = useState(6);
    const [mvisible, setMvisible] = useState("false")
    const [avisible, setAvisible] = useState("false")
    const [pavisible, setPavisible] = useState("false")
    const [svisible, setSvisible] = useState("false")
    const [pevisible, setPevisible] = useState("false")
    const [ptype, setType] = useState("")
    const [num, setNum] = useState(6)
    const [color, setColor]= useState("white")

    console.log(props.location.img)

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
    function handleType(e){
      setType(e);
    }
    function handleNum(e){
      setNum(e);
    }
    function handleColor(e){
      setColor(e.hex);
      console.log(color);
    }

    if(props.location.img){
      localStorage.setItem('simimg', props.location.img)
      localStorage.setItem('simtitle', props.location.title)
    }
    const simimg = React.useState(
      localStorage.getItem('simimg') || ''
    );
    console.log(simimg)


    const toggle = () => setShowNav(!showNav)
    return (
      <div className="editpage">
      <Container>
        <Grid>
          <GridNav>
              <Sidebar class="grid-sidebar" visible={showNav} close={toggle}
                mvisible={mvisible}
                avisible={avisible}
                pavisible={pavisible}
                svisible={svisible}
                pevisible={pevisible}
                img={props.location.img}
                title={props.location.title}
              />
          </GridNav>

          <GridMain>
            <Canvas
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

// <GridHeader>
//     <Header class="header" toggle={toggle} />
// </GridHeader>
