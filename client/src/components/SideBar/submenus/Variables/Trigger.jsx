import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { MenuContext } from "./VariableContext";



import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import MultiLevel from "../../../Dropdown/Multilevel";
import { useAlertContext } from "../../../Alerts/AlertContext";


const Trigger = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [variables, setVariables] = useState(props.globalVars)
  const [fullTriggers, setFullTriggers] = useState([])
  const [shapes, setShapes] = useState()
  const [trigger, setTrigger] = useState([null, null, null]);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [contextIndex, setContextIndex] = useState(-1)
  const [render, setRender] = useState([]);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const alertContext = useAlertContext();
  const { contextMenu, handleContextMenu, hideContextMenu } = useContext(MenuContext);

  useEffect(() => {
    let out = []
    for (let i = 0; i < props.allShapes.length; i++) {
      let name = props.allShapes[i].name
      out.push({ [name]: i })
    }

    setShapes(out)
  }, [props.allShapes])

  const populateTriggers = (trigs) => {
    setFullTriggers(trigs)
    return trigs?.map((trig, i) => (
      <div className="condition-inputs" onContextMenu={(e) => (handleContextMenu(e, props.page), setContextIndex(i))}>
        <div className="variable-buttons">
          <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }} />
          <i onClick={() => handleEdit(i, trigs)} className="lnil lnil-pencil" />
        </div>
        <div className="ints-container">
          <div className="if">
            <h1>When</h1><h2>{trig[0]}</h2> <h1>touches</h1> <h2>{trig[1]}</h2>
          </div>
          <div className="then">
            <h1>Set</h1> <h3>{trig[2]}</h3> <h1>to true.</h1>
          </div>
        </div>
      </div>
    ));
  };

  const addCon = () => {
    if (trigger[0] === null || trigger[1] === null || trigger[2] === null) {
      alertContext.showAlert("Please fill out all fields", "warning")
      return
    }
    let trig = trigger.flatMap(x => x)
    console.log(props)
    trig.push(props.page)
    let data = fullTriggers
    if (editingIndex !== -1) data.splice(editingIndex, 1, trig)
    else data.push(trig)
    if (props.current === 'global') props.setGlobalTrigs(data)
    if (props.current === 'session') props.setLocalTrigs(data)
    setShowConAdd(!showConAdd)
  }
  const deleteCon = (i) => {
    let data = fullTriggers
    data.splice(i, 1)
    if (props.current === 'global') props.setGlobalTrigs(data)
    if (props.current === 'session') props.setLocalTrigs(data)
    setConfirmationModal(false);
  }

  const handleInteraction = (index, e) => {
    const value = e.target.value;
    if (index === 0) {
      setTrigger([value, trigger[1] !== value ? trigger[1] : null, trigger[2]]);
    } else if (index === 1 && value !== trigger[0]) {
      setTrigger([trigger[0], value, trigger[2]]);
    }
  };

  const handleChange = (value, x) => {
    let input = [...trigger]
    input[x] = value.label
    setTrigger(input)
  }



  const handleEdit = (i, trigs) => {
    let x = trigs[i]

    setTrigger(x)
    setShowConAdd(!showConAdd)
    setEditingIndex(i)
  }

  useEffect(() => {
    let out;
    if (props.currentPage === 0) {
      if (props.current === 'global') {
        out = props.globalTrigs
        setVariables(props.globalVars)
      }
      if (props.current === 'session') {
        out = props.localTrigs
        setVariables(props.localVars)
      }
    } else {
      let trigger = props.group[props.currentPage] ? props.group[props.currentPage].trigger : []
      out = trigger
    }



    setRender(populateTriggers(out))
  }, [props.current, props.localTrigs, props.globalTrigs, props.localVars, props.globalVars, shapes, props.currentPage, props.group])

  return (
    <>
      {!showConAdd && (
        <>
          {render}
        </>
      )}
      <div className="variable-add tester" onClick={() => (setShowConAdd(true), setTrigger(['', '', '']))} hidden={showConAdd}>
        <Plus className="icon plus" />
        ADD NEW TRIGGER
      </div>

      {showConAdd && (
        <div className="variable-adding trigs-fix">
          <div className="trigs-area">
            <div className="trigger-name">
              <h1>Variable to Set</h1>
              <MultiLevel data={variables} handleChange={handleChange} baseValue={trigger[2]} x={2} className="trigger-multi" />
            </div>
            <div className='trigger-container'>
              <h2>WHEN SHAPE</h2>
              <div className="trigger-box">
                <MultiLevel data={shapes} handleChange={handleChange} baseValue={trigger[0]} x={0} className="trigger-shapes" />
              </div>
              <div className="trigger-touch">
                <h1>TOUCHES</h1>
              </div>
              <div className="trigger-box">
                <MultiLevel data={
                  shapes.filter(data => {
                    const keys = Object.keys(data);
                    return !keys.includes(trigger[0][0]);
                  })
                } handleChange={handleChange} baseValue={trigger[1]} x={1} className="trigger-shapes" />
              </div>
            </div>

          </div>
          <div className="con-hold">
            <button className="con-add-b" onClick={() => addCon()}>{editingIndex === -1 ? t("common.add") : "Edit"}</button>
            <button className="con-can-b" onClick={() => (setShowConAdd(false), setEditingIndex(-1))}>{t("common.cancel")}</button>
          </div>
        </div>
      )}
      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={() => deleteCon(deleteIndex)}
        confirmMessage={"Yes"}
        message={"Are you sure you want to delete this interaction? This action cannot be undone."}
      />
      {contextMenu.show && (
        <div className={`variable-context ${contextMenu.show ? 'show' : ''}`}
          style={{
            top: `${contextMenu.y - props.position.y}px`,
            left: `${contextMenu.x - props.position.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {props.currentPage === 0 ? (
            <button onClick={() => (props.handleGroup(props.page, fullTriggers[contextIndex], 'add', 'trigger'), hideContextMenu())}>Add to page {props.page}</button>) : (
            <button onClick={() => (props.handleGroup(props.currentPage, fullTriggers[contextIndex], 'remove', 'trigger'), hideContextMenu())}>Remove from page {props.currentPage}</button>
          )}
        </div>
      )}
    </>
  );
}

export default Trigger;
