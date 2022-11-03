import React, { useCallback, useContext, useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { useAlertContext } from "../../../Alerts/AlertContext";
import { SettingsContext } from "../../../../App";
import { useTranslation } from "react-i18next";
import Draggable from 'react-draggable'
import ReactTooltip from "react-tooltip";

import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import User from "../../../../../public/icons/user.svg"
import Users from "../../../../../public/icons/users-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import Close from "../../../../../public/icons/close.svg"
import Info from "../../../../../public/icons/info.svg"

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0 10px;
  overflow-y: hidden !important;
  & > i {
    margin-left: 10px;
    margin-right: 10px;
    color: var(--primary);
    min-width: 45px;
  }
  & > div b {
    font-size: 1.1em;
  }
  & > div p {
    font-size: .75em;

  }
  & > input[type="checkbox"] {
    min-width: 26px;
    min-height: 26px;
    margin-left: 10px;
  }
`;

const Variables = (props) => {
  console.log(props)
  const { t } = useTranslation();
  const { updateSetting, settings } = useContext(SettingsContext);
  const alertContext = useAlertContext();
  const [personal, setPersonal] = useState([])
  const [game, setGame] = useState([])
  const [vars, setVars] = useState(props ? props.vars : {})
  const [data, setData] = useState()
  const [varName, setVarName] = useState('')
  const [varValue, setVarValue] = useState('')
  const [varType, setVarType] = useState("integer")
  const [sessionText, setSessionText] = useState([])
  const [gameText, setGameText] = useState([])
  const [isShown, setIsShown] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showConAdd, setShowConAdd] = useState(false);
  const [showDis, setShowDis] = useState(true);
  const [showCons, setShowCons] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  const [showAddition2, setShowAddition2] = useState(false);
  const [current, setCurrent] = useState();
  const [currentCon, setCurrentCon] = useState();
  const [updater, setUpdater] = useState(0);
  const [tabs, setTabs] = useState("global");
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

  const lt = "<"
  const [condition] = useState([Object.keys(props.gameVars[0]), '=', Object.keys(props.gameVars[0]), '', '', Object.keys(props.gameVars[0]), '=', Object.keys(props.gameVars[0]), '', ''])

  useEffect(() => {
    if(showAddition && condition[3] === ''){
      condition[3] = '+'
      condition[4] = Object.keys(props.gameVars[0])
    }
    if(showAddition2 && condition[8] === ''){
      condition[8] = '+'
      condition[9] = Object.keys(props.gameVars[0])
    }
  })

  const populateSessionVars = () => {
    let data = JSON.parse(sessionStorage.gameVars)
    let list = []
      for(let i = 0; i < Object.keys(data).length; i++){
        list.push(<div className="condition-inputs vars">
          <i onClick={() => deleteVar(i) }><Trash className="icon var-trash"/></i>
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

  const populateGameVars = () => {
   let data = props.gameVars
   let list = []
     for(let i = 0; i < data.length; i++){
       list.push(<div className="condition-inputs vars">
         <i onClick={() => deleteVar(i) }><Trash className="icon var-trash"/></i>
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
  const populateConditions = () => {
    let cons = props ? props.cons : 0;
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
  const addVar = () => {
    let value;
    let arrayVal;
    if(varType === "string")
      value = String(varValue)
    if(varType === "integer")
      value = parseInt(varValue)
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
    if(varValue.includes('Random')){
      let n = varValue.replace(/[^0-9]/g, '')
      if(n === 0){
        value = Math.floor(Math.random())
      }
      value = Math.floor(Math.random() * n)
    }
    setShowAdd(false)
    if(tabs=='session'){
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
  const deleteVar = (i) => {
    let vars = props ? props.gameVars : 0;
    vars.splice(i, 1);
    props.delVars(vars)
    setUpdater(updater + 1)
  }
  const deleteCon = (i) => {
    let cons = props ? props.cons : 0;
    cons.splice(i, 1);
    props.delCons(cons)
    setUpdater(updater + 1)
  }
  const handleVarType = (e) => {
    setVarType(e)
  }
  const handleConditionSelect = (e) => {
    setShowCons(!showCons)
    setCurrentCon(e)
  }
  const addCon = () => {
    setShowConAdd(!showConAdd)
    props.setCons(condition);
  }

  const populateTab = () => {
    let vars = props ? props.vars : 0;
    const list = []
    if(tabs === "global")
      return (
        <div>
          {!showAdd && (
            <div className="condition-input-container">
              {populateGameVars()}
            </div>
          )}
          <div className="variable-add tester" onClick={() => setShowAdd(true)} hidden={showAdd}>
            <Plus className="icon plus"/>
            {t("sidebar.addNewVar")}
          </div>
        </div>
      )
    if(tabs === "session")
      return (
        <div>
          {!showAdd && (
            <div className="condition-input-container">
              {populateSessionVars()}
            </div>
          )}
          <div className="variable-add tester" onClick={() => setShowAdd(true)} hidden={showAdd}>
            <Plus className="icon plus"/>
            {t("sidebar.addNewVar")}
          </div>
        </div>
      )
    if(tabs === "conditions")
      return (
        <div>
          {!showConAdd && (
            <div className="condition-input-container">
              {populateConditions()}
            </div>
          )}
          <div className="variable-add tester" onClick={() => setShowConAdd(true)} hidden={showConAdd}>
            <Plus className="icon plus"/>
            ADD NEW CONDITION
          </div>
        </div>
    )
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

  const handle1 = () => {
    setShowAddition(!showAddition)
  }

  const handle2 = () => {
    setShowAddition2(!showAddition2)
  }

  return (
    <div className="variable-container">
      <Draggable  handle="strong">
        <div className="variable-dis">
          <div className="variable-wiz">
          <button className="tooltips" data-tip data-for="infoTip"><Info className="icon info-var"/></button>
            <ReactTooltip id="infoTip" place="right" effect="solid">
                Random = Random(max)
            </ReactTooltip>
          <strong><h1 className="variable-title">Variable Wizard</h1></strong>
          <button className="con" onClick={() => props.close()}><Close className="icon close-var"/></button>
          <div className="con-container">
            <button className="con-tabs" style={{ backgroundColor: tabs === 'global' ? 'var(--primary)' : "#eeeeee", color: tabs === 'global' ? 'white' : "black"}} onClick={() => setTabs("global")}>Global</button>
            <button className="con-tabs" style={{ backgroundColor: tabs === 'session' ? 'var(--primary)' : "#eeeeee", color: tabs === 'session' ? 'white' : "black"}} onClick={() => setTabs("session")}>Session</button>
            <button className="con-tabs" style={{ backgroundColor: tabs === 'conditions' ? 'var(--primary)' : "#eeeeee", color: tabs === 'conditions' ? 'white' : "black"}} onClick={() => setTabs("conditions")}>Conditions</button>
          </div>
          {populateTab()}
        </div>
        {showAdd && (tabs === 'global' || tabs === 'session') && (
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
        {showConAdd && tabs==="conditions" && (
          <div className="variable-con-adding">
            <div className="input-area">
              <h2>IF</h2>
                <div>
                  <div className="box">
                    <select onChange={(e) => { condition[0] = e.target.value}}>
                      {(props.gameVars).map((data) => {
                          return (
                            <option value={Object.keys(data)}>
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
                <option value=">"> > </option>
              </select>
            </div>
            <div>
              {getSpecialBox(1, 2)}
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
                  {getSpecialBox(2, 4)}
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
          <div className="input-area">
            <h2 className="smaller-text">THEN</h2>
              <div className="box">
                <select onChange={(e) => { condition[0] = e.target.value}}>
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
        </div>
      </Draggable>
    </div>
  );
}

export default Variables;

// <div className="variable-dis-buttons">
//   <button>Variables</button>
//   <button>Conditions</button>
// </div>
