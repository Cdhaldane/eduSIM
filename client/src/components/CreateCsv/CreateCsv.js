import React, { useState } from "react";
import Switch from "react-switch"
import {Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import "./CreateCsv.css";

  function CreateArea(props) {
    const [save, setSave] = useState("");
    const [note, setNote,] = useState([]);
    const [showNote, setShowNote] = useState(false);
    const [img, setImg] = useState();
    const [title, setTitle] = useState();
    const [checked, setChecked] = useState(false);
    const [state, setState] = useState("");
    const [gamedata, getGamedata] = useState([]);
    const [value, setValue] = React.useState(
    localStorage.getItem('adminid') || ''
  );

  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);


  // sets all const


  //adds note to dahsboard by setting notes and sending to app


  return (
      <div class="area" >
        <Container>
      <form>
        <p class="gradient-border" id="box">
        Add Student/Participant List
        </p>
        <label for="Game">File Name</label>



          <p class="gradient-border" id="box3">
            Enter a ‎name‎‏‏‎ ‎
            <input
           type="text"
           id="namei"
           name="title"

           placeholder="                         "
         />
          </p>
        </form>

        </Container>
    </div>
  );
}

export default CreateArea;
