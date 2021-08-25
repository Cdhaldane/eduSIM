import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./CreateCsv.css";

  function CreateArea(props) {
  const [file, setFile] = useState('');
  const [filename, setFileName] = useState('Upload a CSV file +');
  // sets all const

  function onChange(event){
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
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
              <label for="file" id="csvfile">{filename}</label>
                <input
                  type="file"
                  name="img"
                  id="filedownload"
                  onChange={onChange}
                />
              <label for="filedownload" id="csvfile2">Download CSV template</label>
            <p class="gradient-border" id="boxtabs">
            File name
            <input
               type="text"
               id="namei"
               name="title"
               placeholder="                         "
            />
          </p>
          <button id="add">Add</button>
        </form>

        </Container>
    </div>
  );
}

export default CreateArea;
