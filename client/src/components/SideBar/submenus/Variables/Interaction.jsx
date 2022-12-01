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

const Interaction = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  const [check, setCheck] = useState();
  const [isCheck, setIsCheck] = useState(false);
  const [isVCheck, setIsVCheck] = useState(false);
  const [updater, setUpdater] = useState(0);
  const start = useState(Object.keys(props.gameVars[0] ? props.gameVars[0] : ''))
  const [interaction, setInteraction] = useState([props.shapes[0].varName, start, '=', start, '', ''])
  const [listI, setList] = useState([])
  const [input, setInput] = useState(props.shapes[0])
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
  ]);
  if(!localStorage.interactions){
    var a = [];
    localStorage.setItem('interactions', JSON.stringify(a));
  }
  useEffect(() => {
    if(showAddition && interaction[3] === ''){
      interaction[3] = '+'
      interaction[4] = start
    }
  })
  const populateGlobal = () => {
    let ints = props.ints
    let shapes = props.shapes
    let list = []
    for(let i  = 0; i < ints.length; i++){
      list.push(<div className="condition-inputs">
        <i onClick={() => deleteCon(i) }><Trash className="icon var-trash"/></i>
        <div className="ints-container">
          <div className={"if"}>
            <h1>When</h1><h2>{ints[i][0]}</h2><h1>Is Clicked</h1>
          </div>
          <div className={"then"}>
            <h1>Set</h1><h2>{ints[i][1]}</h2><h3>{ints[i][2]}</h3><h2>{ints[i][3]}</h2>
            <h3>{ints[i][4]}</h3><h2>{ints[i][5]}</h2>
          </div>
        </div>
      </div>)
    }
    return list
  }
  const populateSession = () => {
    let ints = props.ints ? props.ints : 0
    let list = []
    for(let i  = 0; i < ints.length; i++){
      list.push(<div className="condition-inputs">
        <i onClick={() => deleteCon(i) }><Trash className="icon var-trash"/></i>
        <div className={""}>

        </div>
      </div>)
    }
    return list
  }

  const handleConditionSelect = (e) => {
    setShowCons(!showCons)
    setCurrentCon(e)
  }
  const addCon = () => {
    let a = [];
    a = JSON.parse(localStorage.getItem('interactions')) || [];
    a.push(interaction);
    localStorage.setItem('interactions', JSON.stringify(a));
    props.setInts(a)
    setShowConAdd(!showConAdd)
  }
  const deleteCon = (i) => {
    let a = [];
    a = JSON.parse(localStorage.getItem('interactions')) || [];
    a.splice(i, 1);
    console.log(a)
    localStorage.setItem('interactions', JSON.stringify(a));
    props.setInts(a)
  }
  const handle1 = () => {
    setShowAddition(!showAddition)
  }
  const handleCheck = (e) => {
    setCheck(e)
    if(e === "incr")
      setIsCheck(!isCheck)
    if(e === "var")
      setIsVCheck(!isVCheck)
  }
  const handleOut = () => {
    if(props.current === 'global')
      return(populateGlobal())
    if(props.current === 'session')
      return(populateSession())
  }
  const updateState = (n, i) => {
    const newState = box.map(obj => {
      if (obj.id === i) {
        return {...obj, state: n};
      }
      return obj;
    });
    setBox(newState);
  };
  const getSpecialBox = (i, n) => {
    let list = []
    list.push(
      <div className='var-box'>
          <button style={{ backgroundColor: box[i].state === 'var' ? 'var(--primary)' : "white", color: box[i].state === 'var'  ? 'white' : "black"}} onClick={() => updateState('var', i)}>Var</button>
          <button style={{ backgroundColor: box[i].state === 'val' ? 'var(--primary)' : "white", color: box[i].state === 'val'  ? 'white' : "black"}} onClick={() => updateState('val', i)}>Val</button>
          <div className="box">
            {box[i].state === 'var'  ? (
              <select onChange={(e) => handleInteraction(n, e)}>
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
                onChange={(e) => handleInteraction(n, e)}
                type="text"
                placeholder="value"
              />
            )}

          </div>
      </div>
    )
    return list
  }

  const handleInteraction = (n, e) => {
    let out = e.target.value
    let input = interaction
    input[n] = out
    setInteraction(input)

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
        <div className="variable-adding ints-fix">
          <div className="ints-area">
            <div className="ints-name">
              <h1>Input to Set</h1>
              <select onChange={(e) => handleInteraction(0, e)}>
                {(props.shapes).map((data) => {
                    return (
                      <option value={data.varName}>
                        {data.varName}
                      </option>
                    );
                })}
              </select>
            </div>
              <div className='ints-checks'>
                <input type="checkbox" name="checkbox" value="incr" onChange={(e) => handleCheck(e.target.value)} disabled={isVCheck} checked={isCheck}/>
                <h1>Incremental</h1>
                <input type="checkbox" name="checkbox" value="var" onChange={(e) => handleCheck(e.target.value)} disabled={isCheck} checked={isVCheck}/>
                <h1>Variable</h1>
              </div>
              <div className={'ints-con ' + isVCheck}>
                <h2 className="smaller-text">SET</h2>
                <div className="box">
                  <select onChange={(e) => handleInteraction(1, e)}>
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
                  {getSpecialBox(1, 3)}
                </div>
                <div className="fixer">
                  {showAddition && (
                    <div className="fixer" >
                    <div className="box select">
                      <select onChange={(e) => handleInteraction(4, e)}>
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="x"> x </option>
                        <option value="/"> / </option>
                      </select>
                    </div>
                    <div>
                      {getSpecialBox(2, 5)}
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

export default Interaction;
