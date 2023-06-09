import React, { useCallback, useContext, useState, useEffect, useMemo, useRef } from "react";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";


import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import MultiLevel from "../../../Dropdown/Multilevel";
import { useAlertContext } from "../../../Alerts/AlertContext";


const Trigger = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [variables, setVariables] = useState(props.globalVars)
  const [fullTriggers, setFullTriggers] = useState([])
  const [shapes, setShapes] = useState()
  const [trigger, setTrigger] = useState([null, null, null]);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const alertContext = useAlertContext();

  useEffect(() => {
    let out = []
    for (let i = 0; i < props.allShapes.length; i++) {
      out.push(props.allShapes[i].name)
    }
    out.sort()
    setShapes(out)
  }, [props.allShapes])

  const populateTriggers = (trigs) => {
    return trigs?.map((trig, i) => (
      <div className="condition-inputs cons-condition">
        <i onClick={() => { setConfirmationModal(true); setDeleteIndex(i); }}><Trash className="icon var-trash" /></i>
        <h1>When</h1><h2>{trig[0]}</h2> <h1>touches</h1> <h2>{trig[1]}</h2> <h1>set</h1> <h3>{trig[2]}</h3> <h1>to true.</h1>
      </div>
    ));
  };

  const addCon = () => {
    if(trigger[0] === null || trigger[1] === null || trigger[2] === null) {
      alertContext.showAlert("Please fill out all fields", "warning")
      return
    }
    let data = fullTriggers
    data.push(trigger)
    if (props.current === 'global') props.setGlobalTrigs(data) 
    if (props.current === 'session') props.setLocalTrigs(data)
    setShowConAdd(!showConAdd)
  }
  const deleteCon = (i) => {
    let data = fullTriggers
    data.splice(i, 1)
    if (props.current === 'global') props.setGlobalTrigs(data) 
    if (props.current === 'session') props.setLocalTrigs(data)
    setConfirmationModal(false);
  }

  const handleInteraction = (index, e) => {
    const value = e.target.value;
    if (index === 0) {
      setTrigger([value, trigger[1] !== value ? trigger[1] : null, trigger[2]]);
    } else if (index === 1 && value !== trigger[0]) {
      setTrigger([trigger[0], value, trigger[2]]);
    }
  };

  const handleChange = (value, x) => {
    setTrigger([trigger[0], trigger[1], value.label.toString()])
  }

  const handleOut = () => {
    let trigs = []
    if (props.current === 'global') {
      trigs = props.globalTrigs
    }
    if (props.current === 'session') {
      trigs = props.localTrigs
    }
    return (populateTriggers(trigs))
  }

  useEffect(() => {
    console.log(props)

    if (props.current === 'global') {
      setFullTriggers(props.globalTrigs)
      setVariables(props.globalVars)
    }
    if (props.current === 'session') {
      setFullTriggers(props.localTrigs)
      setVariables(props.localVars)
    }
  }, [props.current, props.localTrigs, props.globalTrigs, props.localVars, props.globalVars])

  return (
    <>
      {!showConAdd && (
        <>
          {handleOut()}
        </>
      )}
      <div className="variable-add tester" onClick={() => setShowConAdd(true)} hidden={showConAdd}>
        <Plus className="icon plus" />
        ADD NEW TRIGGER
      </div>

      {showConAdd && (
        <div className="variable-adding trigs-fix">
          <div className="trigs-area">
            <div className="trigger-name">
              <h1>Variable to Set</h1>
              <MultiLevel data={variables} handleChange={handleChange} className="trigger-multi" />
            </div>
            <div className='trigger-container'>
              <h2>WHEN SHAPE</h2>
              <div className="trigger-box">
                <select onChange={(e) => handleInteraction(0, e)}>
                  <option value={null}>select shape</option>
                  {shapes.map((data) => {
                    return (
                      <option key={data} value={data}>
                        {data}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="trigger-touch">
                <h1>TOUCHES</h1>
              </div>
              <div className="trigger-box">
                <select onChange={(e) => handleInteraction(1, e)}>
                  <option value={null}>select shape</option>
                  {shapes.filter((data) => data !== trigger[0]).map((data) => {
                    return (
                      <option key={data} value={data}>
                        {data}
                      </option>
                    );
                  })}
                </select>
              </div>
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
        message={"Are you sure you want to delete this interaction? This action cannot be undone."}
      />
    </>
  );
}

export default Trigger;
