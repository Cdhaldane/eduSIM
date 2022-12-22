import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";


import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"


const Variable = (props) => {
  console.log(props)
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const [varType, setVarType] = useState("integer")
  const [gameText, setGameText] = useState([])
  const [updater, setUpdater] = useState(0);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }


  const addVar = () => {
    let value;
    let arrayVal;
    if(varType === "string")
      value = String(varValue)
    if(varType === "integer" && !varValue.includes('Random'))
      value = parseInt(varValue)
    if(varType === "integer" && varValue.includes('Random'))
      value = varValue
    if(varType === "arrayString"){
      arrayVal = varValue.replace(/\s/g, '')
      arrayVal = arrayVal.split(',')
      value = (arrayVal)
    }
    if(varType === "arrayInt"){
      arrayVal = varValue.replace(/\s/g, '')
      arrayVal = arrayVal.split(',')
      for(let i = 0; i < arrayVal.length; i++){
        arrayVal[i] = parseInt(arrayVal[i])
      }
      value = (arrayVal)
    }
    // if(varValue.includes('Random')){
    //   let n = varValue.replace(/[^0-9]/g, '')
    //   if(n === 0){
    //     value = 'Random'
    //   }
    //   value = 'Random()'
    // }
    setShowAdd(false)
    if(props.current=='session'){
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      sessionStorage.setItem('gameVars', JSON.stringify({
        ...vars,
        [varName]: value
      }));
    } else {
      if(value !== value){
        alertContext.showAlert(t("Value Not Valid"), "warning");
      }
      else {
        let data = { [varName]: value }
        props.setVars(data);
      }
    }
  }

  const handleVarType = (e) => {
    setVarType(e)
  }
  const deleteVar = (i) => {
    if(props.current === 'global'){
      let vars = props ? props.gameVars : 0;
      vars.splice(i, 1);
      props.delVars(vars)
      setUpdater(updater + 1)
    } else {
      let vars = JSON.parse(sessionStorage.gameVars);
      if(Object.keys(vars)[i] !== 'Page')
        delete vars[Object.keys(vars)[i]]
      sessionStorage.setItem("gameVars", JSON.stringify(vars))
      setUpdater(updater + 1)
    }
  }

  const populateGameVars = () => {
   let data = props.gameVars
   let list = []
     for(let i = 0; i < data.length; i++){
       list.push(<div className="condition-inputs vars">
         <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash"/></i>
            <h1>{Object.keys(data[i])}</h1>
            <h2> = </h2>
            <input type="text" placeholder={data[i] ? Object.values(data[i]) : "Some Value"} onChange={e => handleGame(e.target.value,  Object.keys(data[i]), i)}/>
       </div>
      )
     }
   return list
 }
  const handleGame = (e, varName, i) => {
    setGameText(e)
    let vars = props ? props.gameVars : 0;
    let key = Object.keys(vars[i])
    vars[i][key] = e;
    props.editVars(vars);
  }
  const populateSessionVars = () => {
    let data = JSON.parse(sessionStorage.gameVars)
    let list = []
      for(let i = 0; i < Object.keys(data).length; i++){
        list.push(<div className="condition-inputs vars">
          <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash"/></i>
             <h1>{Object.keys(data)[i]}</h1>
             <h2> = </h2>
             <input type="text" placeholder={data ? Object.values(data)[i] : "Some Value"} onChange={e => handleSession(e.target.value,  Object.keys(data)[i], i)}/>
        </div>
       )
      }
    return list
  }
  const handleSession = (e, varName) => {
    let data = JSON.parse(sessionStorage.gameVars)
    data[varName] = e
    sessionStorage.setItem('gameVars', JSON.stringify(data))
  }

  const handleOut = () => {
    if(props.current === 'global')
      return(populateGameVars())
    if(props.current === 'session')
      return(populateSessionVars())
  }

  return (
    <>
      {!showAdd && (
        <>
        {handleOut()}
        </>
      )}
      <div className="variable-add tester" onClick={() => setShowAdd(true)} hidden={showAdd}>
        <Plus className="icon plus"/>
        {t("sidebar.addNewVar")}
      </div>

      {showAdd && (props.current === 'global' || props.current === 'session') && (
        <div className="variable-adding">
          <div className="variable-choose">
            <label for="var-type">Variable Type</label>
          <select name="var-type" id="var-type" onChange={(e) => handleVarType(e.target.value)} value={varType}>
                <option value="integer">Integer</option>
              <option value="arrayInt">Integer Array</option>
                <option value="string">String</option>
                <option value="arrayString">String Array</option>

              </select>
          </div>
          <div className="variable-hold">
            <h1>Variable Name</h1>
            <input type="text" value={varName} placeholder={"Name"} onChange={(e) => setVarName(e.target.value)}/>
          </div>
          <div className="variable-hold">
            <h1>Variable Value</h1>
            <input type="text" value={varValue} placeholder={"Value"} onChange={(e) => setVarValue(e.target.value)}/>
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
