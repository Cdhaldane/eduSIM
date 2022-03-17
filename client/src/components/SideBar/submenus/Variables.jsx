import React, { useContext, useState } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { SettingsContext } from "../../../App";
import { useTranslation } from "react-i18next";

import "../Sidebar.css";

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 20px;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0 10px;
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
    opacity: 0.8;
  }
  & > input[type="checkbox"] {
    min-width: 26px;
    min-height: 26px;
    margin-left: 10px;
  }
`;


const Variables = (props) => {
  const { t } = useTranslation();
  const { updateSetting, settings } = useContext(SettingsContext);
  const [personal, setPersonal] = useState([])
  const [game, setGame] = useState([])
  const [sessionText, setSessionText] = useState([])
  const [gameText, setGameText] = useState([])

  const populateSessionVars = () => {
    let vars = props ? props.vars : 0;
    let sessionVars = sessionStorage.gameVars ? JSON.parse(sessionStorage.gameVars) : [];
    let list = [];
    let varName
    for (let i = 0; i < (vars ? vars.length : 0); i++) {
      if (!vars[i].sync) {
        varName = vars[i].varName
        list.push(
          !props.editpage ? <div className="variable-inputs"><h1>{varName} = {sessionVars[varName]}</h1><hr /></div> :
            <div className="variable-inputs"><h1>{varName} = </h1>
              <input type="text" value={sessionText} placeholder={"empty"} onChange={e => handleSession(e.target.value, varName)} />
              <hr /></div>
        )
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
    let sessionVars = sessionStorage.gameVars ? JSON.parse(sessionStorage.gameVars) : [];
    let list = [
      <React.Fragment key={-1}>
        <div className="variable-inputs"><h1>Level = {sessionVars["level"]}</h1><hr /></div>
      </React.Fragment>
    ];
    let variable;
    for (let i = 0; i < (vars ? vars.length : 0); i++) {
      if (vars[i].sync) {
        variable = vars[i].varName
        list.push(
          <React.Fragment key={i}>
            {
              !props.editpage ?
                (<div className="variable-inputs"><h1>{variable} = {props.gameVars[vars[i].varName]}</h1><hr /></div>) :
                (<div className="variable-inputs">
                  <h1>{variable} = </h1>
                  <input
                    type="text"
                    value={gameText}
                    placeholder={"empty"}
                    onChange={e => handleGame(e.target.value, variable)} />
                  <hr />
                </div>)
            }
          </React.Fragment>
        )
      }
    }
    return list
  }

  const handleGame = (e, varName) => {
    setGameText(e)
    this.props.socket.emit("varChange", {
      varName, e
    })
  }



  return (
    <SettingsContainer>
      <h2>{t("sidebar.variables")}</h2>
      <hr />
      <SettingRow>
        <i className="settings-icons lni lni-user"></i>
        <b>{t("sidebar.session")}</b>
      </SettingRow>
      <div className="variable-box">
        {populateSessionVars()}
      </div>
      <SettingRow>
        <i className="settings-icons lni lni-users"></i>
        <b>{t("sidebar.game")}</b>
      </SettingRow>
      <div className="variable-box">
        {populateGameVars()}
      </div>
    </SettingsContainer>
  );
}

export default Variables;
