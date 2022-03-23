import React, { useContext, useState } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { SettingsContext } from "../../../App";
import { useTranslation } from "react-i18next";

import "../Sidebar.css";

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
  const { t } = useTranslation();
  const { updateSetting, settings } = useContext(SettingsContext);
  const [personal, setPersonal] = useState([])
  const [game, setGame] = useState([])
  const [vars, setVars] = useState(props ? props.vars : [])
  const [data, setData] = useState()
  const [varName, setVarName] = useState()
  const [varValue, setVarValue] = useState()
  const [sessionText, setSessionText] = useState([])
  const [gameText, setGameText] = useState([])
  const [isShown, setIsShown] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [current, setCurrent] = useState();
  const [updater, setUpdater] = useState(0);

  const populateSessionVars = () => {
    let sessionVars = sessionStorage.gameVars ? JSON.parse(sessionStorage.gameVars) : [];
    let vars = props ? props.vars : 0;
    let varName = Object.keys(sessionVars);
    let varValue = Object.values(sessionVars);
    varName.shift();
    varValue.shift();
    let list = [];
    let out = "Empty";
    let gameVar = [];
    if(props.editpage){
      for(let i = 0; i < (vars ? vars.length : 0); i++){
        if(!vars[i].sync){
          gameVar.push(vars[i].varName)
        }
      }
        for(let i = 0; i < (gameVar.length); i++){
          list.push(<div className="variable-inputs gameVar"><h1
          onClick={() => {
              setIsShown(true)
              setCurrent(i)
            }}
          onMouseLeave={() => setIsShown(false)}>{gameVar[i] !== "" ? gameVar[i] : "Undefined" } = Empty</h1></div>)
          {(isShown && current === i) && (
            <div className="variable-hover">
              {populateNames()}
            </div>
          )}
      }
    } else {
    for(let i = 0; i < (vars ? varName.length : 0); i++){
      if(varValue[i] === true){
        varValue[i] = "True"
      } else if (varValue[i] === false){
        varValue[i] = "False"
      }
      if(varValue[i])
        list.push(<div className="variable-inputs gameVar"><h1
        onClick={() => {
            setIsShown(true)
            setCurrent(i)
          }}
        onMouseLeave={() => setIsShown(false)}>{varName[i] !== "" ? varName[i] : "Undefined"} = {varValue[i]}</h1></div>)
        {(isShown && current === i) && (
          <div className="variable-hover">
            {populateNames()}
          </div>
        )}
    }
  }

    return list
  }

  const handleSession = (e, varName) => {
    setSessionText(e)
    let vars = {};
    if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
    sessionStorage.setItem('gameVars', JSON.stringify({
      ...vars,
      [varName]: e
    }));
    sessionStorage.setItem('lastSetVar', varName);
  }

  const populateGameVars = () => {
    let vars = props ? props.vars : 0;
    let data = props.gameVars
    let sessionVars = sessionStorage.gameVars ? JSON.parse(sessionStorage.gameVars) : [];
    let list = props.editpage ? [<div className="variable-inputs green"><h3>Page</h3> <h3>=</h3> <h3>{sessionVars["Page"]}</h3></div>] : [<div className="variable-inputs green"><h3>Page ‎‏‏‎‎= ‎‏‏‎ ‎‏‏‎ ‎‏{sessionVars["Page"]}</h3></div>]
    let variable;
    let length;
    let items = [];
    let inputs = [];
    let check;
    for(let i = 0; i < (vars ? vars.length : 0); i++){
      if(vars[i].sync){
        variable = vars[i].varName
        items.push(variable)
      }
    }
    for(let i = 0; i < data.length; i++){
      let keyArr = Object.keys(data[i]);
      items.push(keyArr)
    }
    check = uniq(items)
      for(let i = 0; i < (check ? check.length : 0); i++){
        if(check){
          list.push(
            !props.editpage ? <div className="variable-inputs gameVar"><h1>{check[i]}‏‏‏‎ ‎‏‏‎‎= ‎‏‏‎ ‎‏‏‎ ‎‏{props.gameVars[vars[i].varName]}</h1></div> :
            <div className="variable-inputs">
              <i className="lni lni-trash-can" onClick={() => deleteVar(i)}/>
            <div className="variable-main">
              <h1
                onClick={() => {
                  setIsShown(true)
                  setCurrent(i)
                }}
                onMouseLeave={() => setIsShown(false)}>{check[i]}</h1>
              <input type="text" placeholder={data[i] ? Object.values(data[i]) : "Some Value"} onChange={e => handleGame(e.target.value, variable, i)}/>
              <h2>=</h2>

            {(isShown && current === i) && (
              <div className="variable-hover">
                {populateNames(check[i])}
              </div>
            )}
            </div>
          </div>
          )
        }
      }
    return list
  }
  const populateNames = (a) => {
    let vars = props ? props.vars : 0;
    let names = [];
    let counts = {};
    let actual = [];
    let out = [];
    for(let i = 0; i < (vars ? vars.length : 0); i++){
      if(vars[i].sync){
        names.push([vars[i].varName])
        if(vars[i].varName == a){
          actual.push([vars[i].label])
        }
      }
    }
    for(let i = 0; i < actual.length; i ++){
      out.push(<div>{actual[i]}</div>)
    }
    return out
  }
  const uniq = (a) => {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];
    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}

  const createSelectItems = () => {
    let items = [(<option value="">Select a previous sim</option>)];
    for (let i = 0; i <= props.gamedata.length - 1; i++) {
      // Here I will be creating my options dynamically based on
      items.push(<option value={i}>{props.gamedata[i].gameinstance_name}</option>);
      // What props are currently passed to the parent component
    }
    return items;
  }

  const handleGame = (e, varName, i) => {
    setGameText(e)
    let vars = props ? props.gameVars : 0;
    let key = Object.keys(vars[i])
    vars[i][key] = e ;
    props.editVars(vars);
  }

  const addVar = () => {
    setShowAdd(false)
    let data = {[varName]: varValue}
    props.setVars(data);
  }

  const deleteVar = (i) => {
    let vars = props ? props.gameVars : 0;
    vars.splice(i, 1);
    props.delVars(vars)
    setUpdater(updater + 1)
  }



  return (
    <div className="variable-container">
      <h2>{t("sidebar.variables")}</h2>
      <SettingRow>
        <i className="settings-icons lni lni-user"></i>
        <b>{t("sidebar.session")}</b>
      </SettingRow>
      <div className="variable-box">
        {populateSessionVars()}
      </div>
      <SettingRow>
        <i className="settings-icons lni lni-users"></i>
        <b>{t("sidebar.game")}</b>
      </SettingRow>
      <div className="variable-box" key={updater}>
      {populateGameVars()}
      </div>
      <SettingRow>
      {props.editpage && (
      <div className="variable-add" onClick={() => setShowAdd(true)} hidden={showAdd}>
        <i className="fas fa-plus-circle"  />
      {t("sidebar.addNewVar")}
      </div>
    )}
      {showAdd && (
        <div className="variable-adding">
          <div className="variable-hold">
            <h1>Variable Name</h1>
            <h1>Variable Value</h1>
        </div>
          <div className="variable-hold">
            <input type="text" value={varName} placeholder={"Some Name"} onChange={(e) => setVarName(e.target.value)}/>
            <h2> = </h2>
          <input type="text" value={varValue} placeholder={"Some Value"} onChange={(e) => setVarValue(e.target.value)}/>
      </div>
          <div className="variable-hold">
          <button onClick={() => setShowAdd(false)}>{t("common.cancel")}</button>
          <button onClick={() => addVar()}>{t("common.add")}</button>
      </div>
        </div>
      )}
    </SettingRow>
    </div>
  );
}

export default Variables;
