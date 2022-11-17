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
console.log(props)
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [updater, setUpdater] = useState(0);
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

  const populateGlobal = () => {
    let ints = props.ints ? props.ints : 0
    let shapes = props.shapes
    let list = []
    for(let i  = 0; i < ints.length; i++){
      list.push(<div className="interaction-inputs">
        <i onClick={() => deleteCon(i) }><Trash className="icon var-trash"/></i>
        <div className={"ints-container"}>

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
      return(populateGlobal())
    if(props.current === 'session')
      return(populateSession())
  }
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
        <div className="variable-adding">
          <div className="ints-area">
            <div className="ints-name">
              <h1>Input to Set</h1>
              <select onChange={''}>
                {(props.shapes).map((data) => {
                    return (
                      <option value={Object.keys(data)}>
                        {data.varName}
                      </option>
                    );
                })}
              </select>
            </div>
              <div className='ints-checks'>
                <input type="checkbox" name="checkbox" />
                <h1>Incremental</h1>
                <input type="checkbox" name="checkbox" />
                <h1></h1>
                <input type="checkbox" name="checkbox" />
                <h1>Checkbox</h1>
              </div>
              <div className='ints-con'>
                <h2 className="smaller-text">SET</h2>
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
