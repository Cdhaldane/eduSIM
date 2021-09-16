import React, { useState } from "react";
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
    <div className="areacsv">
      <form className="areacsvform">
        <p className="modal-title"> Add Student / Participant List </p>
        <div className="areacsv-links">
          <input type="file" name="img" id="csv-file" onChange={onChange} />
          <label for="csv-file" class="csv-link">{fileName || 'Upload a CSV file +'}</label>
          <input type="file" name="img" id="csv-filedownload" onChange={onChange} />
          <label for="csv-filedownload" class="csv-link">Download CSV template</label>
        </div>
        <div className="areacsv-filename">
          <p>File name</p>
          <input
            type="text"
            name="title"
            onChange={handleTitleChange}
          />
        </div>
        <button className="modal-bottomright-button" onClick={fileUploadHandler}>
          Add
        </button>
      </form>
    </div>
  );
}
export default CreateCsv;
