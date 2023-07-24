import React, { useLayoutEffect, useContext, useRef, useState, useEffect } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { useAlertContext } from "../../../Alerts/AlertContext";
import { SettingsContext } from "../../../../App";
import { useTranslation } from "react-i18next";
import Draggable from 'react-draggable'
import ReactTooltip from "react-tooltip";
import Switch from "react-switch";
import { MenuProvider } from './VariableContext'; // import the context




import Variable from "./Variable.jsx"
import Condition from "./Condition.jsx"
import Interaction from "./Interaction.jsx"
import Trigger from "./Trigger.jsx";

import "../../Sidebar.css";
import "./Variable.css"

import Trash from "../../../../../public/icons/trash-can-alt-2.svg"
import User from "../../../../../public/icons/user.svg"
import Users from "../../../../../public/icons/users-2.svg"
import Plus from "../../../../../public/icons/circle-plus.svg"
import Line from "../../../../../public/icons/minus.svg"
import Close from "../../../../../public/icons/close.svg"
import Info from "../../../../../public/icons/info.svg"
import { update } from "immutable";
import MultiLevel from "../../../Dropdown/Multilevel";
import { set } from "draft-js/lib/EditorState";

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

function useResizeObserver() {
  const ref = useRef();
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 300, y: 300 });

  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new MutationObserver(entries => {
      entries.forEach(entry => {
        if (entry.type === 'attributes' && entry.attributeName === 'style') {
          const { top, left } = entry.target.getBoundingClientRect();
          setPosition({ x: left, y: top });
          setDimensions({
            width: entry.target.clientWidth,
            height: entry.target.clientHeight,
          });
        }

      });
    });

    if (observeTarget) {
      resizeObserver.observe(observeTarget, { attributes: true });
    }

    return () => {
      resizeObserver.disconnect(observeTarget);
    };
  }, [ref]);
  return [ref, dimensions, position];
}

