import React, { useCallback, useContext, useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { useAlertContext } from "../../../Alerts/AlertContext";
import { SettingsContext } from "../../../../App";
import { useTranslation } from "react-i18next";
import Draggable from 'react-draggable'
import ReactTooltip from "react-tooltip";
import Switch from "react-switch";

import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import User from "../../../../../public/icons/user.svg"
import Users from "../../../../../public/icons/users-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import Close from "../../../../../public/icons/close.svg"
import Info from "../../../../../public/icons/info.svg"

const Condition = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  const [showAddition2, setShowAddition2] = useState(false);
  const [updater, setUpdater] = useState(0);
  const [ifs, setIfs] = useState(1)
  const lt = "<"
  const gt = ">"
  const start = useState(Object.keys(props.gameVars[0] ? props.gameVars[0] : ''))
  let condition = {
    0: [start, '=', start, '', '', start, '=', start, '', ''],
    1: [start, '=', start, '', '', start, '=', start, '', ''],
    2: [start, '=', start, '', '', start, '=', start, '', ''],
    3: [start, '=', start, '', '', start, '=', start, '', '']
  }
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
  ]);

  useEffect(() => {
    if(showAddition && condition[3] === ''){
      condition[3] = '+'
      condition[4] = start
    }
    if(showAddition2 && condition[8] === ''){
      condition[8] = '+'
      condition[9] = start
    }
  })

  const populateConditions = () => {
    let cons = props.cons ? props.cons : 0
    let list = []
    for(let i  = 0; i < cons.length; i++){
      list.push(<div className="condition-inputs">
        <i onClick={() => deleteCon(i) }><Trash className="icon var-trash"/></i>
        <div className={"if"}>
          <h1>If</h1><h2>{cons[i][0]}</h2><h3>{cons[i][1]}</h3><h2>{cons[i][2]}
          </h2><h3>{cons[i][3]}</h3><h2>{cons[i][4]}</h2>
        </div>
        <div className={"then"}>
          <h1>Then</h1><h2>{cons[i][5]}</h2><h3>{cons[i][6]}</h3><h2>{cons[i][7]}</h2>
          <h3>{cons[i][8]}</h3><h2>{cons[i][9]}</h2>
        </div>
      </div>)
    }
    return list
  }

  const deleteCon = (i) => {
    props.cons.splice(i, 1);
    props.delCons(props.cons)
    setUpdater(updater + 1)
  }
  const handleConditionSelect = (e) => {
    setShowCons(!showCons)
    setCurrentCon(e)
  }
  const addCon = () => {
    let temp = condition
    props.setCons(temp);
    setShowConAdd(!showConAdd)
    setUpdater(updater + 1)
  }

  const handleOut = () => {
    if(props.current === 'global')
      return(populateConditions())
    if(props.current === 'session')
      return(populateConditions())
  }

  const updateState = (n, i, x) => {
    const newState = box.map(obj => {
      console.log(obj)
      if (obj[x].id === i) {
        return {...obj[x], state: n};
      }
      return obj[x];
    });
    console.log(newState)
    setBox(newState);
  };

  const getSpecialBox = (i, n, x) => {
    let list = []
    list.push(
      <div className='var-box'>
          <button style={{ backgroundColor: box[i].state === 'var' ? 'var(--primary)' : "white", color: box[i].state === 'var'  ? 'white' : "black"}} onClick={() => updateState('var', i, x)}>Var</button>
          <button style={{ backgroundColor: box[i].state === 'val' ? 'var(--primary)' : "white", color: box[i].state === 'val'  ? 'white' : "black"}} onClick={() => updateState('val', i, x)}>Val</button>
          <div className="box">
            {box[i].state === 'var'  ? (
              <select onChange={(e) => { condition[n] = e.target.value}}>
                {(props.gameVars).map((data) => {
                    return (
                      <option value={Object.keys(data)}>
                        {Object.keys(data)}
                      </option>
                    );
                })}
              </select>
            ) : (
              <input
                onChange={(e) => { condition[n] = '"' + e.target.value + '"'}}
                type="text"
                placeholder="value"
              />
            )}

          </div>
      </div>
    )
    return list
  }

  const handleIfStatements = () => {
    let list = []
    console.log(ifs)
    for(let i = 0; i < ifs; i++){
      list.push(
        <>
          <div className="input-area">
            <h2>IF</h2>
              <div>
                <div className="box">
                  <select onChange={(e) => { condition[0] = e.target.value}}>
                    {(props.gameVars).map((data) => {
                        return (
                          <option value={Object.keys(data)} id={i}>
                            {Object.keys(data)}
                          </option>
                        );
                    })}
                  </select>
                </div>
              </div>
            <div className="box select">
              <select onChange={(e) => { condition[1] = e.target.value}}>
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value={lt}> {lt} </option>
                <option value={gt}> {gt} </option>
              </select>
            </div>
            <div>
              {getSpecialBox(1, 2, i)}
            </div>
            <div className="fixer" >
              {showAddition && (
                <div className="fixer" >
                  <div className="box select">
                    <select onChange={(e) => { condition[3] = e.target.value}}>
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="x"> x </option>
                      <option value="/"> / </option>
                    </select>
                  </div>
                  <div>
                    {getSpecialBox(2, 4, i)}
                  </div>
                </div>
              )}
              <button  className="nob" onClick={() => handle1()}>
                {!showAddition ? (
                  <Plus className="icon plus special"/>
                ) : (
                  <Line className="icon plus specialer"/>
                )}

              </button>
            </div>
          </div>
        </>
        )
      }
    return list
  }

  const handle1 = () => {
    setShowAddition(!showAddition)
  }

  const handle2 = () => {
    setShowAddition2(!showAddition2)
  }
  const handleIfs = (e) => {
    setIfs(parseInt(e.target.value))
  }

  return (
    <>
      {!showConAdd && (
        <>
        {handleOut()}
        </>
      )}
      <div className="variable-add tester" onClick={() => setShowConAdd(true)} hidden={showConAdd}>
        <Plus className="icon plus"/>
        ADD NEW CONDITION
      </div>

      {showConAdd && (
        <div className="variable-con-adding">
          <div className="con-ifs">
            <h1>Set Number of If Statements</h1>
            <input
                onChange={(e) => handleIfs(e)}
                type="number"
                placeholder="value"
                max='4'
              />
          </div>
          {handleIfStatements()}
          <div className="input-area">
            <h2 className="smaller-text">THEN</h2>
              <div className="box">
                <select onChange={(e) => { condition[5] = e.target.value}}>
                  {(props.gameVars).map((data) => {
                      return (
                        <option value={Object.keys(data)}>
                          {Object.keys(data)}
                        </option>
                      );
                  })}
                </select>
              </div>
              <div className="box select jequal">
                <h1>=</h1>
              </div>
              <div>
                {getSpecialBox(4, 7)}
              </div>
              <div className="fixer" >
                {showAddition2 && (
                  <div className="fixer" >
                  <div className="box select">
                    <select onChange={(e) => { condition[8] = e.target.value}}>
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="x"> x </option>
                      <option value="/"> / </option>
                    </select>
                  </div>

                  <div>
                    {getSpecialBox(5,9)}
                  </div>
                </div>
              )}
                <button  className="nob" onClick={() => handle2()}>
                  {!showAddition2 ? (
                    <Plus className="icon plus special"/>
                  ) : (
                    <Line className="icon plus specialer"/>
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
    </>
  );
}

export default Condition;
