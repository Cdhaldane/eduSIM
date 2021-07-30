import React, { useState, useEffect } from "react";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import SimNote from "../components/SimNote/SimNote";
import CreateArea from "../components/CreateArea/CreateArea";
import Tabs from "../components/Tabs/Tabs"
import CreateCsv from "../components/CreateCsv/CreateCsv"
import axios from "axios";
import {Link } from "react-router-dom";
import CsvModal from "../components/CsvModal/CsvModal"
import Button from "../components/Buttons/Button"


function Join(props) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth0();
  const [notes, setNotes] = useState([]);
  const [showNote, setShowNote] = useState(false);
  const [gamedata, getGamedata] = useState([]);
  const [login, setLogin] = useState([]);
  const allData = "";
  const [value, setValue] = React.useState(
  localStorage.getItem('adminid') || ''
);

  return (
    <div className="dashboard">
            <h1>Home</h1>
          {/* <a id="new" onClick={() => setShowNote(!showNote)}>Upload a CSV File</a> */}
          <Button onClick={()=>setIsOpen(true)} class="button">Add Student/Participant List +</Button>
          {/* <CsvModal open={isOpen} onClose={()=>setIsOpen(false)}>
          </CsvModal> */}
            <hr />
              {/* {showNote && <div>
                <img className="bimg" src= "black.jpg" onClick={() => setShowNote(!showNote)} />
              <CreateCsv />
              </div>} */}
            <div className="dashsim">
            <h2>My simulations ️</h2>
            <Tabs />

    </div>

    </div>
  );
}

export default withAuth0(Join);
