import React, { useState }from "react";
import Sidebar from "../components/SideBar/Sidebar";
import Header from "../components/SideBar/Header";
import styled from "styled-components"

const Grid = styled.div`
  display: grid;
  grid:
    "nav header" min-content
    "nav main" 1fr / min-content 1fr;
  min-height: 100vh;
`;

const GridNav = styled.div`
  grid-area: nav;
  z-index: 2000;
`;

const GridHeader = styled.header`
  grid-area: header;
  background-color: #E5E5E5;
`;

const GridMain = styled.main`
  grid-area: main;
  background-color: #E5E5E5;
`;

function Game(props){
    const [showNav, setShowNav] = useState(false);
    const toggle = () => setShowNav(!showNav)
    return (
      <Grid>
        <GridNav>
            <Sidebar class="grid-sidebar" visible={showNav} close={toggle}/>
        </GridNav>
        <GridHeader>
            <Header class="header" toggle={toggle} />
        </GridHeader> 
        <GridMain></GridMain>   
      </Grid>
    );
}

export default Game;