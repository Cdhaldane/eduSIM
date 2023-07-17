import React, { useContext, useState, useEffect, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useAlertContext } from "../../../Alerts/AlertContext";
import { MenuContext } from "./VariableContext";

import "../../Sidebar.css";
import "./Variable.css"
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Pencil from "../../../../../public/icons/pencil.svg"
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
  const [contextIndex, setContextIndex] = useState(-1)
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }

  const { contextMenu, handleContextMenu, hideContextMenu } = useContext(MenuContext);
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
    if (varType === "boolean") {
      console.log(varValue)
      if (varValue === 'true')
        value = true
      else
        value = false
    }
    if (value !== value || value === NaN) {
      alertContext.showAlert(t("Value Not Valid"), "warning");
      return;
    }
    else if (varName.toLocaleLowerCase() === 'page' || varName.toLocaleLowerCase() === 'deck') {
      alertContext.showAlert(t("VarName cannot be a system Variable, change the name :)"), "warning");
      return;
    }

    if (editingIndex !== -1) {
      let data = variables;
      data[editingIndex] = { [varName]: value }
      if (props.current === 'global') {
        props.setGlobalVars(data);
        setShowAdd(false)
      }
      if (props.current === 'session') {
        props.setLocalVars(data);
        setShowAdd(false)
      }
      setVariables(data)
      setEditingIndex(-1)
    } else {
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
    setVarName('')
    setVarValue('')
    setVarType('integer')
    setEditingIndex(-1)
  }


  const deleteVar = (data) => {
    let newData = [];
    variables.map((item) => {
      if (item !== data)
        newData.push(item)
    })
    if (props.current === 'global') {
      props.setGlobalVars(newData)
    } else {
      props.setLocalVars(newData)
    }
    setVariables(newData)
  }

  const getPageData = (data) => {
    let obj = props.group

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const isObjectInArray = value.variable.some(obj => {
          return Object.entries(data).every(([key, value]) => {
            return obj[key] === value;
          });
        });
        if (isObjectInArray)
          return key

      }
    }
  }
  const handleEdit = (data, i) => {
    setEditingIndex(i)
    setShowAdd(true)
    setVarName(Object.keys(data)[0])
    setVarValue(Object.values(data)[0])
    let type = typeof (Object.values(data)[0])
    if (type === 'number') type = 'integer'
    setVarType(type)
  }

  const populateGameVars = (data) => {
    let list = [];

    for (let i = 0; i < data.length; i++) {
      let x = getPageData(data[i]);
      console.log(Object.values(data[i])[0])
      let divElement = (
        <div className="condition-inputs vars" key={i} onContextMenu={(e) => (handleContextMenu(e, props.page), setContextIndex(i))}>
          <div className='vars-sidebar'>
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(data[i]) }} className="icon var-trash" />
            <Pencil onClick={() => handleEdit(data[i], i)}className="icon var-pencil"/>
            <h4 title={'Group ' + x}>{x}</h4>
          </div>
          <div className="display">
          <h1>{Object.keys(data[i])}</h1>
          <h2> = </h2>
          <h1>{Object.values(data[i]).toString()}</h1>
          </div>
        </div>
      );

      list.push({ x, element: divElement });
    }

    list.sort((a, b) => {
      if (a.x < b.x) {
        return -1;
      } else if (a.x > b.x) {
        return 1;
      }
      return 0;
    });

    const sortedList = list.map(item => item.element);

    return sortedList;
  };

  const handleGame = (e, varName, i) => {
    let vars = variables;
    let key = Object.keys(vars[i])
    vars[i][key] = e;
    if (props.current === 'global')
      props.setGlobalVars(vars);
    if (props.current === 'session')
      props.setLocalVars(vars);
  }



  useEffect(() => {
    if (props.currentPage === 0) {
      if (props.current === 'global')
        setVariables(props.globalVars)
      if (props.current === 'session')
        setVariables(props.localVars)
    }
    else {
      let variable = props.group[props.currentPage] ? props.group[props.currentPage].variable : []
      setVariables(variable)
    }
  }, [props.current, props.globalVars, props.localVars, props.group, props.currentPage])


  return (
    <div className="menu-context-container">
      {!showAdd && (
        <>
          {populateGameVars(variables)}
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
              <option value="boolean">Boolean</option>
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
            {varType !== 'boolean' ? (
              <input type="text" value={varValue} placeholder={"Value"} onChange={(e) => setVarValue(e.target.value)} />
            ) : (
              <select name="var-value" id="var-value" onChange={(e) => setVarValue(e.target.value)} value={varValue}>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            )}
          </div>
          <div className="variable-hold">
            <button onClick={() => addVar()}>{t("common.add")}</button>
            <button onClick={() => {setShowAdd(false), setEditingIndex(-1)}}>{t("common.cancel")}</button>
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
      {contextMenu.show && (
        <div className={`variable-context ${contextMenu.show ? 'show' : ''}`}
          style={{
            top: `${contextMenu.y - props.position.y}px`,
            left: `${contextMenu.x - props.position.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {props.currentPage === 0 ? (
            <button onClick={() => (props.handleGroup(props.page, variables[contextIndex], 'add', 'variable'), hideContextMenu())}>Add to page {props.page}</button>) : (
            <button onClick={() => (props.handleGroup(props.currentPage, variables[contextIndex], 'remove', 'variable'), hideContextMenu())}>Remove from page {props.currentPage}</button>
          )}
        </div>
      )}
    </div>
  );
}

export default Variable;
