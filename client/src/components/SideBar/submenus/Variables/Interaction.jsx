import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";


import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import MultiLevel from "../../../Dropdown/Multilevel";
import { set } from "immutable";


const Interaction = (props) => {
  console.log(props)
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  const [check, setCheck] = useState('');
  const [isCheck, setIsCheck] = useState(false);
  const [isVCheck, setIsVCheck] = useState(false);
  const [isPCheck, setIsPCheck] = useState(false);
  const [shapes, setShapes] = useState()
  const start = props.gameVars[0] ? (Object.keys(props.gameVars[0])).toString() : ''
  const [interaction, setInteraction] = useState([props.shapes[0]?.varName, start, '=', start, '', '', check])
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
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
  ]);
  if (!localStorage.interactions) {
    var a = [];
    localStorage.setItem('interactions', JSON.stringify(a));
  }
  useEffect(() => {
    let out = []
    for (let i = 0; i < props.shapes.length; i++) {
      out.push(props.shapes[i].varName)
    }
    out.sort()
    setShapes(out)
  }, [props.shapes])

  useEffect(() => {
    if (showAddition && interaction[4] === '') {
      interaction[4] = '+'
      interaction[5] = start
    }

  })
  const populateGlobal = () => {
    let ints = props.ints
    let list = []
    for (let i = 0; i < ints.length; i++) {
      if (ints[i][6] === 'var') {
        list.push(<div className="condition-inputs">
          <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
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
      if(ints[i][6] === 'page'){
        list.push(<div className="condition-inputs">
          <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
          <div className="ints-container">
            <div className={"if"}>
              <h1>When</h1><h2>{ints[i][0]}</h2><h1>Is Clicked</h1>
            </div>
            <div className={"then"}>
              <h1>Go to page</h1><h2>{ints[i][5]}</h2>
            </div>
          </div>
        </div>)
      }
      else {
        list.push(<div className="condition-inputs">
          <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
          <div className="ints-container">
            <div className={"if"}>
              <h1>When</h1><h2>{ints[i][0]}</h2><h1>Is Clicked</h1>
            </div>
            <div className={"then"}>
              <h1>Increment</h1><h2>{ints[i][1]}</h2><h1>By</h1><h3>{ints[i][3]}</h3>
            </div>
          </div>
        </div>)
      }
    }
    return list
  }
  const populateSession = () => {
    let ints = JSON.parse(localStorage.getItem('sessionInts')) || [];
    let list = []
    for (let i = 0; i < ints.length; i++) {
      if (ints[i][6] === 'var') {
        list.push(<div className="condition-inputs">
          <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
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
      if(ints[i][6] === 'page'){
        list.push(<div className="condition-inputs">
          <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
          <div className="ints-container">
            <div className={"if"}>
              <h1>When</h1><h2>{ints[i][0]}</h2><h1>Is Clicked</h1>
            </div>
            <div className={"then"}>
              <h1>Go to page</h1><h2>{ints[i][5]}</h2>
            </div>
          </div>
        </div>)
      }
      else {
        list.push(<div className="condition-inputs">
          <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
          <div className="ints-container">
            <div className={"if"}>
              <h1>When</h1><h2>{ints[i][0]}</h2><h1>Is Clicked</h1>
            </div>
            <div className={"then"}>
              <h1>Increment</h1><h2>{ints[i][1]}</h2><h1>By</h1><h3>{ints[i][3]}</h3>
            </div>
          </div>
        </div>)
      }
    }
    return list
  }

  const addCon = () => {
    let a = [];
    if (props.current === 'session') {
      a = JSON.parse(localStorage.getItem('sessionInts')) || [];
      a.push(interaction);
      localStorage.setItem('sessionInts', JSON.stringify(a));
    }
    else if (props.current === 'global') {
      a = JSON.parse(localStorage.getItem('interactions')) || [];
      a.push(interaction);
      localStorage.setItem('interactions', JSON.stringify(a));
      props.setInts(a)
    }
    setShowConAdd(!showConAdd)
    setInteraction([props.shapes[0]?.varName, start, '=', start, '', '', check])
  }
  const deleteCon = (i) => {
    let a = [];
    if (props.current === 'session') {
      a = JSON.parse(localStorage.getItem('sessionInts')) || [];
      a.splice(i, 1);
      localStorage.setItem('sessionInts', JSON.stringify(a));
    }
    else if (props.current === 'global') {
      a = JSON.parse(localStorage.getItem('interactions')) || [];
      a.splice(i, 1);
      localStorage.setItem('interactions', JSON.stringify(a));
      props.setInts(a)
    }
  }
  const handle1 = () => {
    setShowAddition(!showAddition)
  }
  const handleCheck = (e) => {
    setCheck(e.target.value)
    if (e.target.value === "incr") {
      setIsCheck(!isCheck)
      setIsVCheck(false)
      setIsPCheck(false)
    }
    if (e.target.value === "var") {
      setIsVCheck(!isVCheck)
      setIsCheck(false)
      setIsPCheck(false)
    }
    if (e.target.value === "page") {
      setIsPCheck(!isPCheck)
      setIsCheck(false)
      setIsVCheck(false)
    }
    handleInteraction(6, e)
  }
  const handleOut = () => {
    if (props.current === 'global')
      return (populateGlobal())
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
  const getSpecialBox = (i, n) => {
    let list = []
    list.push(
      <div className='var-box'>
        <button style={{ backgroundColor: box[i].state === 'var' ? 'var(--primary)' : "white", color: box[i].state === 'var' ? 'white' : "black" }} onClick={() => updateState('var', i)}>Var</button>
        <button style={{ backgroundColor: box[i].state === 'val' ? 'var(--primary)' : "white", color: box[i].state === 'val' ? 'white' : "black" }} onClick={() => updateState('val', i)}>Val</button>
        <div className="box int-special">
          {box[i].state === 'var' ? (
            <MultiLevel data={props.gameVars} handleChange={handleChange} x={n} />
          ) : (
            <input
              className="int-box"
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
    console.log(input)
    console.log(out)
    setInteraction(input)
  }

  const handleChange = (value, x) => {
    console.log(value, x)
    interaction[x] = value.label
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
        ADD NEW INTERACTION
      </div>

      {showConAdd && (
        <div className="variable-adding ints-fix">
          <div className="ints-area">
            <div className="ints-name">
              <h1>Input to Set</h1>
              <select onChange={(e) => handleInteraction(0, e)}>
                {shapes.map((data) => (
                  <option value={data}>
                    {data}
                  </option>
                ))}
              </select>
            </div>
            <div className='ints-checks'>
              <input type="checkbox" name="checkbox" value="incr" onChange={(e) => handleCheck(e)} checked={isCheck} />
              <h1>Incremental</h1>
              <input type="checkbox" name="checkbox" value="var" onChange={(e) => handleCheck(e)} checked={isVCheck} />
              <h1>Variable</h1>
              <input type="checkbox" name="checkbox" value="page" onChange={(e) => handleCheck(e)} checked={isPCheck} />
              <h1>Page</h1>
            </div>
            {check === 'var' && (
              <div className={'ints-con'}>
                <h2 className="smaller-text">SET</h2>
                <div className="box int-special">
                  <MultiLevel data={props.gameVars} handleChange={handleChange} x={1} />
                </div>
                <div className="box select jequal">
                  <h1>=</h1>
                </div>

                {getSpecialBox(1, 3)}


                {showAddition && (
                  <>
                    <div className="box select">
                      <select onChange={(e) => handleInteraction(4, e)}>
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="x"> x </option>
                        <option value="/"> / </option>
                      </select>
                    </div>

                    {getSpecialBox(2, 5)}
                  </>
                )}
                <button className="nob" onClick={() => handle1()}>
                  {!showAddition ? (
                    <Plus className="icon plus specialt" />
                  ) : (
                    <Line className="icon plus specialer" />
                  )}
                </button>

              </div>
            )}
            {check === 'incr' && (
              <div className={'ints-con'}>
                <h2 className="smaller-text">INCREMENT</h2>
                <div className="box int-special incr">
                  <MultiLevel data={props.gameVars} handleChange={handleChange} x={1} />
                </div>
                <h2 className="smaller-text">BY</h2>

                {getSpecialBox(1, 3)}

              </div>
            )}
            {check === 'page' && (
              <div className={'ints-con'}>
                <div className="int-page-con">
                <h2 className="smaller-text">Go to page </h2>
                <input className="int-page-box" onChange={(e) => handleInteraction(5, e)} type="text" placeholder="page" />
                </div>
              </div>
            )}
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
        message={"Are you sure you want to delete this interaction? This action cannot be undone."}
      />
    </>
  );
}

export default Interaction;
