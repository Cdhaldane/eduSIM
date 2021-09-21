import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import Switch from "react-switch";
import DropdownItem from "./DropdownItem";

import "./Dropdown.css";

const DropdownNavigationBar = (props) => {

  const [menuHeight, setMenuHeight] = useState(null);
  const [messagesChecked, setMessagesChecked] = useState(true);
  const [alertsChecked, setAlertsChecked] = useState(true);
  const [parametersChecked, setParametersChecked] = useState(true);
  const [settingsChecked, setSettingsChecked] = useState(true);
  const [performanceChecked, setPerformanceChecked] = useState(true);
  const dropdownRef = useRef();

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight);

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleClickOutside = e => {
    if (!dropdownRef.current.contains(e.target)) {
      props.close();
    }
  };

  const calcHeight = (el) => {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  const handleMessage = () => {
    setMessagesChecked(!messagesChecked);
    props.mvisible(!messagesChecked);
  }

  const handleAlerts = () => {
    setAlertsChecked(!alertsChecked);
    props.avisible(!alertsChecked);
  }

  const handleParameters = () => {
    setParametersChecked(!parametersChecked);
    props.pavisible(!parametersChecked);
  }

  const handleSettings = () => {
    setSettingsChecked(!settingsChecked);
    props.svisible(!settingsChecked);
  }

  const handlePerformance = () => {
    setPerformanceChecked(!performanceChecked);
    props.pevisible(!performanceChecked);
  }

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
      <CSSTransition
        in={true}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <h1>Edit Navigation Bar</h1>
          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-comment-dots"></i>}
            onClick={handleMessage}>
            Messaging
            <Switch
              onChange={handleMessage}
              checked={messagesChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-bell"></i>}
            onClick={handleAlerts}>
            Alerts
            <Switch
              onChange={handleAlerts}
              checked={alertsChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-sliders-h"></i>}
            onClick={handleParameters}>
            Parameters
            <Switch
              onChange={handleParameters}
              checked={parametersChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-cog"></i>}
            onClick={handleSettings}>
            Settings
            <Switch
              onChange={handleSettings}
              checked={settingsChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-chart-bar"></i>}
            onClick={handlePerformance}>
            Performance
            <Switch
              onChange={handlePerformance}
              checked={performanceChecked}
              className="react-switch"
            />
          </DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownNavigationBar;