
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import EditAlert from "./EditAlert";
import { useTranslation } from "react-i18next";


import Check from "../../../../../public/icons/checkmark.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import { a } from "react-spring";

const AlertsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 20px;
  overflow-y: auto;
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0;
  background-color: ${p => p.done ? 'rgb(101, 159, 69)' : (
    p.optional ? 'rgb(185, 109, 53)' : 'rgb(185, 53, 53)'
  )};
  color: white;
  padding: 5px;
  border-radius: 8px;
  & > div {
    margin-left: 5px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex: 1;
  }
  & > div > p {
    font-size: .7em;
    margin-bottom: 3px;
  }
  & > div > div {
    opacity: 0.9;
    background-color: white;
    color: ${p => p.done ? 'rgb(45, 85, 23)' : (
    p.optional ? 'rgb(138, 76, 21)' : 'rgb(138, 21, 21)'
  )};
    font-size: .9em;
    word-break: break-word;
    padding: 10px;
    border-radius: 5px;
  }
`;

const AddAlert = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 10px;
  border-radius: 8px;
  font-size: .8em;
  justify-content: center;
  border: 2px dashed black;
  opacity: 0.5;
  background-color: #ededed;
  cursor: pointer;
  & > i {
    margin-right: 8px;
    font-size: 1.5em;
  }
  &:hover {
    opacity: 1;
  }
  ${p => p.hidden && 'display: none;'}
`;

const EditButtons = styled.div`
  margin-bottom: 5px;
  margin-top: -16px;
  margin-right: -5px;
  align-self: flex-end;
  display: flex;
  & > button {
    padding: 5px;
    background: var(--primary);
    border: none;
    border-radius: 5px;
    color: white;
    font-family: inherit;
    cursor: pointer;
    z-index: 1;
    margin: 0 5px;
    outline: 3px solid white;
    width: 24px;
    height: 24px;
    padding: 2px;
  }
`;

