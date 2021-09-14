import React, { useState } from "react";
import CanvasGame from "../components/Stage/CanvasGame";
import styled from "styled-components"
import Sidebar from "../components/SideBar/Sidebar";
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
//   background-color: #E5E5E5;
// `;

const GridMain = styled.main`
  grid-area: main;
  background-color: #e5e5e5;
`;

function Game(props) {
  const [showNav, setShowNav] = useState(false);
  const toggle = () => setShowNav(!showNav);

  if (props.location.img) {
    localStorage.setItem('gameinstance', props.location.gameinstance);
    localStorage.setItem('adminid', props.location.adminid);
    localStorage.setItem('simimg', props.location.img);
    localStorage.setItem('simtitle', props.location.title);
  }

  return (
    <div className="editpage">
      <Container>
        <Grid>
          <GridNav>
            <Sidebar className="grid-sidebar" visible={showNav} close={toggle}
              img={localStorage.simimg}
              title={props.location.gameinstance}
            />
          </GridNav>
          <GridMain>
            <CanvasGame
              adminid={localStorage.adminid}
              gameinstance={localStorage.gameinstance}
            />
          </GridMain>
        </Grid>
      </Container>
    </div>
  );
}

export default Game;
