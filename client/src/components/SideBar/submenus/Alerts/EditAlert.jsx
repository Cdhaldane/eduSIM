
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

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
  & input::placeholder {
    opacity: .5;
  }
  & > select {
    font-size: 1em;
    padding: 4px;
    border: 1px solid;
    margin-bottom: 5px;
  }
  & > row {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  & > row > input {
    min-width: 0;
    flex: 1;
    border-radius: 4px;
    border: 1px solid;
    padding: 4px;
    font-family: inherit;
  }
  & > row > p {
    margin: 0 5px;
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

const EditAlert = ({ onEdit, onCancel, init={}, adding, hidden }) => {
  const [formData, setFormData] = useState(init);
  const [lastHidden, setLastHidden] = useState(hidden);
  const { t } = useTranslation();

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
        <label>{t("edit.requiredToAdvance")}</label>
      </div>
      <label>{t("edit.unfinishedLabel")}</label>
      <input type="text" placeholder="Not yet completed" value={formData.offLabel || ""} onChange={changeValue("offLabel")} />
      <label>{t("edit.finishedLabel")}</label>
      <input type="text" placeholder="Completed" value={formData.onLabel || ""} onChange={changeValue("onLabel")} />
      <label>{t("edit.completedWhen")}</label>
      <input type="text" placeholder="Variable name" value={formData.varName || ""} onChange={changeValue("varName")} />
      <select 
        name="inputtype"
        value={formData.varCondition}
        onChange={changeValue("varCondition")} 
      >
        {[
          "positive",
          "negative",
          "isgreater",
          "isless",
          "isequal",
          "between",
          "onchange"
        ].map(val => (
          <option value={val} key={val}>{t(`edit.cond.${val}`)}</option>
        ))}
      </select>
      {formData.varCondition?.startsWith('is') && (
        <input type="text" placeholder={t("edit.valueToCheckAgainst")}  value={formData.varCheck || ""} onChange={changeValue("varCheck")} />
      )}
      {formData.varCondition == 'between' && (
        <row>
          <input type="text" placeholder={t("edit.minimum")} value={formData.varCheck || ""} onChange={changeValue("varCheck")} />
          <p>and</p> 
          <input type="text" placeholder={t("edit.maximum")} value={formData.varCheckAlt || ""} onChange={changeValue("varCheckAlt")} />
        </row>
      )}
      <div>
        <input type="button" onClick={onCancel} value={t("common.cancel")} />
        <input type="submit" onClick={addAlert} value={adding ? t("common.add") : t("common.edit")} />
      </div>
    </Container>
  );
}

export default EditAlert;