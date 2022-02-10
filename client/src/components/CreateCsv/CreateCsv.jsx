import React, { useState, useRef, useEffect } from "react";
import { parse } from "papaparse"
import "./CreateCsv.css";
import { useAlertContext } from "../Alerts/AlertContext";
import { useTranslation } from "react-i18next";
import axios from 'axios';

const CreateCsv = (props) => {
  const [file, setFile] = useState('');
  const [result, setResult] = useState('');
  const form = useRef();
  const alertContext = useAlertContext();
  const { t } = useTranslation();

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
      if (response.data.replacedroles.length > 0) {
        alertContext.showAlert(t("alert.addedCSVPlayersEmptyRoles", {
          playercount: result.data.length,
          roles: response.data.replacedroles.join(', '),
          rolecount: response.data.replacedroles.length
        }), "warning", 6000);
      } else {
        alertContext.showAlert(t("alert.addedCSVPlayers", {
          count: result.data.length
        }), "info");
      }
      props.success();
      props.close();
    }).catch(err => {
      console.error(err);
      alertContext.showAlert(err?.response?.data?.message || t("alert.genericError"), "error");
    });
  }

  const onChange = (event) => {
    // Parsing only csv files

    if (event.target.files[0].type === 'text/csv' || event.target.files[0].type === 'application/vnd.ms-excel') {
      Array.from(event.target.files).forEach(
        async (file) => {
          const text = await file.text();
          let results = parse(text, { header: true });
          if (results.errors.length > 0) {
            alertContext.showAlert(t("alert.validCSVError"), "error");
            return;
          }
          setResult(results);
          setFile(file);
        }
      );
    } else {
      alertContext.showAlert(t("alert.validCSVError"), "error");
    }
  }

  const download = async () => {
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

  const removeFile = () => {
    setFile('');
    setResult('');
  }

  return (
    <div className="areacsv">
      <form ref={form} className="areacsvform modal-csv">
        <p className="modal-title">{t("modal.addStudentCSV")}</p>
        <div className="areacsv-links">
          <input type="file" name="img" id="csv-file" onChange={onChange} value="" />
          <label for="csv-file" className="csv-link">{t("modal.uploadCSV")}</label>
          <input type="button" id="csv-filedownload" onClick={download} value={t("modal.downloadCSVTemplate")} />
        </div>
        {file ? (
          <div className="areacsv-filename">
            <i className="fas fa-file-csv fa-2x"></i>
            <div>
              {file?.name}
              <p>{t("modal.containsXEntries", { count: result?.data?.length })}</p>
            </div>
            <i onClick={removeFile} className="fas fa-times-circle areacsv-remove"></i>
          </div>
        ) : (
          <div className="areacsv-filename" disabled>
            <p>{t("modal.noCSV")}</p>
          </div>
        )}
        <div className="button-container">
          <button className="modal-button green" onClick={fileUploadHandler} disabled={!file}>
            {t("common.add")}
          </button>
          <button className="modal-button red" onClick={props.close}>
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
export default CreateCsv;
