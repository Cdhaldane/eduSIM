import React, { useState, useRef, useEffect } from "react";
import { parse } from "papaparse"
import "./CreateCsv.css";
import { useAlertContext } from "../Alerts/AlertContext";
import axios from 'axios';

function CreateCsv(props) {
  const [file, setFile] = useState('');
  const [result, setResult] = useState('');
  const form = useRef();
  const alertContext = useAlertContext();

  const handleClickOutside = e => {
    if (form.current && !form.current.contains(e.target) && !e.target.className.includes('areacsv-remove')) {
      props.close();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
      console.log(response);
      if (response.data.replacedroles.length>0) {
        alertContext.showAlert(`Successfully added ${result.data.length} player${result.data.length==1 ? '' : 's'}.
        Nonexistant roles "${response.data.replacedroles.join(', ')}" have been replaced with empty slots.`, "warning", 6000);
      } else {
        alertContext.showAlert(`Successfully added ${result.data.length} player${result.data.length==1 ? '' : 's'}.`, "info");
      }
      props.success();
      props.close();
    }).catch(err => {
      console.log(err);
      alertContext.showAlert(err?.response?.data?.message || "An error occurred.", "error");
    });
  }

  function onChange(event) {
    // Parsing only csv files

    if (event.target.files[0].type === 'text/csv' || event.target.files[0].type === 'application/vnd.ms-excel') {
      Array.from(event.target.files).forEach(
        async (file) => {
          const text = await file.text();
          let results = parse(text, { header: true });
          if (results.errors.length>0) {
            alertContext.showAlert("Please enter a valid CSV file.", "error");
            return;
          }
          setResult(results);
          setFile(file);
          console.log(results);
        }
      );
    } else {
      alertContext.showAlert("Please enter a valid CSV file.", "error");
    }
  }
  
  async function download() {
    const blob = new Blob([
      "First_Name,Last_Name,Room,Email,Role\n"
    ], { type: 'text/csv' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "template.csv";
    form.current.appendChild(link);
    link.click();
    form.current.removeChild(link);
  }

  function removeFile() {
    setFile('');
    setResult('');
  }

  return (
    <div className="areacsv">
      <form ref={form} className="areacsvform modal-csv">
        <p className="modal-title"> Add Student / Participant List </p>
        <div className="areacsv-links">
          <input type="file" name="img" id="csv-file" onChange={onChange} value=""/>
          <label for="csv-file" className="csv-link">Upload a CSV file</label>
          <input type="button" id="csv-filedownload" onClick={download} value="Download CSV template" />
        </div>
        {file ? (
          <div className="areacsv-filename">
            <i class="fas fa-file-csv fa-2x"></i>
            <div>
              {file?.name}
              <p>Contains {result?.data?.length} entries</p>
            </div>
            <i onClick={removeFile} class="fas fa-times-circle areacsv-remove"></i>
          </div>
        ) : (
          <div className="areacsv-filename" disabled>
            <p>No spreadsheet file detected</p>
          </div>
        )}
        <button className="modal-bottomright-button" onClick={fileUploadHandler} disabled={!file}>
          Add
        </button>
      </form>
    </div>
  );
}
export default CreateCsv;
