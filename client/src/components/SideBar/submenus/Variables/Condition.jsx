import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useAlertContext } from "../../../Alerts/AlertContext";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { MenuContext } from "./VariableContext";

import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import Pencil from "../../../../../public/icons/pencil.svg"
import Multilevel from "../../../Dropdown/Multilevel";


const EMPTY_CONDITION = ['', '=', '', '+', ''];
const INITIAL_CONDITIONS = Array(5).fill(EMPTY_CONDITION);

const Condition = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [showAddition0, setShowAddition0] = useState(false);
  const [showAddition1, setShowAddition1] = useState(false);
  const [showAddition2, setShowAddition2] = useState(false);
  const [showAddition3, setShowAddition3] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  const [variables, setVariables] = useState(props.globalVars)
  const [shapes, setShapes] = useState()
  const [editState, setEditState] = useState([])


  const [editingIndex, setEditingIndex] = useState(-1);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [contextIndex, setContextIndex] = useState(-1)
  const confirmationVisibleRef = useRef(confirmationVisible);
  const [render, setRender] = useState([]);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const alertContext = useAlertContext();
  const [ifs, setIfs] = useState(1)
  const lt = "<"
  const gt = ">"
  const [fullConditions, setFullConditions] = useState([])
  const { contextMenu, handleContextMenu, hideContextMenu } = useContext(MenuContext);

  const [condition, setCondition] = useState([
    ['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', '']
  ])
  const [box, setBox] = useState([
    { id: 0, state: 'var' },
    { id: 1, state: 'var' },
    { id: 2, state: 'var' },
    { id: 3, state: 'var' },
    { id: 4, state: 'var' },
    { id: 5, state: 'var' },
    { id: 6, state: 'var' },
    { id: 7, state: 'var' },
    { id: 8, state: 'var' },
    { id: 9, state: 'var' },
  ]);
  if (!localStorage.conditions) {
    var a = [];
    localStorage.setItem('conditions', JSON.stringify(a));
  }

  useEffect(() => {
    let out = []
    for (let i = 0; i < props.allShapes.length; i++) {
      let name = props.allShapes[i].name
      out.push({ [name]: i })
    }

    setShapes(out)
  }, [props.allShapes])




  useEffect(() => {
    let out = ([['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', '']])
    setCondition(out)
  }, [props.globalCons, props.localCons])

  const getPageData = (data) => {
    let obj = props.group
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const isObjectInArray = value.condition.some(subArrayA =>
          subArrayA.length === data.length &&
          subArrayA.every((val, index) => JSON.stringify(val) === JSON.stringify(data[index]))
        );
        if (isObjectInArray)
          return key

      }
    }
  }

  const populateConditions = (cons) => {
    setFullConditions(cons)
    let list = []
    for (let i = 0; i < cons.length; i++) {
      let x = getPageData(cons[i]);
      list.push(<div className="condition-inputs cons-condition" onContextMenu={(e) => (handleContextMenu(e, props.page), setContextIndex(i))} key={i}>
        <div className="variable-buttons">
          <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(cons[i]); }} />
          <Pencil onClick={() => handleEdit(i, cons)} />

        </div>

        <div className="ints-container">
          {cons[i].map(data => {
            if (cons[i][cons[i].length - 1] !== data) {
              return (
                <div className={"if"}>
                  {(cons[i][0] !== data) && (<h1 className="andfix">and</h1>)}<h1>If</h1><h2>{data[0]}</h2><h3>{data[1]}</h3><h2>{data[2]}</h2>
                  {(data[4]) && (<><h3>{data[3]}</h3><h2>{data[4]}</h2></>)}
                </div>
              )
            }
          })}
          <div className={"then"}>
            <h1>Then</h1><h2>{cons[i][cons[i].length - 1][0]}</h2><h3>{cons[i][cons[i].length - 1][1]}</h3><h2>{cons[i][cons[i].length - 1][2]}</h2>
            {(cons[i][cons[i].length - 1][4]) && (<><h3>{cons[i][cons[i].length - 1][3]}</h3><h2>{cons[i][cons[i].length - 1][4]}</h2></>)}
          </div>
        </div>

        <h4 className="con-h4" title={'Group ' + x}>{x}</h4>
      </div>)
    }

    return list
  }


  const addCon = () => {
    if (ifs < 1) {
      alertContext.showAlert("A condition needs an if statement!", "warning");
      return
    }
    let newItem = condition
    newItem.splice(ifs, 4 - ifs)
    if (props.current === 'session') {
      let data = fullConditions
      data.push(newItem)
      props.setLocalCons(data)
    }
    else if (props.current === 'global') {
      const data = [...fullConditions]
      const out = [...props.globalCons]
      const page = getPageData(editState);
      const index = out.findIndex(item => _.isEqual(item, editState));
      if (editingIndex !== -1) {
        if (page > 0) {
          props.handleGroup(page, editState, 'remove', 'condition');
          props.handleGroup(page, newItem, 'add', 'condition');
        }

        out[index] = newItem
        props.setGlobalCons(out)

      } else {
        if (props.currentPage !== 0) {
          props.handleGroup(props.currentPage, newItem, 'add', 'condition');
        }
        props.setGlobalCons([...props.globalCons, newItem])
      }

    }

    setShowConAdd(!showConAdd)
    setCondition([
      ['', '=', '', '+', ''],
      ['', '=', '', '+', ''],
      ['', '=', '', '+', ''],
      ['', '=', '', '+', ''],
      ['', '=', '', '+', '']
    ])
    setEditingIndex(-2)
    setShowAddition(false)
    setShowAddition0(false)
    setShowAddition1(false)
    setShowAddition2(false)
    setShowAddition3(false)
    setEditState([])
    setIfs(1)
  }

  const deleteCon = (con) => {
    let data = props.current === 'global' ? props.globalCons : props.localCons

    let page = getPageData(con)
    let out = []
    data.map((item, index) => {
      if (JSON.stringify(item) !== JSON.stringify(con)) {
        out.push(item)
      }
    })
    if (props.current === 'global') {
      props.setGlobalCons(out)
    } else {
      props.setLocalCons(out)
    }

    props.handleGroup(page, con, 'remove', 'condition')
    setConfirmationModal(false)
    setEditingIndex(-1)
  }
  const handleEdit = (i, cons) => {
    props.setHeight(120)
    let data = cons[i].map((item) => Array.isArray(item) ? [...item] : { ...item });
    let out = ([['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', ''],
    ['', '=', '', '+', '']])

    for (let j = 0; j < cons[i].length; j++) {
      if (j < cons[i].length - 1) {
        out[j] = cons[i][j]
      }
      else {
        out[4] = cons[i][cons[i].length - 1]
      }
    }
    for (let j = 0; j < out.length; j++) {
      if (out[j][4] != '') handleEditState(j, true)
      else handleEditState(j, false)
    }
    if (cons[i].length > 5)
      setIfs(cons[i].length - 2)
    else setIfs(cons[i].length - 1)

    setEditState(data)
    setCondition(out)
    setShowConAdd(!showConAdd)
    setEditingIndex(i)
  }

  useEffect(() => {
    let out;
    if (props.currentPage === 0) {
      if (props.current === 'global') {
        out = props.globalCons
        setVariables(props.globalVars)
      }
      if (props.current === 'session') {
        out = props.localCons
        setVariables(props.localVars)
      }
    }
    else {
      let conditions = props.group[props.currentPage] ? props.group[props.currentPage].condition : []
      out = conditions
    }
    setRender(populateConditions(out))
  }, [props.current, props.localCons, props.globalCons, props.localVars, props.globalVars, editingIndex, props.group, props.currentPage])

  const updateState = (n, i) => {
    const newState = box.map(obj => {
      if (obj.id === i) {
        return { ...obj, state: n };
      }
      return obj;
    });
    setBox(newState);
  };

  const getSpecialBox = (i, n, x) => {
    let list = []
    list.push(
      <div className='var-box'>
        <button style={{ backgroundColor: box[i].state === 'var' ? 'var(--primary)' : "white", color: box[i].state === 'var' ? 'white' : "black" }} onClick={() => updateState('var', i)}>Var</button>
        <button style={{ backgroundColor: box[i].state === 'val' ? 'var(--primary)' : "white", color: box[i].state === 'val' ? 'white' : "black" }} onClick={() => updateState('val', i)}>Val</button>
        <div className="box int-special">
          {box[i].state === 'var' ? (
            <Multilevel data={variables} handleChange={handleChange} x={x} y={n} baseValue={condition[x][n]} />
          ) : (
            <input
              onChange={(e) => { handleSelectChange(e.target, x, n) }}
              type="text"
              placeholder="value"
              className="int-box"
              value={condition[x][n]}
            />
          )}

        </div>
      </div>
    )

    return list
  }

  const handleSelectChange = (event, x, y) => {
    // Make a copy of your state
    let newCondition = [...condition];
    // Change the value at the specific index
    newCondition[x][y] = event.value;
    // Update the state
    setCondition(newCondition);
  };


  const handleIfStatements = () => {
    let list = []
    for (let i = 0, x = 0; i < ifs; i++, x = x + 2) {
      list.push(
        <>
          <div className="input-area">
            <h2>IF</h2>
            <div>
              <div className="box">
                <Multilevel data={variables} handleChange={handleChange} x={i} y={0} baseValue={condition[i][0]} />
              </div>
            </div>
            <div className="box jequal select">
              <select onChange={(e) => handleSelectChange(e.target, i, 1)} value={condition[i][1]}>
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value={lt}> {lt} </option>
                <option value={gt}> {gt} </option>
              </select>
            </div>
            <div>
              {getSpecialBox(x, 2, i)}
            </div>

            {eval("showAddition" + i) && (
              < >
                <div className="box jequal select">
                  <select onChange={(e) => { handleSelectChange(e.target, i, 3) }} value={condition[i][3]}>
                    <option value="+">+</option>
                    <option value="-">-</option>
                    <option value="x"> x </option>
                    <option value="/"> / </option>
                  </select>
                </div>
                <div>
                  {getSpecialBox(x + 1, 4, i)}
                </div>
              </>
            )}
            <button className="nob" onClick={() => handle(i)}>
              {!eval("showAddition" + i) ? (
                <Plus className="icon plus specialt" />
              ) : (
                <Line className="icon plus specialer" />
              )}

            </button>

          </div>
        </>
      )
    }
    return list
  }

  const handle = (i) => {
    if (i === 0)
      setShowAddition0(!showAddition0)
    if (i === 1)
      setShowAddition1(!showAddition1)
    if (i === 2)
      setShowAddition2(!showAddition2)
    if (i === 3)
      setShowAddition3(!showAddition)
  }
  const handleEditState = (i, bool) => {
    if (i === 0)
      setShowAddition0(bool)
    if (i === 1)
      setShowAddition1(bool)
    if (i === 2)
      setShowAddition2(bool)
    if (i === 3)
      setShowAddition3(bool)
    if (i === 4)
      setShowAddition(bool)
  }

  const handle2 = () => {
    setShowAddition(!showAddition)
  }
  const handleIfs = (e) => {
    if (parseInt(e.target.value) < 5)
      setIfs(parseInt(e.target.value))
    if (!e.target.value) {
      setIfs(1)
    }
    else
      alertContext.showAlert("If value must be less than 5.", "warning");
  }

  const handleChange = (value, x, y) => {
    condition[x][y] = value.label
  }

  const handleOpenModal = () => {
    props.setHeight(120)
    setShowConAdd(true)
    setEditingIndex(-1)
  }
  useEffect(() => {
    if (editingIndex < 0)
      props.setHeight(180)
  }, [editingIndex]);
  return (
    <>
      {!showConAdd && (
        <>
          {render}
        </>
      )}
      <div className="variable-add tester" onClick={() => handleOpenModal()} hidden={showConAdd}>
        <Plus className="icon plus" />
        ADD NEW CONDITION
      </div>

      {showConAdd && (
        <div className="variable-con-adding">
          <div className="con-ifs">
            <h1>Set Number of If Statements</h1>
            <input
              onChange={(e) => handleIfs(e)}
              maxLength="1"
              placeholder="Value"
            />
          </div>
          {handleIfStatements()}
          <div className="input-area">
            <h2 className="smaller-text">THEN</h2>
            <div className="box">
              <Multilevel data={variables} handleChange={handleChange} baseValue={editingIndex !== -1 && condition[4][0]} x={4} y={0} />
            </div>

            <div className="box select jequal">
              <h1>=</h1>
            </div>
            <div>
              {getSpecialBox(8, 2, 4)}
            </div>

            {showAddition && (
              <>
                <div className="box jequal select">
                  <select onChange={(e) => { handleSelectChange(e.target, 4, 3) }} value={condition[4][3]}>
                    <option value="+">+</option>
                    <option value="-">-</option>
                    <option value="x"> x </option>
                    <option value="/"> / </option>
                  </select>
                </div>

                <div>
                  {getSpecialBox(9, 4, 4)}
                </div>
              </>
            )}
            <button className="nob" onClick={() => handle2()}>
              {!showAddition ? (
                <Plus className="icon plus specialt" />
              ) : (
                <Line className="icon plus specialer" />
              )}
            </button>

          </div>
          <div className="con-hold">
            <button className="con-add-b" onClick={() => addCon()}>{editingIndex === -1 ? t("common.add") : "Edit"}</button>
            <button className="con-can-b" onClick={() => { setShowConAdd(false), setEditingIndex(-1) }}>{t("common.cancel")}</button>
          </div>
        </div>
      )}
      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={() => deleteCon(deleteIndex)}
        confirmMessage={"Yes"}
        message={"Are you sure you want to delete this condition? This action cannot be undone."}
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
            <button onClick={() => (props.handleGroup(props.page, fullConditions[contextIndex], 'add', 'condition'), hideContextMenu())}>Add to page {props.page}</button>) : (
            <button onClick={() => (props.handleGroup(props.currentPage, fullConditions[contextIndex], 'remove', 'condition'), hideContextMenu())}>Remove from page {props.currentPage}</button>
          )}
        </div>
      )}
    </>
  );
}

export default Condition;
