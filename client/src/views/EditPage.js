import React, { useState } from "react";
import Level from "../components/Level/Level";
import Info from "../components/Information/InformationPopup";
import Sidebar from "../components/SideBar/Sidebar";
import Header from "../components/SideBar/Header";
import styled from "styled-components"


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
    const toggle = () => setShowNav(!showNav)
    return (
      <div className="editpage">
      <Grid>
        <GridNav>
            <Sidebar class="grid-sidebar" visible={showNav} close={toggle}/>
        </GridNav>
        <GridHeader>
            <Header class="header" toggle={toggle} />
        </GridHeader>
        <GridMain>
          <Level />
          <Info />
        </GridMain>
      </Grid>
      </div>
    );
}

export default EditGame;
