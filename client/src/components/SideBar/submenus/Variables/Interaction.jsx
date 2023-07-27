import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useAlertContext } from "../../../Alerts/AlertContext";
import { MenuContext } from "./VariableContext";


import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import Pencil from "../../../../../public/icons/pencil.svg"
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
  const [contextIndex, setContextIndex] = useState(-1)
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const alertContext = useAlertContext();
  const { contextMenu, handleContextMenu, hideContextMenu } = useContext(MenuContext);
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
    
    out.sort((a, b) => {
      if(a.varName)
        return a.varName.localeCompare(b.varName)
    })
    setShapes(out)
  }, [props.shapes])

  const handleEdit = (i) => {
    let x = fullInteractions[i]
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
        list.push(<div className="condition-inputs" onContextMenu={(e) => (handleContextMenu(e, props.page), setContextIndex(i))}>
          <div className="variable-buttons">
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(ints[i]); }} />
            <Pencil onClick={() => handleEdit(i)} />
           
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
        list.push(<div className="condition-inputs" onContextMenu={(e) => (handleContextMenu(e, props.page), setContextIndex(i))}>
          <div className="variable-buttons">
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(ints[i]); }} />
            <Pencil onClick={() => handleEdit(i)} />
            
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
        list.push(<div className="condition-inputs" onContextMenu={(e) => (handleContextMenu(e, props.page), setContextIndex(i))}>
          <div className="variable-buttons">
            <Trash onClick={() => { setConfirmationModal(true); setDeleteIndex(ints[i]); }} />
            <Pencil onClick={() => handleEdit(i)} />
           
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
  
    if (editingIndex !== -1) {
      x.splice(editingIndex, 1, interaction)
    } else {
      x.push(interaction)
    }
    if (props.current === 'session') props.setLocalInts(x)
    if (props.current === 'global') props.setGlobalInts(x)

    setShowConAdd(!showConAdd)
    setInteraction(['', '', '=', '', '', '', check])
    setEditingIndex(-4)
    setFullInteractions(x)
  }
  const deleteCon = (int) => {
    let a = props.current === 'global' ? props.globalInts : props.localInts
    let page = getPageData(int)
    let x = []
    a.map((temp) => {
      if(temp !== int)
      x.push(temp)
    })
    
    if (props.current === 'session') props.setLocalInts(x)
    if (props.current === 'global') props.setGlobalInts(x)

    props.handleGroup(page, int, 'remove', 'interaction')
    setConfirmationModal(false)
    // setFullInteractions(x)
  }
  const handle1 = () => {
    setShowAddition(!showAddition)
    let x = [...interaction]
    if(showAddition){
      x[4] = ''
      x[5] = ''
    } else {

      x[4] = fullInteractions[editingIndex][4]
      x[5] = fullInteractions[editingIndex][5]
    }
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
    let out = []
    if(props.currentPage=== 0) {
    if (props.current === 'global') {
      out = (props.globalInts)
      setVariables(props.globalVars)
    }
    if (props.current === 'session') {
      out = (props.localInts)
      setVariables(props.localVars)
    } 
    } else {
      let interaction = props.group[props.currentPage] ? props.group[props.currentPage].interaction : []
      out = (interaction)
    }
    let x
    x = out.filter(arr => {
      for (let obj of props.shapes) {
        arr = arr.flat()
        if (arr[0] === obj.varName) {
          return true;
        }
      }
      return false;
    });
    setFullInteractions(out)
    setRender(populateInteractions(x))
  }, [props.current, props.localInts, props.globalInts, props.localVars, props.globalVars, props.page, props.shapes, props.group, props.currentPage, showConAdd, editingIndex, fullInteractions])

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
    setInteraction(input)
  }

  const handleChange = (value, x) => {
    let input = [...interaction]
    input[x] = value.label
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
          {render}
        </>
      )}
      <div className="variable-add tester" onClick={() => handleAdding()} hidden={showConAdd}>
        <Plus className="icon plus" />
        ADD NEW INTERACTION
      </div>

      {showConAdd && (
        <div className="variable-adding ints-fix" >
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
      {contextMenu.show && (
        <div className={`variable-context ${contextMenu.show ? 'show' : ''}`}
          style={{
            top: `${contextMenu.y - props.position.y}px`,
            left: `${contextMenu.x - props.position.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {props.currentPage === 0 ? (
            <button onClick={() => (props.handleGroup(props.page, fullInteractions[contextIndex], 'add', 'interaction'), hideContextMenu())}>Add to page {props.page}</button>) : (
            <button onClick={() => (props.handleGroup(props.currentPage, fullInteractions[contextIndex], 'remove', 'interaction'), hideContextMenu())}>Remove from page {props.currentPage}</button>
          )}
        </div>
      )}
    </>
  );
}

export default Interaction;
