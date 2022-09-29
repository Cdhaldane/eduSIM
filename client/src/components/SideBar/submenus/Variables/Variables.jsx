import React, { useCallback, useContext, useState, useEffect } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { SettingsContext } from "../../../../App";
import { useTranslation } from "react-i18next";
import Draggable from 'react-draggable'




import "../../Sidebar.css";

import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import User from "../../../../../public/icons/user.svg"
import Users from "../../../../../public/icons/users-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"


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
  console.log(props.gameVars)
  const { t } = useTranslation();
  const { updateSetting, settings } = useContext(SettingsContext);
  const [personal, setPersonal] = useState([])
  const [game, setGame] = useState([])
  const [vars, setVars] = useState(props ? props.vars : [])
  const [data, setData] = useState()
  const [varName, setVarName] = useState()
  const [varValue, setVarValue] = useState()
  const [varType, setVarType] = useState("integer")
  const [sessionText, setSessionText] = useState([])
  const [gameText, setGameText] = useState([])
  const [isShown, setIsShown] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showConAdd, setShowConAdd] = useState(false);
  const [showDis, setShowDis] = useState(false);
  const [showCons, setShowCons] = useState(false);
  const [current, setCurrent] = useState();
  const [currentCon, setCurrentCon] = useState();
  const [updater, setUpdater] = useState(0);
  const [tabs, setTabs] = useState("global");
  const [employeeData, setEmployeeData] = React.useState(tester)
  const [conditions, setConditions] = useState([])
  const [boxes] = useState([
    { name: 'Bottle', type: ''},
    { name: 'Banana', type: ''},
    { name: 'Magazine', type: ''},
  ])
  const condition = ["if", "var", "=", "2", "var", "3"]
  const duplicate = [1,2,3,4,5,6]
  const lt = "<"

  const tester = [
  {
    id: 0,
    name: 'Cost',
    tval: '10',
    ttype: 'Integer',
  },
  {
    id: 1,
    name: 'Place',
    tval: 'Montreal',
    ttype: 'String',
  },
  {
    id: 2,
    name: 'Deck',
    tval: '[A,2,3,4,5,6,7,8,9,10,J,Q,K,A]',
    ttype: 'Array',
  },
]



  useEffect(() => {
    if(props.expanded === false){
      setShowDis(false)
    }
  },[props.expanded])

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
    if (props.editpage) {
      for (let i = 0; i < (vars ? vars.length : 0); i++) {
        if (!vars[i].sync) {
          gameVar.push(vars[i].varName)
        }
      }
      for (let i = 0; i < (gameVar.length); i++) {
        if (gameVar[i] !== "") {
          list.push(<div className="variable-inputs gameVar" key={i}><h1
            onClick={() => {
              setIsShown(true)
              setCurrent(i)
            }}
            onMouseLeave={() => setIsShown(false)}>{gameVar[i] !== "" ? gameVar[i] : "Undefined"} = Empty</h1></div>)
          {
            (isShown && current === i) && (
              <div className="variable-hover" key={i}>
                {populateNames()}
              </div>
            )
          }
        }
      }
    } else {
      for (let i = 0; i < (vars ? varName.length : 0); i++) {
        if (varValue[i] === true) {
          varValue[i] = "True"
        } else if (varValue[i] === false) {
          varValue[i] = "False"
        }
        if (gameVar[i] !== "") {
          list.push(<div className="variable-inputs gameVar" key={i}><h1
            onClick={() => {
              setIsShown(true)
              setCurrent(i)
            }}
            onMouseLeave={() => setIsShown(false)}>{varName[i] !== "" ? varName[i] : "Undefined"} = {varValue[i]}</h1></div>)
          {
            (isShown && current === i) && (
              <div className="variable-hover" key={i}>
                {populateNames()}
              </div>
            )
          }
        }
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
   let list = props.editpage ? [<div className="variable-inputs green" key={-1}><h3>Page</h3> <h3>=</h3> <h3>{sessionVars["Page"]}</h3></div>] : [<div className="variable-inputs green" key={-1}><h3>Page ‎‏‏‎‎= ‎‏‏‎ ‎‏‏‎ ‎‏{sessionVars["Page"]}</h3></div>]
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
           !props.editpage ? <div className="variable-inputs gameVar" key={i}><h1>{check[i]}‏‏‏‎ ‎‏‏‎‎= ‎‏‏‎ ‎‏‏‎ ‎‏{props.gameVars[vars[i].varName]}</h1></div> :
           <div className="variable-inputs" key={i}>
             <i  onClick={() => deleteVar(i)}><Trash className="icon white-icon"/></i>
           <div className="variable-main" key={i}>
             <h1
               onClick={() => {
                 setIsShown(true)
                 setCurrent(i)
               }}
               onMouseLeave={() => setIsShown(false)}>{check[i]}</h1>
             <input type="text" placeholder={data[i] ? Object.values(data[i]) : "Some Value"} onChange={e => handleGame(e.target.value, variable, i)}/>
             <h2>=</h2>

           {(isShown && current === i) && (
             <div className="variable-hover" key={i}>
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
    for (let i = 0; i < (vars ? vars.length : 0); i++) {
      if (vars[i].sync) {
        names.push([vars[i].varName])
        if (vars[i].varName == a) {
          actual.push([vars[i].label])
        }
      }
    }
    for (let i = 0; i < actual.length; i++) {
      out.push(<div key={i}>{actual[i]}</div>)
    }
    return out
  }
  const uniq = (a) => {
    var prims = { "boolean": {}, "number": {}, "string": {} }, objs = [];
    return a.filter(function (item) {
      var type = typeof item;
      if (type in prims)
        return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
      else
        return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
  }

  const createSelectItems = () => {
    let items = [(<option key={-1} value="">Select a previous sim</option>)];
    for (let i = 0; i <= props.gamedata.length - 1; i++) {
      // Here I will be creating my options dynamically based on
      items.push(<option value={i} key={i}>{props.gamedata[i].gameinstance_name}</option>);
      // What props are currently passed to the parent component
    }
    return items;
  }

  const handleGame = (e, varName, i) => {
    setGameText(e)
    let vars = props ? props.gameVars : 0;
    let key = Object.keys(vars[i])
    vars[i][key] = e;
    props.editVars(vars);
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
      console.log(arrayVal)
      value = (arrayVal)
    }
    if(varType === "arrayInt"){
      arrayVal = varValue.replace(/\s/g, '')
      arrayVal = arrayVal.split(',')
      for(let i = 0; i < arrayVal.length; i++){
        arrayVal[i] = parseInt(arrayVal[i])
      }
      console.log(arrayVal)
      value = (arrayVal)
    }
    setShowAdd(false)
    let data = { [varName]: value }
    props.setVars(data);
  }

  const deleteVar = (i) => {
    let vars = props ? props.gameVars : 0;
    vars.splice(i, 1);
    props.delVars(vars)
    setUpdater(updater + 1)
  }

  const handleVarType = (e) => {
    setVarType(e)
  }

  const handleConditionSelect = (e) => {
    console.log(e)
    setShowCons(!showCons)
    setCurrentCon(e)
  }

  const handleConAdd = () => {
    console.log(condition)
    setConditions(prevState => [...prevState, condition] )
    console.log(conditions)
  }

  const populateTab = () => {
    let vars = props ? props.vars : 0;
    const list = []
    if(tabs === "global")
      return (
        <div>
          <div className="variable-add tester" onClick={() => setShowAdd(true)} hidden={showAdd}>
            <Plus className="icon plus"/>
            {t("sidebar.addNewVar")}
          </div>

        </div>
      )
    if(tabs === "session")
      return (
        <div>
          <div className="variable-add tester" onClick={() => setShowAdd(true)} hidden={showAdd}>
            <Plus className="icon plus"/>
            {t("sidebar.addNewVar")}
          </div>
        </div>
      )
    if(tabs === "conditions")
      return (
        <div>



          <div className="variable-add tester" onClick={() => setShowConAdd(true)} hidden={showConAdd}>
            <Plus className="icon plus"/>
            ADD NEW CONDITION
          </div>
        </div>
    )
  }

  const onStart = () => {

  };

  const onStop = () => {

  };

  const dragHandlers = {onStart: onStart, onStop: onStop};

  return (
    <div className="variable-container">
      <h2>{t("sidebar.variables")}</h2>
      {props.editpage ? (<div></div>) : ( <>
      <SettingRow>
        <i className="settings-icons"><User className="icon setting-icon"/></i>
        <b>{t("sidebar.session")}</b>
      </SettingRow>
      <div className="variable-box">
        {populateSessionVars()}
      </div>
      </>
    )}
      <SettingRow>
        <i onClick={() => setShowDis(!showDis)} className="settings-icons"><Users className="icon setting-icon"/></i>
        <b>{t("sidebar.game")}</b>
      </SettingRow>

      <div className="variable-box" key={updater}>
        {populateGameVars()}
      </div>
      <SettingRow>
      {props.editpage && (
      <div className="variable-add" onClick={() => setShowAdd(true)} hidden={showAdd}>
        <Plus className="icon plus"/>
      {t("sidebar.addNewVar")}
      </div>
    )}

    </SettingRow>
    {showDis && (
      <Draggable handle="h1" {...dragHandlers}>
        <div className="variable-dis">

          {showCons ? (
            <>
            <h1 className="variable-title">Condition Wizard</h1>
            <div className="variable-cons">
              <button className="con-back" onClick={() => setShowCons(!showCons)}><i class="fa fa-solid fa-backward"></i></button>
                <table>
                  <thead>
                    <tr>
                      <th>If</th>
                      <th>Variable</th>
                      <th>Equals</th>
                      <th>Variable</th>
                      <th>Set Variable</th>
                      <th>To</th>
                      <th></th>
                    </tr>
                    <tr>
                      <td>
                        <select onChange={(e) => { condition[0] = e.target.value}}>
                          <option value="if">If</option>
                        <option value="while">While</option>
                        </select>
                      </td>
                      <td>
                        <select onChange={(e) => { condition[1] = e.target.value}}>
                          <option value="c">{tester[0].name}</option>
                          <option value="c">{tester[1].name}</option>
                          <option value="c">{tester[2].name}</option>
                        </select>
                      </td>
                      <td>
                        <select onChange={(e) => { condition[2] = e.target.value}}>
                          <option value="e">=</option>
                          <option value="ne">!=</option>
                          <option value="lt"> {lt} </option>
                          <option value="gt"> > </option>
                        </select>
                      </td>
                      <td>
                        <input
                          onChange={(e) => { condition[3] = e.target.value}}
                          type="text"
                          placeholder="value"
                        />
                      </td>
                      <td>
                        <select onChange={(e) => { condition[4] = e.target.value}}>
                          <option value="integer">{tester[0].name}</option>
                          <option value="string">{tester[1].name}</option>
                          <option value="arrayString">{tester[2].name}</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="value"
                          onChange={(e) => { condition[5] = e.target.value}}
                        />
                      </td>
                      <td>
                        <button className="con-button" onClick={() => handleConAdd()}>Add</button>
                      </td>
                    </tr>
                  </thead>
                </table>

            </div>
            </>
        ) : (<div className="variable-wiz">
          <h1 className="variable-title">Variable Wizard</h1>
          <button className="con" onClick={() => handleConditionSelect(tester)}><i class="fa fa-solid fa-code"></i></button>
          <div className="con-container">
            <button className="con-tabs" onClick={() => setTabs("global")}>Global</button>
            <button className="con-tabs" onClick={() => setTabs("session")}>Session</button>
            <button className="con-tabs" onClick={() => setTabs("conditions")}>Conditions</button>
          </div>
          {populateTab()}
        </div>)}
        {showAdd && (
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
            <button onClick={() => setShowAdd(false)}>{t("common.cancel")}</button>
            <button onClick={() => addVar()}>{t("common.add")}</button>
        </div>
          </div>
        )}
        {showConAdd && (
          <div>
          <div className="variable-con-adding">

          <div className="input-area">
            <h2>IF</h2>
            <div className="box"></div>
            <div className="box"></div>
            <div className="box"></div>

          </div>

          <div className="input-area">
            <h2 className="smaller-text">SET</h2>
            <div className="box"></div>
            <div className="box"></div>
            <div className="box"></div>
          </div>

          {duplicate.map((i) => (
            <Draggable>
              <div className="e">
              <select onChange={(e) => { condition[2] = e.target.value}}>
                <option value="e">=</option>
                <option value="ne">!=</option>
                <option value="lt"> {lt} </option>
                <option value="gt"> > </option>
              </select>
              </div>
            </Draggable>
            ))}
            {duplicate.map((i) => (
            <Draggable>
              <div className="i">
              <select onChange={(e) => { condition[1] = e.target.value}}>
                <option value="c">{tester[0].name}</option>
                <option value="c">{tester[1].name}</option>
                <option value="c">{tester[2].name}</option>
              </select>
              </div>
            </Draggable>
            ))}
            {duplicate.map((i) => (
            <Draggable>
              <div className="v">
              <input
                onChange={(e) => { condition[3] = e.target.value}}
                type="text"
                placeholder="value"
              />
              </div>
            </Draggable>
            ))}
          </div>
            <button className="con-can-b" onClick={() => setShowConAdd(false)}>{t("common.cancel")}</button>
            <button className="con-add-b" onClick={() => addVar()}>{t("common.add")}</button>
          </div>
        )}
        </div>
      </Draggable>
    )}
    </div>
  );
}

export default Variables;

// <div className="variable-dis-buttons">
//   <button>Variables</button>
//   <button>Conditions</button>
// </div>
