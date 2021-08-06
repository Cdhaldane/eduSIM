import React, { useState, useEffect } from "react";
import Level from "../components/Level/Level";
import Info from "../components/Information/InformationPopup";
import Sidebar from "../components/SideBar/Sidebar";
import Header from "../components/SideBar/Header";
import styled from "styled-components"
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";


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
  background-color: #E5E5E5;
`;

const GridMain = styled.main`
  grid-area: main;
  background-color: #e5e5e5;
`;



function Game(props){
      const [showNav, setShowNav] = useState(false);
      const [value] = React.useState(
      localStorage.getItem('adminid') || ''
      );
      const { user } = useAuth0();
      const [gamedata, getGamedata] = useState([]);

      useEffect(() => {
         getAllGamedata();
       }, []);

      const getAllGamedata = () => {
        axios.get('http://localhost:5000/adminaccounts/getAdminbyEmail/:email/:name', {
          params: {
                email: user.email,
                name: user.name
            }
        })
        .then((res) => {
          const allData = res.data;
          localStorage.setItem('adminid', allData.adminid)
        })
        .catch(error => console.log(error.response));
        axios.get('http://localhost:5000/gameinstances/getGameInstances/',
        {
          params: {
                id: value
            }
        })
        .then((res) => {
        const allData = res.data;
        console.log(allData);
        getGamedata(allData);
        })
        .catch(error => console.log(error.response));
      }
      const toggle = () => setShowNav(!showNav)
      console.log(props.img)
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
            {gamedata.map((noteItem, index) => {

          return (
            <img src={noteItem.gameinstance_photo_path} alt="sim photo"/>
          );
    })}
            <Level number={6}/>
            <Info
              stuff=""
              editmode="0"
              />
          </GridMain>
        </Grid>
        </div>
    );
}

export default Game;
