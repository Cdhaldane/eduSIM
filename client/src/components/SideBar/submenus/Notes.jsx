import React, { useContext, useState, useEffect} from "react";
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
  const [noteData, setNoteData] = useState(localStorage.notes ? JSON.parse(localStorage.notes) : []);
  const [noteTitle, setNoteTitle] = useState();
  const [noteBody, setNoteBody] = useState();
  const [editMode, setEditMode] = useState(false)
  const [index, setIndex] = useState(-1)
  const [editText, setEditText] = useState();
  const [editTitle, setEditTitle] = useState();

  useEffect(() => {
    if(!checked){
      setNoteData(props.notes)
    } else {
      setNoteData(localStorage.notes ? JSON.parse(localStorage.notes) : [])
    }
  }, [checked])

  useEffect(() => {
      if(!checked){
        setNoteData(props.notes)
    }
  }, [props.notes])

  useEffect(() => {
    setUpdater(updater + 1)
  }, [])

  const addNote = () => {
    let add = [noteTitle,noteBody]
    if(checked){
      let out = localStorage.notes ? JSON.parse(localStorage.notes) : []
      out.push(add)
      setNoteData(out)
      localStorage.setItem("notes", JSON.stringify(out))
    } else {
      let out = props.notes || [];
      out.push(add)
      props.setNotes(out)
    }
    setUpdater(updater + 1)
    setNoteTitle('')
    setNoteBody('')
    setShowAdd(false)
  }

  const deleteNote = (i) => {
    let out = localStorage.notes ? JSON.parse(localStorage.notes) : []
    out.splice(i, 1);
    localStorage.setItem("notes", JSON.stringify(out))
    setNoteData(out)
    setUpdater(updater + 1)
  }

  const editNote = (i) => {
    setEditMode(true)
    setIndex(i)
    setEditText(noteData[i][1])
    setEditTitle(noteData[i][0])
  }
  const handleEdit = (i) => {
    let out = localStorage.notes ? JSON.parse(localStorage.notes) : []
    out[i] = [editTitle, editText]
    localStorage.setItem("notes", JSON.stringify(out))
    setNoteData(out)
    setUpdater(updater + 1)
    setEditMode(false)
  }
  const handleTextArea = (e) => {
    setEditText(e)
  }
  const handleTitleArea = (e) => {
    setEditTitle(e)
  }

  const calculateNotes = () => {
    let list = []

    for(let i =0; i < noteData.length; i ++){
      list.push(
        <div key={i}>
        <div className="notes-card">
          <input
            wrap="soft"
            className="notes-title-card read"
            readOnly={!(editMode && index === i)}
            value={!(editMode && index === i) ? noteData[i][0] : editTitle}
            disabled={!(editMode && index === i)}
            onChange={(e) => handleTitleArea(e.target.value)}
          />
          <textarea
            wrap="soft"
            className="notes-textarea read"
            readOnly={!(editMode && index === i)}
            value={!(editMode && index === i) ? noteData[i][1] : editText}
            disabled={!(editMode && index === i)}
            onChange={(e) => handleTextArea(e.target.value)}
          />
        </div>
        <div className="notes-buttons">
          {!(editMode && index === i) ? <i className="fas fa-pen" onClick={() => editNote(i)}/>
        : <i className="lni lni-checkmark greenMain"  onClick={() => handleEdit(i)}/>
          }
          {!(editMode && index === i) ? <i className="fas fa-trash"  onClick={() => deleteNote(i)} />
          : <i className="lni lni-close red" onClick={() => setEditMode(false)} />}
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
       </div>
       <div className="notes-title">
        <button onClick={() => setChecked(!checked)} disabled={checked}>Personal Notes</button>
        <button onClick={() => setChecked(!checked)} disabled={!checked}>Group Notes</button>
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
