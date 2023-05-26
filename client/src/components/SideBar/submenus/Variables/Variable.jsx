import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useAlertContext } from "../../../Alerts/AlertContext";


import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import { use } from "i18next";


const Variable = (props) => {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const [varType, setVarType] = useState("integer")
  const [variables, setVariables] = useState([])
  const [gameText, setGameText] = useState([])
  const [updater, setUpdater] = useState(0);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const alertContext = useAlertContext();

  const addVar = () => {
    let value;
    let arrayVal;
    if (varType === "string")
      value = String(varValue)
    if (varType === "integer" && !varValue.includes('Random'))
      value = parseInt(varValue)
    if (varType === "integer" && varValue.includes('Random'))
      value = varValue
    if (varType === "arrayString") {
      arrayVal = varValue.replace(/\s/g, '')
      arrayVal = arrayVal.split(',')
      value = (arrayVal)
    }
    if (varType === "arrayInt") {
      arrayVal = varValue.replace(/\s/g, '')
      arrayVal = arrayVal.split(',')
      for (let i = 0; i < arrayVal.length; i++) {
        arrayVal[i] = parseInt(arrayVal[i])
      }
      value = (arrayVal)
    }
    if (value !== value || value === NaN) {
      alertContext.showAlert(t("Value Not Valid"), "warning");
      return;
    }
    else if (varName.toLocaleLowerCase() === 'page' || varName.toLocaleLowerCase() === 'deck') {
      alertContext.showAlert(t("VarName cannot be a system Variable, change the name :)"), "warning");
      return;
    }
    else {
      if (props.current === 'global') {
        let data = variables;
        data.push({ [varName]: value })
        props.setGlobalVars(data);
        setShowAdd(false)
      }
      if (props.current === 'session') {
        let data = variables;
        data.push({ [varName]: value })
        props.setLocalVars(data);
        setShowAdd(false)
      }
    }
  }


const deleteVar = (data, i) => {
  data.splice(i, 1)
  if (props.current === 'global') {
    props.setGlobalVars(data)
  } else {
    props.setLocalVars(data)
  }
}

const populateGameVars = (data) => {
  let list = []
  for (let i = 0; i < data.length; i++) {
    list.push(<div className="condition-inputs vars">
      <i onClick={() => { setConfirmationModal(true); setDeleteIndex(data, i); }}><Trash className="icon var-trash" /></i>
      <h1>{Object.keys(data[i])}</h1>
      <h2> = </h2>
      <input type="text" placeholder={data[i] ? Object.values(data[i]) : "Some Value"} onChange={e => handleGame(e.target.value, Object.keys(data[i]), i)} />
    </div>
    )
  }
  return list
}
const handleGame = (e, varName, i) => { 
  let vars = variables;
  let key = Object.keys(vars[i])
  vars[i][key] = e;
  if (props.current === 'global')
  props.setGlobalVars(vars);
  if (props.current === 'session')
  props.setLocalVars(vars);
}


const handleOut = () => {
  let out = []
  if (props.current === 'global')
    out = props.globalVars
  if (props.current === 'session')
    
    out = props.localVars
  return (populateGameVars(out))
}

useEffect(() => {
  if (props.current === 'global')
    setVariables(props.globalVars)
  if (props.current === 'session')
    setVariables(props.localVars)
}, [props.current, props.globalVars, props.localVars])


return (
  <>
    {!showAdd && (
      <>
        {handleOut()}
      </>
    )}
    <div className="variable-add tester" onClick={() => setShowAdd(true)} hidden={showAdd}>
      <Plus className="icon plus" />
      {t("sidebar.addNewVar")}
    </div>

    {showAdd && (props.current === 'global' || props.current === 'session') && (
      <div className="variable-adding">
        <div className="variable-choose">
          <label for="var-type">Variable Type</label>
          <select name="var-type" id="var-type" onChange={(e) => setVarType(e.target.value)} value={varType}>
            <option value="integer">Integer</option>
            <option value="arrayInt">Integer Array</option>
            <option value="string">String</option>
            <option value="arrayString">String Array</option>
          </select>
        </div>
        <div className="variable-hold">
          <h1>Variable Name</h1>
          <input type="text" value={varName} placeholder={"Name"} onChange={(e) => setVarName(e.target.value)} />
        </div>
        <div className="variable-hold">
          <h1>Variable Value</h1>
          <input type="text" value={varValue} placeholder={"Value"} onChange={(e) => setVarValue(e.target.value)} />
        </div>
        <div className="variable-hold">
          <button onClick={() => addVar()}>{t("common.add")}</button>
          <button onClick={() => setShowAdd(false)}>{t("common.cancel")}</button>
        </div>
      </div>
    )}
    <ConfirmationModal
      visible={confirmationVisible}
      hide={() => setConfirmationModal(false)}
      confirmFunction={() => deleteVar(deleteIndex)}
      confirmMessage={"Yes"}
      message={"Are you sure you want to delete this variable? This action cannot be undone."}
    />
  </>
);
}

export default Variable;
