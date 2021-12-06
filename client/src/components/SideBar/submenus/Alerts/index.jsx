
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import EditAlert from "./EditAlert";

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
  opacity: 0.4;
  background-color: lightgray;
  cursor: pointer;
  transition: 0.2s opacity;
  & > i {
    margin-right: 8px;
    font-size: 1.5em;
  }
  &:hover {
    opacity: 0.6;
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

function Alerts({ editpage = true, alerts=[], setAlerts, setTicker, refresh }) {
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleAddAlert = (data) => {
    setAlerts(old => [...old, data]);
    setAdding(false);
  };

  const handleEditAlert = (data) => {
    setAlerts(old => {
      let n = [...old];
      n[editingIndex] = data;
      return n;
    });
    setTimeout(() => setEditingIndex(-1), 10)
  };

  const handleRemoveAlert = (index) => {
    setAlerts(old => {
      let n = [...old];
      n.splice(index,1);
      return n;
    });
  };

  const handleMoveUp = (index) => {
    setAlerts(old => {
      let n = [...old];
      let el = n.splice(index,1)[0];
      n.splice(index-1,0,el);
      return n;
    });
  };
  
  const handleMoveDown = (index) => {
    setAlerts(old => {
      let n = [...old];
      let el = n.splice(index,1)[0];
      n.splice(index+1,0,el);
      return n;
    });
  };

  const checkObjConditions = (varName, condition, check, checkAlt) => {
    if (!varName) return true;
    let vars = {};
    if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
    if (!!sessionStorage.lastSetVar) vars.lastsetvar = sessionStorage.lastSetVar;

    let trueValue = isNaN(check) ? check : parseInt(check);
    let trueValueAlt = isNaN(checkAlt) ? checkAlt : parseInt(checkAlt);

    let val = vars[varName];
    let varLen = isNaN(val) ? (val || "").length : val;

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
      case "onchange":
        return sessionStorage.lastSetVar === varName
      default: return !!val;
    }
  }

  const taskTrueCount = alerts.reduce((a,data) => 
    !checkObjConditions(data.varName, data.varCondition, data.varCheck, data.varCheckAlt) && !data.optional ? a+1 : a
  , 0);

  useEffect(() => {
    setTicker(taskTrueCount);
  }, [taskTrueCount, refresh]);

  return (
    <AlertsContainer>
      <h2>Alerts</h2>
      <hr />
      {alerts.map((data, index) => {
        const done = checkObjConditions(data.varName, data.varCondition, data.varCheck, data.varCheckAlt);
        return (
        <React.Fragment key={index}>
          {editingIndex === index ? (
            <EditAlert
              onEdit={handleEditAlert}
              onCancel={() => setTimeout(() => setEditingIndex(-1), 10)}
              init={data}
            />
          ) : (
            <>
              <Alert done={done} optional={data.optional}>
                {done ? <i className="fas fa-check-circle" /> : (
                  data.optional ? <i className="fas fa-question-circle" /> : <i className="fas fa-times-circle" />
                )}
                <div>
                  <p>{done ? "COMPLETE" : ((data.optional ? "OPTIONAL, " : "REQUIRED, ") + "NOT COMPLETED")}</p>
                  <div>{done ? data.onLabel : data.offLabel}</div>
                </div>
              </Alert>
              {editpage && 
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
      )})}
      {editpage ? (
        <>
          <EditAlert
            onEdit={handleAddAlert}
            adding
            onCancel={() => setAdding(false)}
            hidden={!adding}
            init={{}}
          />
          <AddAlert
            onClick={() => setAdding(true)}
            hidden={adding}
          >
            <i className="fas fa-plus-circle" />
            ADD NEW ALERT
          </AddAlert>
        </>
      ) : alerts.length == 0 && (
        <div style={{opacity: 0.5}}>
          No tasks to complete!
        </div>
      )}
    </AlertsContainer>
  );
}

export default Alerts;
