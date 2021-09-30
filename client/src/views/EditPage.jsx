import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar/Sidebar";
import Canvas from "../components/Stage/Canvas";
import styled from "styled-components"
import { useAlertContext } from "../components/Alerts/AlertContext";
import { useDropdownContext } from '../components/Dropdown/DropdownReactContext';
import { Container } from "react-bootstrap";
import FontPicker from "font-picker-react";

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
  background-color: #e5e5e5;
  background-size: 40px 40px;
  background-image:
  linear-gradient(to right, grey 1px, transparent 1px),
  linear-gradient(to bottom, grey 1px, transparent 1px);
  @media screen and (orientation: portrait) {
    margin-left: 0px;
  }
`;

const EditPage = (props) => {

  const [showNav, setShowNav] = useState(false);

  const alertContext = useAlertContext();
  const dropdownContext = useDropdownContext();

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
              img={props.location.img}
              title={props.location.gameinstance}
            />
          </GridNav>
          <GridMain>
            <Canvas
              setDropdownType={dropdownContext.setType}
              showAlert={alertContext.showAlert}
              adminid={localStorage.adminid}
              gameinstance={localStorage.gameinstance}
            />
          </GridMain>
        </Grid>
      </Container>
      {/*<div style={{display: "hidden"}}>
        <FontPicker
          apiKey="AIzaSyCvq0AcfmcAeJeJ7-IZwi0JGjeTYBhWghU"
        />
  </div>*/}
    </div>
  );
}

export default EditPage;
