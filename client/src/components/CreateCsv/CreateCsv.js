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
  function onChange(event){
    setFile(event.target.files[0]);
}


  return (
      <div class="areacsv" >
        <Container>
      <form id="areacsvform">
        <p id="boxj1"> Add Student/Participant List </p>
          <input
                type="file"
                name="img"
                id="file"
                onChange={onChange}
                />
              <label for="file" id="csvfile">Upload a CSV file +</label>
                <input
                  type="file"
                  name="img"
                  id="filedownload"
                  onChange={onChange}
                />
              <label for="filedownload" id="csvfile2">Download CSV template</label>
          <p class="gradient-border" id="box3">
            File name
            <input
               type="text"
               id="namei"
               name="title"
               placeholder="                         "
            />
          </p>
          <button id="addj">Add</button>
        </form>

        </Container>
    </div>
  );
}

export default CreateArea;
