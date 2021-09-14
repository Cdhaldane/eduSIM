import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { parse } from "papaparse"
import "./CreateCsv.css";
import axios from 'axios';

function CreateCsv(props) {
  const [file, setFile] = useState('');
  //const [highlighted, setHighlighted] = React.useState(false);
  const [fileName, setFileName] = useState('Upload a CSV file +');
  const [result, setResult] = useState('');

  function handleTitleChange(e) {
    setFileName(e.target.value)
  }

  const fileUploadHandler = async event => {
    // Put a check here
    // Gets here after pressing add button, so it should also add the file name
    event.preventDefault();
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/createGamePlayers', result, {
      headers: {
        'Content-Type': "application/json"
      },
      params: {
        id: props.gameid
      }
    }).then(response => {
      console.log(response.data);
    }).catch(err => {
      console.log(err.response);
    });
  }

  function onChange(event) {
    // Parsing only csv files
    if (event.target.files[0].type === 'text/csv') {
      setFile(event.target.files[0]);
      setFileName(event.target.files[0].name);
      Array.from(event.target.files).forEach(
        async (file) => {
          const text = await file.text();
          let results = parse(text, { header: true });
          setResult(results);
        }
      );
    } else {
      window.alert("Please enter a csv file");
    }
  }
  return (
    <div className="areacsv" >
      <Container>
        <form id="areacsvform">
          <p id="box1"> Add Student/Participant List </p>
          <input
            type="file"
            name="img"
            id="file"
            onChange={onChange}
          />
          <label for="file" id="csvfile">{fileName}</label>
          <input
            type="file"
            name="img"
            id="filedownload"
            onChange={onChange}
          />
          <label for="filedownload" id="csvfile2">Download CSV template</label>
          <p className="gradient-border" id="box3">
            File name
            <input
              type="text"
              id="namei"
              name="title"
              placeholder=""
              onChange={handleTitleChange}
            />
          </p>
          <button id="add" onClick={fileUploadHandler}>Add</button>
        </form>
      </Container>
    </div>
  );
}
export default CreateCsv;
