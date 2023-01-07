import React, { useContext, useState, useEffect} from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { SettingsContext } from "../../../App";
import { useTranslation } from "react-i18next";
import Switch from "react-switch";

import "../Sidebar.css";


import Check from "../../../../public/icons/checkmark.svg"
import Pencil from "../../../../public/icons/pencil.svg"
import Close from "../../../../public/icons/close.svg"
import Plus from "../../../../public/icons/circle-plus.svg"
import Trash from "../../../../public/icons/trash-can-alt-2.svg"

const Notes = (props) => {
  const { t } = useTranslation();
  const { updateSetting, settings } = useContext(SettingsContext);
  const [personal, setPersonal] = useState([])
  const [current, setCurrent] = useState();
  const [updater, setUpdater] = useState(0);
  const [checked, setChecked] = useState(true)
  const [showAdd, setShowAdd] = useState(false);
  const [noteData, setNoteData] = useState(localStorage.notes ? JSON.parse(localStorage.notes) : []);
  const [noteLog, setNoteLog] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState([]);
  const [noteTitle, setNoteTitle] = useState();
  const [noteBody, setNoteBody] = useState();
  const [editMode, setEditMode] = useState(false)
  const [index, setIndex] = useState(-1)
  const [editText, setEditText] = useState();
  const [editTitle, setEditTitle] = useState();

  useEffect(() => {
    if(props.notes?.notes && props.notes?.notes.length > 0){
      for(let i = 0; i < props.notes.notes.length; i++){
        noteLog.push(props.notes.notes[i].note)
      }
    }
  }, [props.notes?.notes])

  useEffect(() => {
    if (props.socket) {
      props.socket.on("note", ({ sender, note, group }) => {
        let out = noteLog;
        out.push(note);
        setNoteLog(out)
        setUpdater(updater => updater + 1)
    })
      props.socket.on("delete", ({ sender, note, group }) => {
        let out = noteLog;
        out.splice(note, 1)
        setNoteLog(out)
        setUpdater(updater => updater + 1)
    })
    props.socket.on("edit", ({ sender, note, group, i }) => {
        let out = noteLog;
        out[i] = note;
        setNoteLog(out)
        setUpdater(updater => updater + 1)
  })
  }
  }, []);


  const addNote = () => {
    let add = [noteTitle,noteBody]
    if(checked){
      let out = localStorage.notes ? JSON.parse(localStorage.notes) : []
      out.push(add)
      setNoteData(out)
      localStorage.setItem("notes", JSON.stringify(out))
    } else {
      props.socket.emit("note", {
        note: add,
        group: ""
      });
    }
    setNoteTitle('')
    setNoteBody('')
    setShowAdd(false)
  }

  const deleteNote = (i) => {
    if(checked){
      let out = localStorage.notes ? JSON.parse(localStorage.notes) : []
      out.splice(i, 1);
      localStorage.setItem("notes", JSON.stringify(out))
      setNoteData(out)
    } else {
      props.socket.emit("delete", {
        note: i,
        group: ""
      });
    }
  }

  const editNote = (i) => {
    setEditMode(true)
    setIndex(i)
    setEditText(checked ? noteData[i][1] : noteLog[i][1])
    setEditTitle(checked ? noteData[i][0] : noteLog[i][0])
  }
  const handleEdit = (i) => {
    if(checked){
      let out = localStorage.notes ? JSON.parse(localStorage.notes) : []
      out[i] = [editTitle, editText]
      localStorage.setItem("notes", JSON.stringify(out))
      setNoteData(out)
    } else {
      props.socket.emit("edit", {
        note: [editTitle, editText],
        i: i,
        group: ""
      });
    }
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

    for(let i =0; i < (checked ? noteData.length : noteLog.length); i ++){
      list.push(
        <div key={i}>
        <div className="notes-card" key={updater}>
          <input
            wrap="soft"
            className="notes-title-card read"
            readOnly={!(editMode && index === i)}
            value={!(editMode && index === i) ?(checked ? (noteData[i] ? noteData[i][0] : editTitle) : noteLog[i][0]) : editTitle}
            disabled={!(editMode && index === i)}
            onChange={(e) => handleTitleArea(e.target.value)}
          />
          <textarea
            wrap="soft"
            className="notes-textarea read"
            readOnly={!(editMode && index === i)}
            value={!(editMode && index === i) ? (checked ?  (noteData[i] ? noteData[i][1] : editTitle) : noteLog[i][1]) : editText}
            disabled={!(editMode && index === i)}
            onChange={(e) => handleTextArea(e.target.value)}
          />
        </div>
        <div className="notes-buttons">
          {!(editMode && index === i) ? <i onClick={() => editNote(i)}><Pencil /></i>
        : <i className="greenMain"  onClick={() => handleEdit(i)}><Check /></i>
          }
          {!(editMode && index === i) ? <i  onClick={() => deleteNote(i)} ><Trash /></i>
        : <i className="redMain" onClick={() => setEditMode(false)} ><Close /></i>}
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
       <div className="notes-main" >
         {calculateNotes()}
       </div>
       <div className="top-note-add" onClick={() => setShowAdd(true)} hidden={showAdd}>
         <Plus className="icon small-icon"/>
         {t("sidebar.addNewNote")}
       </div>
       {showAdd && (
         <div className="top-note">
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
