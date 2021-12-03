
import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 5px 0;
  padding: 10px;
  border-radius: 8px;
  font-size: .8em;
  ${p => p.hidden && 'display: none;'}
  & > label {
    margin-bottom: 2px;
  }
  & > input {
    margin-bottom: 5px;
    border-radius: 4px;
    border: 1px solid;
    padding: 4px;
    font-family: inherit;
  }
  & > input::placeholder {
    opacity: .5;
  }
  & > select {
    font-size: 1em;
    padding: 4px;
    border: 1px solid;
    margin-bottom: 5px;
  }
  & > div {
    display: flex;
    margin: 0px -3px;
    align-items: center;
  }
  & > div > label {
    margin-left: 5px;
    margin-bottom: 5px;
  }
  & > div > input[type='checkbox'] {
    width: 20px;
    height: 20px;
    flex: inherit;
    margin-bottom: 5px;
  }
  & > div > input {
    flex: 1;
    padding: 5px;
    background: var(--primary);
    border: none;
    border-radius: 5px;
    color: white;
    font-family: inherit;
    margin: 0 3px;
    font-size: 1.2em;
    cursor: pointer;
  }
  border: 2px solid darkgray;
`;

function EditAlert({ onEdit, onCancel, init={}, adding, hidden }) {
  const [formData, setFormData] = useState(init);
  const [lastHidden, setLastHidden] = useState(hidden);

  const addAlert = (e) => {
    e.preventDefault();
    onEdit(formData);
    return false;
  };

  const changeValue = (key) => (e) => {
    const val = e.target.value;
    setFormData(old => ({
      ...old,
      [key]: val
    }));
  }

  const changeOptional = () => {
    setFormData(old => ({
      ...old,
      optional: !formData.optional
    }));
  }


  useEffect(() => {
    if (lastHidden !== hidden) {
      setFormData(init);
      setLastHidden(hidden);
    }
  }, [init, hidden]);

  return (
    <Container hidden={hidden}>
      <div>
        <input type="checkbox" checked={!formData.optional} onChange={changeOptional} />
        <label>Required to advance</label>
      </div>
      <label>Unfinished label</label>
      <input type="text" placeholder="Not yet completed" value={formData.offLabel || ""} onChange={changeValue("offLabel")} />
      <label>Finished label</label>
      <input type="text" placeholder="Completed" value={formData.onLabel || ""} onChange={changeValue("onLabel")} />
      <label>Completed when...</label>
      <input type="text" placeholder="Variable name" value={formData.varName || ""} onChange={changeValue("varName")} />
      <select 
        name="inputtype"
        value={formData.varCondition}
        onChange={changeValue("varCondition")} 
      >
        <option value="positive">contains a positive value</option>
        <option value="negative">contains a negative/null value</option>
        <option value="equalto">is equal to</option>
        <option value="onchange">changes</option>
      </select>
      {formData.varCondition === "equalto" && (
        <input type="text" placeholder="Value to check" value={formData.varCheck || ""} onChange={changeValue("varCheck")} />
      )}
      <div>
        <input type="button" onClick={onCancel} value="Cancel" />
        <input type="submit" onClick={addAlert} value={adding ? "Add" : "Edit"} />
      </div>
    </Container>
  );
}

export default EditAlert;