const Alerts = (props) => {
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const { t } = useTranslation();
  const [curr, setCurr] = useState(0)
  const [firstLoad, setFirstLoad] = useState(false)
  const [allAlerts, setAllAlerts] = useState([])

  useEffect(() => {
    let out = []
    props.alerts.map((alert, index) => {
      if (alert.page === props.page) {
        out.push(alert)
      }
    })
    handeleNextLevel(out)
    setAllAlerts(out)
  }, [props.alerts, props.page])

  const handleAddAlert = (data) => {
    let out = props.alerts || []
    out.push(data)
    props.setAlerts(out)
    data.page = props.page
    setAllAlerts([...allAlerts, data])
    setAdding(false);
  };

  const handleEditAlert = (data) => {
    console.log(data)
    let out = allAlerts
    out[editingIndex] = data
    console.log(out)
    // setAllAlerts(out)
    props.setAlerts(out)
    setEditingIndex(-1);
  };

  const handleRemoveAlert = (index) => {
    props.setAlerts(old => {
      let n = [...old];
      n.splice(index, 1);
      return n;
    });
  };

  const handleMoveUp = (index) => {
    props.setAlerts(old => {
      let n = [...old];
      let el = n.splice(index, 1)[0];
      n.splice(index - 1, 0, el);
      return n;
    });
  };

  const handleMoveDown = (index) => {
    props.setAlerts(old => {
      let n = [...old];
      let el = n.splice(index, 1)[0];
      n.splice(index + 1, 0, el);
      return n;
    });
  };


  const checkObjConditions = (varName, condition, check, checkAlt) => {

    if (!varName) return true;
    let vars = {};
    if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
    if (!!sessionStorage.lastSetVar) vars.lastsetvar = sessionStorage.lastSetVar;
    if (Object.keys(props.globalVars).length > 0) vars = { ...vars, ...props.globalVars };

    let trueValue = isNaN(check) ? check : parseInt(check);
    let trueValueAlt = isNaN(checkAlt) ? checkAlt : parseInt(checkAlt);
    let val = vars[varName];
    let varLen = isNaN(val) ? (val || "").length : val;

    if(val === true){
      val ='true'
    }

    switch (condition) {
      case "isequal":
        return val == trueValue;
      case "isgreater":
        return varLen > trueValue;
      case "isless":
        return varLen < trueValue;
      case "between":
        return varLen <= trueValueAlt && varLen >= trueValue;
      case "negative":
        return !val;
      case "positive":
        return !!val;
      case "onchange":
        return sessionStorage.lastSetVar === varName
      default: return !!val;
    }

  }

  const taskTrueCount = allAlerts?.reduce((a, data) =>
    !checkObjConditions(data.varName, data.varCondition, data.varCheck, data.varCheckAlt) && !data.optional ? a + 1 : a
    , 0)

  const checkAdvance = () => {
    let advance = false;
    let numRequired = 0;
    let curr = 0;
    for (let i = 0; i < allAlerts.length; i++) {
      if (!allAlerts[i].optional) {
        numRequired += 1;
      }
    }
    if (numRequired === 0) return true
    for (let i = 0; i < allAlerts.length; i++) {
      let done = checkObjConditions(allAlerts[i].varName, allAlerts[i].varCondition, allAlerts[i].varCheck, allAlerts[i].varCheckAlt)
      if (!allAlerts[i].optional && done) {
        curr += 1;
      }
    }
    if (curr === numRequired) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    let done = checkAdvance()
    if (!props.editpage) props.handleDisable(!done)
  }, [allAlerts])


  useEffect(() => {
    props.setTicker(taskTrueCount);
    const done = taskTrueCount;
  }, [taskTrueCount, props.refresh]);

  const handeleNextLevel = (out) => {
    let page = props.page
    for (let i = 0; i < out.length; i++) {
      if (checkObjConditions(out[i].varName, out[i].varCondition, out[i].varCheck, out[i].varCheckAlt)) {
        if (!out[i].advance) {
          if (checkAdvance() && firstLoad === true) {
            props.handleLevel(page + 1)
            return;
          }
        }
      }
    }
    setFirstLoad(true)
  }

  return (
    <AlertsContainer>
      <h2>{t("sidebar.alerts")}</h2>
      <hr />
      {allAlerts.length > 0 && allAlerts.map((data, index) => {
        const done = checkObjConditions(data.varName, data.varCondition, data.varCheck, data.varCheckAlt);
        return (
          <React.Fragment key={index}>
            {editingIndex === index ? (
              <EditAlert
                onEdit={handleEditAlert}
                onCancel={() => setTimeout(() => setEditingIndex(-1), 10)}
                init={data}
                variables={props.globalVars}
              />
            ) : (
              <>
                <Alert done={done} optional={data.optional}>
                  {done ? <i><Check className="icon alert-green" /></i> : (
                    data.optional ? <i className="fas fa-question-circle" /> : <i className="fas fa-times-circle" />
                  )}
                  <div>
                    <p>{done ? t("sidebar.taskComplete") : t("sidebar.taskNotComplete", { context: data.optional ? "optional" : "required" })}</p>
                    <div>{done ? data.onLabel : data.offLabel}</div>
                  </div>
                </Alert>
                {props.editpage &&
                  <EditButtons>
                    <button onClick={() => setTimeout(() => handleMoveUp(index), 10)}>
                      <i className="fas fa-angle-up" />
                    </button>
                    <button onClick={() => setTimeout(() => handleMoveDown(index), 10)}>
                      <i className="fas fa-angle-down" />
                    </button>
                    <button onClick={() => setTimeout(() => setEditingIndex(index), 10)}>
                      <i className="fas fa-pen" />
                    </button>
                    <button onClick={() => setTimeout(() => handleRemoveAlert(index), 10)}>
                      <i className="fas fa-trash" />
                    </button>
                  </EditButtons>
                }
              </>
            )}
          </React.Fragment>
        )
      })}
      {props.editpage ? (
        <>
          <EditAlert
            page={props.page}
            onEdit={handleAddAlert}
            adding
            onCancel={() => setAdding(false)}
            hidden={!adding}
            init={{ advance: false, global: true, optional: false, varName: "", varCondition: "isgreater", varCheck: 0, varCheckAlt: 0, onLabel: "", offLabel: "" }}
            variables={props.globalVars}
          />
          <AddAlert
            onClick={() => setAdding(true)}
            hidden={adding}
          >
            <Plus className="icon plus" />
            {t("sidebar.addNewTask")}
          </AddAlert>
        </>
      ) : props.alerts.length == 0 && (
        <div style={{ opacity: 0.5 }}>
          {t("sidebar.noTasks")}
        </div>
      )}
    </AlertsContainer>
  );
}

export default Alerts;
