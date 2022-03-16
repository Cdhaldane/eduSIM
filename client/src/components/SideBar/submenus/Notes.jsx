import React, { useContext, useState} from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { SettingsContext } from "../../../App";
import { useTranslation } from "react-i18next";
import Switch from "react-switch";

import "../Sidebar.css";


const Notes = (props) => {
  const { t } = useTranslation();
  const { updateSetting, settings } = useContext(SettingsContext);
  const [personal, setPersonal] = useState([])
  const [current, setCurrent] = useState();
  const [updater, setUpdater] = useState(0);
  const [checked, setChecked] = useState(true)
  const [showAdd, setShowAdd] = useState(false);
  const [noteData, setNoteData] = useState( []);
  const [noteTitle, setNoteTitle] = useState();
  const [noteBody, setNoteBody] = useState();

  const addNote = () => {
    let add = [noteTitle,noteBody]
    setUpdater(updater + 1)
    noteData.push(add)
    setNoteTitle('')
    setNoteBody('')
  }

  const calculateNotes = () => {
    let list = []

    for(let i =0; i < noteData.length; i ++){
      list.push(
        <div>
        <div className="notes-card">
          <h1>{noteData[i][0]}</h1>
          <textarea
            wrap="soft"
            className="notes-textarea read"
            readOnly
            value={noteData[i][1]}
            disabled="yes"
          />

        </div>
        <div className="notes-buttons">
          <button onClick={""}>
            <i className="fas fa-pen" />
          </button>
          <button onClick={""}>
            <i className="fas fa-trash" />
          </button>
        </div>
      </div>
      )
    }
    return list
  }

  return (
    <div className="sidebar-notes">
      <div className="notes-header">
        <h2>{t("sidebar.notes")}</h2>
          <label id="switch">
            <Switch
              onChange={() => setChecked(!checked)}
              checked={checked}
              className="react-switch"
              uncheckedIcon={false}
              checkedIcon={true}
            />
          </label>
       </div>
       <div className="notes-title">
         {checked ? <h1>Personal Notes</h1> : <h1>Group Notes</h1>}
       </div>
       <div className="notes-main" key={updater}>
         {calculateNotes()}
       </div>
       <div className="variable-add top-note" onClick={() => setShowAdd(true)} hidden={showAdd}>
         <i className="fas fa-plus-circle"  />
         {t("sidebar.addNewNote")}
       </div>
       {showAdd && (
         <div className="variable-adding top-note">
           <div className="variable-hold">
             <input type="text"
               className="notes-text"
               value={noteTitle}
               onChange={(e) => setNoteTitle(e.target.value)}
               placeholder="Title"
              />
           </div>
           <div className="variable-hold">
             <textarea
               wrap="soft"
               className="notes-textarea"
               value={noteBody}
               onChange={(e) => setNoteBody(e.target.value)}
               placeholder="Body"
              />
           </div>
           <div className="variable-hold">
             <button onClick={() => setShowAdd(false)}>{t("common.cancel")}</button>
             <button onClick={() => addNote()}>{t("common.add")}</button>
           </div>
         </div>
       )}
      </div>


  );
}

export default Notes;
