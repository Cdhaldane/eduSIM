import React, { useState } from 'react'
import ReactDom from 'react-dom'
import Button from "../Buttons/Button"
import "../CsvModal/CsvModal.css";
import Papa from 'papaparse';

const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#FFF',
  padding: '50px',
  zIndex: 1000,
  width: 700,
  height: 500
}

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, .7)',
  zIndex: 1000
}

function CsvModal({ open, children, onClose }) {

  const [csvfile, setCsvfile] = useState(undefined);
  const updateData = updateData.bind();

  const handleChange = (event) => {
    setCsvfile(event.target.files[0]);
  }

  const importCSV = () => {
    Papa.parse(csvfile, {
      complete: updateData,
      header: true
    });
  }

  const updateData = (result) => {
    let data = result.data;
  }

  const onChange = (event) => {
    setCsvfile(event.target.files[0]);
  }

  if (!open) {
    return null;
  }

  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} />
      <div style={MODAL_STYLES}>
        <h2>Add Student/Participant</h2>
        <div>
          <h2>Import CSV File!</h2>
          <input
            className="csv-input"
            type="file"
            name="file"
            placeholder={null}
            onChange={onChange}
          />
          <p />
          <button onClick={importCSV}> Upload now!</button>
        </div>
        <Button onClick={onClose} type="submit">Save</Button>
        {children}
      </div>
    </>,
    document.getElementById('portal')
  )
}

export default CsvModal;
