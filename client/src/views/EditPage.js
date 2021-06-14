import React, { useState } from "react";
import Level from "../components/Level/Level";
import Info from "../components/Information/InformationPopup";
import Pencil from "../components/Pencils/Pencil";
import Sidebar from "../components/SideBar/Sidebar";
import Header from "../components/SideBar/Header";
import styled from "styled-components"
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

function EditGame(props){
    const [showNav, setShowNav] = useState(false);
    const [number, setNumber] = useState(6)
    const toggle = () => setShowNav(!showNav)
    return (
      <div className="editpage">
      <Container>
        <Grid>
          <GridNav>
              <Sidebar class="grid-sidebar" visible={showNav} close={toggle}/>
          </GridNav>

          <GridMain>
            <h1 id="editmode">Edit Mode</h1>
            <Container fluid="md">
              <Row>
                <Col>
                <select name="cars" id="levels">
                  <option value="pg1">Page 1</option>
                  <option value="pg2">Page 2</option>
                  <option value="pg3">Page 3</option>
                  <option value="pg4">Page 4</option>
                </select>
                </Col>
                <Col><Level number={number}/></Col>
              </Row>
            </Container>
            <Pencil
              id="2"
              psize="3"
              type="main"
              />
            <Info
              stuff="asdasdas"
              editmode="1"
              />
              <Pencil
                id="3"
                psize="3"
              />
              <Pencil
                id="4"
                psize="2"
                />
          </GridMain>
        </Grid>
      </Container>
      </div>
    );
}

export default EditGame;

// <GridHeader>
//     <Header class="header" toggle={toggle} />
// </GridHeader>
