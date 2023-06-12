import React, { useLayoutEffect, useContext, useRef, useState, useEffect } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { useAlertContext } from "../../../Alerts/AlertContext";
import { SettingsContext } from "../../../../App";
import { useTranslation } from "react-i18next";
import Draggable from 'react-draggable'
import ReactTooltip from "react-tooltip";
import Switch from "react-switch";


import Variable from "./Variable.jsx"
import Condition from "./Condition.jsx"
import Interaction from "./Interaction.jsx"
import Trigger from "./Trigger.jsx";

import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import User from "../../../../../public/icons/user.svg"
import Users from "../../../../../public/icons/users-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import Close from "../../../../../public/icons/close.svg"
import Info from "../../../../../public/icons/info.svg"
import { update } from "immutable";

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
  const { t } = useTranslation();
  const { updateSetting, settings } = useContext(SettingsContext);
  const alertContext = useAlertContext();
  const [enviroment, setEnviroment] = useState(false)
  const [tabsEnviroment, setTabsEnviroment] = useState('global')
  const [current, setCurrent] = useState();
  const [updater, setUpdater] = useState(0);
  const [allShapes, setAllShapes] = useState();
  const [shapes, setShapes] = useState();
  const [tabs, setTabs] = useState("variable");
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    element.addEventListener('resize', () => { });
    function checkResize(mutations) {
      const event = new CustomEvent('resize', { detail: { width: element.clientWidth, height: element.clientHeight } });
      element.dispatchEvent(event);
      setHeight(element.clientHeight)
    }
    const observer = new MutationObserver(checkResize);
    observer.observe(element, { attributes: true, attributeOldValue: true, attributeFilter: ['style'] });
  }, []);

  useEffect(() => {
    let allShapes = []; // Initialize allShapes as an empty array
    let shapes = []; // Initialize shapes as an empty variable

    props.allShapes.forEach(shape => {
      if (shape.level === props.page) {
        allShapes.push(shape);
      }
    });
    setAllShapes(allShapes);
    props.shapes.forEach(shape => {
      if (shape.level === props.page) {
        shapes.push(shape);
      }
    });
    setShapes(shapes);
  }, [props.shapes, props.allShapes, props.page])

  const populateTab = () => {
    if (tabs === "variable") {
      return (
        <div className="condition-input-container" index={tabsEnviroment} style={{ maxHeight: height - 200 }}>
          <Variable current={tabsEnviroment} {...props} />
        </div>
      )
    }
    if (tabs === "condition")
      return (
        <div className="condition-input-container" style={{ maxHeight: height - 200 }}>
          <Condition current={tabsEnviroment} {...props} update={handleUpdate} />
        </div>
      )
    if (tabs === "interaction")
      return (
        <div className="condition-input-container" style={{ maxHeight: height - 200 }}>
          <Interaction current={tabsEnviroment} {...props} shapes={shapes} />
        </div>
      )
    if (tabs === "trigger")
      return (
        <div className="condition-input-container" style={{ maxHeight: height - 200 }}>
          <Trigger current={tabsEnviroment} {...props} allShapes={allShapes} />
        </div>
      )
  }

  const handleSwitchChange = () => {
    setEnviroment(!enviroment)
    if (enviroment)
      setTabsEnviroment('global')
    if (!enviroment)
      setTabsEnviroment('session')
  }

  const handleUpdate = () => {
    setTabs('variable')
    setUpdater(updater + 1)
    setTabs('condition')
  }

  const populateLevelDropdown = () => {


  }

  return (
    <div className="variable-container" index={updater}>
      <Draggable handle="strong">
        <div className="variable-dis" ref={ref}>
          <div className="variable-wiz">
            <div className="variable-header">
              <button className="tooltips" data-tip data-for="infoTip"><Info className="icon info-var" /></button>
              <ReactTooltip id="infoTip" place="right" effect="solid" multiline={true}>
                Random = Random(min, max, step) <br />
                Seperate values in array with ','
              </ReactTooltip>
              {populateLevelDropdown()}
              <strong><h1 className="variable-title">Variable Wizard</h1></strong>
              <div className="switch-container" style={{ border: tabsEnviroment === 'global' ? '1px solid var(--red)' : '1px solid var(--green)' }}>
                <Switch onChange={handleSwitchChange} checked={enviroment} checkedIcon={false} uncheckedIcon={false} onColor="#75fa83" offColor="#cf6161"
                  className="var-switch" id="material-switch" />
                <h1>{tabsEnviroment}</h1>
              </div>
              <button className="con" onClick={props.closePerformance}><Close className="icon close-var" /></button>
            </div>
            <div className="con-container">
              <button className={tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session'} onClick={() => setTabs("variable")}>Variables</button>
              <button className={tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session'} onClick={() => setTabs("condition")}>Conditions</button>
              <button className={tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session'} onClick={() => setTabs("interaction")}>Interactions</button>
              <button className={tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session'} onClick={() => setTabs("trigger")}>Triggers</button>
            </div>
            {populateTab()}
          </div>
        </div>
      </Draggable>
    </div>
  );
}

export default Variables;
