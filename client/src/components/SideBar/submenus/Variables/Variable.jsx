import React, { useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useAlertContext } from "../../../Alerts/AlertContext";
import { MenuContext } from "./VariableContext";

import "../../Sidebar.css";
import "./Variable.css"
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Pencil from "../../../../../public/icons/pencil.svg"
import { set } from "draft-js/lib/EditorState";


const VariableTypes = {
  BOOLEAN: "boolean",
  INTEGER: "integer",
  ARRAY_INT: "arrayInt",
  STRING: "string",
  ARRAY_STRING: "arrayString",
};

const Variable = ({ globalVars, localVars, setGlobalVars, setLocalVars, group, handleGroup, current, currentPage, page, position }) => {
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const [varType, setVarType] = useState("integer")
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

  const variables = useMemo(() => {
    if (currentPage === 0) {
      return current === 'global' ? globalVars : localVars;
    }
    const groupVariables = group[currentPage]?.variable;
    return groupVariables ? groupVariables : [];
  }, [currentPage, current, globalVars, localVars, group]);

  const getValueByVarType = useCallback((type, value) => {
    switch (type) {
      case VariableTypes.STRING:
        return String(value);
      case VariableTypes.INTEGER:
        return value.includes('Random') ? value : parseInt(value);
      case VariableTypes.ARRAY_STRING:
      case VariableTypes.ARRAY_INT:
        const arrayVal = value.replace(/\s/g, '').split(',');
        return type === VariableTypes.ARRAY_INT ? arrayVal.map(Number) : arrayVal;
      case VariableTypes.BOOLEAN:
        return value === 'true';
      default:
        return undefined;
    }
  }, []);

  const addVar = useCallback(() => {
    const value = getValueByVarType(varType, varValue);
    console.log(varValue)
    if (value !== value || value === NaN) {
      alertContext.showAlert(t("Value Not Valid"), "warning");
      return;
    } else if (['page', 'deck'].includes(varName.toLowerCase())) {
      alertContext.showAlert(t("VarName cannot be a system Variable, change the name :)"), "warning");
      return;
    }
  
    const newItem = { [varName]: value };
    const data = [...variables];
    const out = [...globalVars];
  
    if (editingIndex !== -1) {
      const removedItem = { ...variables[editingIndex] };
      const page = getPageData(removedItem);
      const index = out.findIndex(item => _.isEqual(item, removedItem));
      
      data[editingIndex] = newItem;
      if (current === 'global') {
        if (page > 0) {
          handleGroup(page, removedItem, 'remove', 'variable');
          handleGroup(page, newItem, 'add', 'variable');
        }
        if (currentPage === 0) {
          setGlobalVars(data);
        } else {
          out[index] = newItem;
          setGlobalVars(out);
        }
      } else if (current === 'session') {
        setLocalVars(data);
      }
    } else {
      data.push(newItem);
      if (current === 'global') {
        if (currentPage !== 0) {
          handleGroup(currentPage, newItem, 'add', 'variable');
        }
        setGlobalVars([...out, newItem]);
      } else if (current === 'session') {
        setLocalVars(data);
      }
    }
  
    setShowAdd(false);
    setVarName('');
    setVarValue('');
    setVarType('integer');
    setEditingIndex(-1);
  }, [varType, varValue, varName, editingIndex, current, currentPage, globalVars, localVars, getValueByVarType]);

  const deleteVar = useCallback((data) => {
    let newData = [];
    let out = [];
    let fullAraay = current === 'global' ? globalVars : localVars
    variables.map((item) => {
      if (item !== data)
        newData.push(item)
    })
    fullAraay.map((item) => {
      if (!_.isEqual(data, item))
        out.push(item)
    })
    if (current === 'global') {
      setGlobalVars(out)
    } else {
      setLocalVars(out)
    }
    let page = getPageData(data)
    handleGroup(page, data, 'remove', 'variable')

  }, [current, globalVars, localVars]);

  const handleEdit = useCallback((data, i) => {
    setEditingIndex(i)
    setShowAdd(true)
    setVarName(Object.keys(data)[0])
    setVarValue(Object.values(data)[0])
    let type = typeof (Object.values(data)[0])
    if (type === 'number') type = 'integer'
    setVarType(type)
  }, []);

  const populateGameVars = useCallback((data) => {
    let list = [];
    console.log(data)
    for (let i = 0; i < data.length; i++) {
      let x = getPageData(data[i]);
      let divElement = (
        <div className="condition-inputs vars" key={i} onContextMenu={(e) => (handleContextMenu(e, page), setContextIndex(i))}>
          <div className='vars-sidebar'>
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(data[i]) }} className="icon var-trash" />
            <Pencil onClick={() => handleEdit(data[i], i)} className="icon var-pencil" />
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
  }, [handleContextMenu, page]);

  const getPageData = (data) => {
    if (data === undefined) return
    let obj = group
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

  useEffect(() => { 
    if(varType === 'boolean') setVarValue('true') 
    else setVarValue('')
  }, [varType]);

  return (
    <div className="menu-context-container">
      {!showAdd && populateGameVars(variables)}
      <div className="variable-add tester" onClick={() => setShowAdd(true)} hidden={showAdd}>
        <Plus className="icon plus" />
        {t("sidebar.addNewVar")}
      </div>

      {showAdd && (current === 'global' || current === 'session') && (
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
              <select name="var-value" id="var-value" onChange={(e) => {setVarValue(e.target.value), console.log(e.target.value)}} value={varValue}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            )}
          </div>
          <div className="variable-hold">
            <button onClick={() => addVar()}>{t("common.add")}</button>
            <button onClick={() => { setShowAdd(false), setEditingIndex(-1) }}>{t("common.cancel")}</button>
          </div>
        </div>
      )}
      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationVisible(false)}
        confirmFunction={() => deleteVar(deleteIndex)}
        confirmMessage={"Yes"}
        message={"Are you sure you want to delete this variable? This action cannot be undone."}
      />
      {contextMenu.show && (
        <div className={`variable-context ${contextMenu.show ? 'show' : ''}`}
          style={{
            top: `${contextMenu.y - position.y}px`,
            left: `${contextMenu.x - position.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {currentPage === 0 ? (
            <button onClick={() => (handleGroup(page, variables[contextIndex], 'add', 'variable'), hideContextMenu())}>Add to page {page}</button>) : (
            <button onClick={() => (handleGroup(currentPage, variables[contextIndex], 'remove', 'variable'), hideContextMenu())}>Remove from page {currentPage}</button>
          )}
        </div>
      )}
    </div>
  );
}

export default Variable;
