import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import { useAlertContext } from "../../../Alerts/AlertContext";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";

import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import Multilevel from "../../../Dropdown/Multilevel";

const Condition = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [showAddition0, setShowAddition0] = useState(false);
  const [showAddition1, setShowAddition1] = useState(false);
  const [showAddition2, setShowAddition2] = useState(false);
  const [showAddition3, setShowAddition3] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  const [updater, setUpdater] = useState(0);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const alertContext = useAlertContext();
  const [ifs, setIfs] = useState(0)
  const lt = "<"
  const gt = ">"
  const start = Object.keys(props.gameVars[0] ? props.gameVars[0] : '').toString()
  const [condition, setCondition] = useState([
    [start, '=', start, '+', ''],
    [start, '=', start, '+', ''],
    [start, '=', start, '+', ''],
    [start, '=', start, '+', ''],
    [start, '=', start, '+', '']
  ])
  const [box, setBox] = useState([
    {
      id: 0,
      state: 'var'
    },
    {
      id: 1,
      state: 'var'
    },
    {
      id: 2,
      state: 'var'
    },
    {
      id: 3,
      state: 'var'
    },
    {
      id: 4,
      state: 'var'
    },
    {
      id: 5,
      state: 'var'
    },
    {
      id: 6,
      state: 'var'
    },
    {
      id: 7,
      state: 'var'
    },
    {
      id: 8,
      state: 'var'
    },
    {
      id: 9,
      state: 'var'
    },
  ]);
  if (!localStorage.conditions) {
    var a = [];
    localStorage.setItem('conditions', JSON.stringify(a));
  }

  useEffect(() => {
    let temp = condition
    if (showAddition) {
      temp[temp.length - 1][4] = start
    }
    if (showAddition0) {
      temp[0][4] = start
    }
    if (showAddition1) {
      temp[1][4] = start
    }
    if (showAddition2) {
      temp[2][4] = start
    }
    if (showAddition3) {
      temp[3][4] = start
    }
    if (!showAddition) {
      temp[temp.length - 1][4] = ''
    }
    if (!showAddition0) {
      temp[0][4] = ''
    }
    if (!showAddition1) {
      temp[1][4] = ''
    }
    if (!showAddition2) {
      temp[2][4] = ''
    }
    if (!showAddition3) {
      temp[3][4] = ''
    }
  })

  const populateConditions = () => {
    let cons = props.cons ? props.cons : 0
    let list = []
    for (let i = 0; i < cons.length; i++) {
      list.push(<div className="condition-inputs cons-condition">
        <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
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
      </div>)
    }

    return list
  }
  const populateSession = () => {
    let cons = JSON.parse(localStorage.getItem('sessionCons')) || [];
    let list = []
    for (let i = 0; i < cons.length; i++) {
      list.push(<div className="condition-inputs cons-condition">
        <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
        {cons[i].map(data => {
          if (cons[i][cons[i].length - 1] !== data) {
            return (
              <div className={"if"}>
                {(cons[i][0] !== data) && (<h1 className="andfix">and</h1>)}<h1>If</h1><h2>{data[0]}</h2><h3>{data[1]}</h3><h2>{data[2]}</h2>
                {(data[3]) && (<><h3>{data[3]}</h3><h2>{data[4]}</h2></>)}
              </div>
            )
          }
        })}
        <div className={"then"}>
          <h1>Then</h1><h2>{cons[i][cons[i].length - 1][0]}</h2><h3>{cons[i][cons[i].length - 1][1]}</h3><h2>{cons[i][cons[i].length - 1][2]}</h2>
          {(cons[i][cons[i].length - 1][3]) && (<><h3>{cons[i][cons[i].length - 1][3]}</h3><h2>{cons[i][cons[i].length - 1][4]}</h2></>)}
        </div>
      </div>)
    }

    return list
  }

  const addCon = () => {
    if (ifs < 1) {
      alertContext.showAlert("A condition needs an if statement!", "warning");
      return
    }
    let a = [];
    let temp = condition
    temp.splice(ifs, 4 - ifs)
    if (props.current === 'session') {
      a = JSON.parse(localStorage.getItem('sessionCons')) || [];
      a.push(temp);
      localStorage.setItem('sessionCons', JSON.stringify(a));
    }
    else if (props.current === 'global') {
      a = JSON.parse(localStorage.getItem('conditions')) || [];
      a.push(temp);
      localStorage.setItem('conditions', JSON.stringify(a));
      props.setCons(a)
    }

    setShowConAdd(!showConAdd)
    setCondition([
      [start, '=', start, '+', ''],
      [start, '=', start, '+', ''],
      [start, '=', start, '+', ''],
      [start, '=', start, '+', ''],
      [start, '=', start, '+', '']
    ])
    setShowAddition(false)
    setShowAddition0(false)
    setShowAddition1(false)
    setShowAddition2(false)
    setShowAddition3(false)
    setIfs(0)
  }
  const deleteCon = (i) => {
    let a = [];
    if (props.current === 'session') {
      a = JSON.parse(localStorage.getItem('sessionCons')) || [];
      a.splice(i, 1);
      localStorage.setItem('sessionCons', JSON.stringify(a));
    }
    else if (props.current === 'global') {
      a = JSON.parse(localStorage.getItem('conditions')) || [];
      a.splice(i, 1);
      localStorage.setItem('conditions', JSON.stringify(a));
      props.setCons(a)
    }
  }
  const handleOut = () => {
    if (props.current === 'global')
      return (populateConditions())
    if (props.current === 'session')
      return (populateSession())
  }

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
        <div className="box">
          {box[i].state === 'var' ? (
            <Multilevel data={props.gameVars} handleChange={handleChange} x={x} y={n}/>
          ) : (
            <input
              onChange={(e) => { condition[x][n] = e.target.value }}
              type="text"
              placeholder="value"
              className="var-val"
            />
          )}

        </div>
      </div>
    )

    return list
  }

  const handleIfStatements = () => {
    let list = []
    for (let i = 0, x = 0; i < ifs; i++, x = x + 2) {
      list.push(
        <>
          <div className="input-area">
            <h2>IF</h2>
            <div>
              <div className="box">       
                <Multilevel data={props.gameVars} handleChange={handleChange} x={i} y={0}/>   
              </div>
            </div>
            <div className="box select">
              <select onChange={(e) => { condition[i][1] = e.target.value }}>
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value={lt}> {lt} </option>
                <option value={gt}> {gt} </option>
              </select>
            </div>
            <div>
              {getSpecialBox(x, 2, i)}
            </div>
            <div className="fixer" >
              {eval("showAddition" + i) && (
                <div className="fixer" >
                  <div className="box select">
                    <select onChange={(e) => { condition[i][3] = e.target.value }}>
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="x"> x </option>
                      <option value="/"> / </option>
                    </select>
                  </div>
                  <div>
                    {getSpecialBox(x + 1, 4, i)}
                  </div>
                </div>
              )}
              <button className="nob" onClick={() => handle(i)}>
                {!eval("showAddition" + i) ? (
                  <Plus className="icon plus specialt" />
                ) : (
                  <Line className="icon plus specialer" />
                )}

              </button>
            </div>
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
      setShowAddition3(!showAddition3)
  }

  const handle2 = () => {
    setShowAddition(!showAddition)
  }
  const handleIfs = (e) => {
    if (parseInt(e.target.value) < 5)
      setIfs(parseInt(e.target.value))

    else
      alertContext.showAlert("If value must be less than 5.", "warning");
  }

  const handleChange = (value, x, y) => {
    console.log(value, x, y)
    condition[x][y] = value.label
  }


  return (
    <>
      {!showConAdd && (
        <>
          {handleOut()}
        </>
      )}
      <div className="variable-add tester" onClick={() => setShowConAdd(true)} hidden={showConAdd}>
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
              <Multilevel data={props.gameVars} handleChange={handleChange} x={4} y={0}/>
            </div>

            <div className="box select jequal">
              <h1>=</h1>
            </div>
            <div>
              {getSpecialBox(8, 2, 4)}
            </div>
            <div className="fixer" >
              {showAddition && (
                <div className="fixer" >
                  <div className="box select">
                    <select onChange={(e) => { condition[4][3] = e.target.value }}>
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="x"> x </option>
                      <option value="/"> / </option>
                    </select>
                  </div>

                  <div>
                    {getSpecialBox(9, 4, 4)}
                  </div>
                </div>
              )}
              <button className="nob" onClick={() => handle2()}>
                {!showAddition ? (
                  <Plus className="icon plus specialt" />
                ) : (
                  <Line className="icon plus specialer" />
                )}
              </button>
            </div>
          </div>
          <div className="con-hold">
            <button className="con-add-b" onClick={() => addCon()}>{t("common.add")}</button>
            <button className="con-can-b" onClick={() => setShowConAdd(false)}>{t("common.cancel")}</button>
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
    </>
  );
}

export default Condition;
