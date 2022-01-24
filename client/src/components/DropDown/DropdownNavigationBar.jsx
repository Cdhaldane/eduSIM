import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import Switch from "react-switch";
import DropdownItem from "./DropdownItem";
import { useTranslation } from "react-i18next";

import "./Dropdown.css";

const DropdownNavigationBar = (props) => {
  const { t } = useTranslation();

  const [menuHeight, setMenuHeight] = useState(null);
  const [messagesChecked, setMessagesChecked] = useState(true);
  const [alertsChecked, setAlertsChecked] = useState(true);
  const [settingsChecked, setSettingsChecked] = useState(true);
  const [performanceChecked, setPerformanceChecked] = useState(true);
  const dropdownRef = useRef();

  const handleClickOutside = e => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      props.close();
    }
  }

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight);

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
          <h1>{t("sidebar.editNavigationBar")}</h1>
          <DropdownItem
            leftIcon={<i className="icons lni lni-comments-reply"></i>}
            onClick={handleMessage}>
            {t("sidebar.messaging")}
            <Switch
              onChange={handleMessage}
              checked={messagesChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-alarm"></i>}
            onClick={handleAlerts}>
            {t("sidebar.alerts")}
            <Switch
              onChange={handleAlerts}
              checked={alertsChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-stats-up"></i>}
            onClick={handlePerformance}>
            {t("sidebar.performance")}
            <Switch
              onChange={handlePerformance}
              checked={performanceChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-cog"></i>}
            onClick={handleSettings}>
            {t("sidebar.settings")}
            <Switch
              onChange={handleSettings}
              checked={settingsChecked}
              className="react-switch"
            />
          </DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownNavigationBar;
