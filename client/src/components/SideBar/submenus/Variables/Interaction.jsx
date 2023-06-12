import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useAlertContext } from "../../../Alerts/AlertContext";

import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import MultiLevel from "../../../Dropdown/Multilevel";
import { set } from "immutable";
import { use } from "i18next";


const Interaction = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [showAddition, setShowAddition] = useState(false);
  const [check, setCheck] = useState('');
  const [isCheck, setIsCheck] = useState(false);
  const [isVCheck, setIsVCheck] = useState(false);
  const [isPCheck, setIsPCheck] = useState(false);
  const [render, setRender] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [shapes, setShapes] = useState()
  const [variables, setVariables] = useState(props.globalVars)
  const [fullInteractions, setFullInteractions] = useState([])
  const start = variables[0] ? (Object.keys(variables[0])).toString() : ''
  const [interaction, setInteraction] = useState([props.shapes[0]?.varName, start, '=', start, '', '', check])
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const alertContext = useAlertContext();
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
      let name = props.shapes[i].varName
      out.push({ [name]: i })
    }
    out.sort((a, b) => a.varName.localeCompare(b.varName))
    setShapes(out)
  }, [props.shapes])

  // useEffect(() => {
  //   if (showAddition && interaction[4] === '') {
  //     interaction[4] = '+'
  //     interaction[5] = start
  //   }
  // }, [interaction])

  // useEffect(() => {

  // }, [showConAdd])

  const handleEdit = (i) => {
    let x = fullInteractions[i]
    console.log(x, fullInteractions)
    setIsCheck(false)
    setIsVCheck(false)
    setIsPCheck(false)
    if (x[6] === 'var') {
      setIsVCheck(true)
      setCheck('var')
      if (x[5] === '') {
        setShowAddition(false)
      } else {
        setShowAddition(true)
      }
    }
    else if (x[6] === 'page') {
      setIsPCheck(true)
      setCheck('page')
    }
    else {
      setIsCheck(true)
      setCheck('incr')
    }
    setInteraction(x)
    setShowConAdd(!showConAdd)
    setEditingIndex(i)
  }

  const populateInteractions = (ints) => {
    let list = []
    for (let i = 0; i < ints.length; i++) {
      if (ints[i][6] === 'var') {
        list.push(<div className="condition-inputs">
          <div className="variable-buttons">
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }} />
            <i onClick={() => handleEdit(i)} className="lnil lnil-pencil" />
          </div>
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
      else if (ints[i][6] === 'page') {
        list.push(<div className="condition-inputs">
          <div className="variable-buttons">
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }} />
            <i onClick={() => handleEdit(i)} className="lnil lnil-pencil" />
          </div>
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
          <div className="variable-buttons">
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }} />
            <i onClick={() => handleEdit(i)} className="lnil lnil-pencil" />
          </div>
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
    if (!interaction[0]) {
      alertContext.showAlert("An intercation needs an input!", "warning");
      return
    }
    let x = fullInteractions
    let a = props.localInts

    if (props.current === 'global') {
      a = props.globalInts;
    }
    if (editingIndex !== -1) {
      a.splice(editingIndex, 1, interaction)
      x.splice(editingIndex, 1, interaction)
    } else {
      a.push(interaction);
      x.push(interaction)
    }
    console.log(interaction)

    if (props.current === 'session') props.setLocalInts(a)
    if (props.current === 'global') props.setGlobalInts(a)

    setShowConAdd(!showConAdd)
    setInteraction(['', '', '=', '', '', '', check])

    setFullInteractions(x)
  }
  const deleteCon = (i) => {
    let a = fullInteractions
    let x = props.localInts
    if (props.current === 'global') x = props.globalInts;
    const index = x.indexOf(a[i]);
    if (index > -1) {
      x.splice(index, 1);
    }
    a.splice(i, 1)
    if (props.current === 'session') props.setLocalInts(x)
    if (props.current === 'global') props.setGlobalInts(x)

    setFullInteractions(a)
  }
  const handle1 = () => {
    setShowAddition(!showAddition)
    let x = [...interaction]
    console.log(showAddition)
    if(showAddition){
      x[4] = ''
      x[5] = ''
    } else {
      console.log(fullInteractions, editingIndex)

      x[4] = fullInteractions[editingIndex][4]
      x[5] = fullInteractions[editingIndex][5]
    }
    console.log(x)
    setInteraction(x)
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


  useEffect(() => {
    setLoading(true)
    if (props.current === 'global') {
      let out = props.globalInts.filter(arr => {
        for (let obj of props.shapes) {
          if (arr[0] === obj.varName) {
            return true;
          }
        }
        return false;
      });
      setFullInteractions(out)
      setVariables(props.globalVars)

    }
    if (props.current === 'session') {
      let out = props.localInts.filter(arr => {
        for (let obj of props.shapes) {
          if (arr[0] === obj.varName) {
            return true;
          }
        }
        return false;
      });
      setFullInteractions(out)
      setVariables(props.localVars)
    }
  }, [props.current, props.localInts, props.globalInts, props.localVars, props.globalVars, props.page, props.shapes])

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
            <MultiLevel data={variables} handleChange={handleChange} x={n} baseValue={interaction[n]} />
          ) : (
            <input
              className="int-box"
              onChange={(e) => { handleInteraction(n, e) }}
              type="text"
              placeholder="value"
              value={interaction[n]}
            />
          )}

        </div>
      </div>
    )
    return list
  }


  const handleInteraction = (n, e) => {
    let input = [...interaction]
    input[n] = e.target.value
    console.log(input)
    setInteraction(input)
  }

  const handleChange = (value, x) => {
    let input = [...interaction]
    input[x] = value.label
    console.log(input)
    setInteraction(input)
  }

  const handleAdding = () => {
    setShowConAdd(true)
    setEditingIndex(-1)
    setInteraction(['', '', '=', '', '', '', check])
  }



  return (
    <>
      {!showConAdd && (
        <>
          {populateInteractions(fullInteractions)}
        </>
      )}
      <div className="variable-add tester" onClick={() => handleAdding()} hidden={showConAdd}>
        <Plus className="icon plus" />
        ADD NEW INTERACTION
      </div>

      {showConAdd && (
        <div className="variable-adding ints-fix">
          {editingIndex}
          <div className="ints-area">
            <div className="ints-name">
              <h1>Input to Set</h1>
              <MultiLevel data={shapes} handleChange={handleChange} x={0} baseValue={interaction[0]} className={"multilevel-interaction"} />
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
                  <MultiLevel data={variables} handleChange={handleChange} x={1} baseValue={interaction[1]} />
                </div>
                <div className="box select jequal">
                  <h1>=</h1>
                </div>

                {getSpecialBox(1, 3)}


                {showAddition && (
                  <>
                    <div className="box select">
                      <select onChange={(e) => handleInteraction(4, e)} value={interaction[4]}>
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
                  <MultiLevel data={variables} handleChange={handleChange} x={1} baseValue={interaction[1]} />
                </div>
                <h2 className="smaller-text">BY</h2>

                {getSpecialBox(1, 3)}

              </div>
            )}
            {check === 'page' && (
              <div className={'ints-con'}>
                <div className="int-page-con">
                  <h2 className="smaller-text">Go to page </h2>
                  <input className="int-page-box" onChange={(e) => handleInteraction(5, e)} type="text" placeholder="page" value={interaction[5]} />
                </div>
              </div>
            )}
          </div>
          <div className="con-hold">
            <button className="con-add-b" onClick={() => addCon()}>{editingIndex === -1 ? t("common.add") : "Edit"}</button>
            <button className="con-can-b" onClick={() => setShowConAdd(false) && populateInteractions(fullInteractions)}>{t("common.cancel")}</button>
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
