import React, { useState } from "react";
import Switch from "react-switch"
import {Link } from "react-router-dom";
import Table from "../Table/Table"
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";


  function CreateEmail(props) {
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
  function onChange(event){
    setFile(event.target.files[0]);
}


  return (
      <div class="areacsv" >
        <Container>
      <form id="areacsvform">
        <p id="boxj1"> Email Room Codes to Students/Participants </p>
          <div id="emailtable">
          <Table addtsudent={false}/>
          </div>
        </form>
        </Container>

    </div>
  );
}

export default CreateEmail;