const Variables = (props) => {
  const { t } = useTranslation();
  const [enviroment, setEnviroment] = useState(false)
  const [tabsEnviroment, setTabsEnviroment] = useState('global')
  const [updater, setUpdater] = useState(0);
  const [allShapes, setAllShapes] = useState();
  const [shapes, setShapes] = useState();
  const [tabs, setTabs] = useState("variable");
  const [page, setPage] = useState(0);
  const [ref, dimensions, position] = useResizeObserver();
  const [group, setGroup] = useState(props.groups);
  const [height, setDomHeight] = useState(180);
  const [selectedTab, setSelectedTab] = useState("variable");

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

  const handleGroup = (page, variable, action, type) => {

    setGroup((prevState) => {
      let pageData = prevState[page] ? { ...prevState[page] } : {
        tabsEnviroment: tabsEnviroment,
        variable: [],
        condition: [],
        interaction: [],
        trigger: []
      };
      if (pageData[type] === undefined) pageData[type] = [];
      // Check if type is valid
      if (["variable", "condition", "interaction", "trigger"].includes(type)) {
        if (action === "add") {
          // Check if the item is already in the array
          if (!pageData[type]?.some(arr => JSON.stringify(arr) === JSON.stringify(variable))) {
            pageData[type].push(variable);
          }
        } else if (action === "remove") {
          // Filter out the item to remove from array
          pageData[type] = pageData[type].filter(arr => JSON.stringify(arr) !== JSON.stringify(variable));

        }
      }
      let out = {
        ...prevState,
        [page]: pageData
      }
      props.handleGroups(out);
      return out;
    });
  };



  const setHeight = (x) => {
    setDomHeight(x)
  }


  const populateTab = () => {
    if (tabs === "variable") {
      return (
        <div className="condition-input-container" index={tabsEnviroment} style={{ maxHeight: dimensions.height - height }}>
          <Variable
            current={tabsEnviroment}
            {...props}
            setHeight={setHeight}
            position={position}
            dimensions={dimensions}
            handleGroup={handleGroup}
            group={group}
            currentPage={page}
          />
        </div>
      )
    }
    if (tabs === "condition")
      return (
        <div className="condition-input-container" style={{ maxHeight: dimensions.height - height }}>
          <Condition current={tabsEnviroment} {...props} update={handleUpdate} setHeight={setHeight} position={position} dimensions={dimensions} handleGroup={handleGroup} group={group} currentPage={page} />
        </div>
      )
    if (tabs === "interaction")
      return (
        <div className="condition-input-container" style={{ maxHeight: dimensions.height - height }}>
          <Interaction current={tabsEnviroment} {...props} shapes={shapes} setHeight={setHeight} position={position} dimensions={dimensions} handleGroup={handleGroup} group={group} currentPage={page} />
        </div>
      )
    if (tabs === "trigger")
      return (
        <div className="condition-input-container" style={{ maxHeight: dimensions.height - height }}>
          <Trigger current={tabsEnviroment} {...props} allShapes={allShapes} setHeight={setHeight} position={position} dimensions={dimensions} handleGroup={handleGroup} group={group} currentPage={page} />
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
  const handleChange = (e) => {
    setPage(parseInt(e.target.value))
  }

  return (
    <MenuProvider>
      <div className="variable-container" index={updater}>
        <Draggable handle="strong" >
          <div className="variable-dis" ref={ref}>
            <div className="variable-wiz">
              <div className="variable-header">
                <button className="tooltips" data-tip data-for="infoTip"><Info className="icon info-var" /></button>
                <ReactTooltip id="infoTip" place="right" effect="solid" multiline={true}>
                  Random = Random(min, max, step) <br />
                  Seperate values in array with ','
                </ReactTooltip>
                {selectedTab === 'variable' || selectedTab === 'condition' ?
                  <select style={{ display: 'inline-block' }} onChange={handleChange} className={'variable-page-select'}>
                    <option value={0}>All</option>
                    {[...Array(props.pages)]?.map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                  : 
                  <select style={{ display: 'inline-block' }} disabled className={'variable-page-select'}>
                      <option>
                        {props.page}
                      </option>
                  </select>
                }
                <strong><h1 className="variable-title">Variable Wizard</h1></strong>
                <div className="switch-container" style={{ border: tabsEnviroment === 'global' ? '1px solid var(--red)' : '1px solid var(--green)' }}>
                  <Switch onChange={handleSwitchChange} checked={enviroment} checkedIcon={false} uncheckedIcon={false} onColor="#75fa83" offColor="#cf6161"
                    className="var-switch" id="material-switch" />
                  <h1>{tabsEnviroment}</h1>
                </div>
                <button className="con" onClick={props.closePerformance}><Close className="icon close-var" /></button>
              </div>
              <div className="con-container">
                <button
                  className={(tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session') + (selectedTab === "variable" ? '-selected' : '')}
                  onClick={() => { setTabs("variable"); setSelectedTab("variable"); }}
                >
                  Variables
                </button>
                <button
                  className={(tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session') + (selectedTab === "condition" ? '-selected' : '')}
                  onClick={() => { setTabs("condition"); setSelectedTab("condition"); }}
                >
                  Conditions
                </button>
                <button
                  className={(tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session') + (selectedTab === "interaction" ? '-selected' : '')}
                  onClick={() => { setTabs("interaction"); setSelectedTab("interaction"); }}
                >
                  Interactions
                </button>
                <button
                  className={(tabsEnviroment === 'global' ? 'con-tabs' : 'con-tabs-session') + (selectedTab === "trigger" ? '-selected' : '')}
                  onClick={() => { setTabs("trigger"); setSelectedTab("trigger"); }}
                >
                  Triggers
                </button>
              </div>

              {populateTab()}

            </div>
          </div>
        </Draggable>
      </div>
    </MenuProvider>
  );
}

export default Variables;
