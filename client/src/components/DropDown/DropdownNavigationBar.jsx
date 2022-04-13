import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import Switch from "react-switch";
import DropdownItem from "./DropdownItem";
import { useTranslation } from "react-i18next";

import "./Dropdown.css";

import Message from "../../../public/icons/chat-alt-7.svg"
import Bell from "../../../public/icons/bell-alt-1.svg"
import Graph from "../../../public/icons/graph.svg"
import Cog from "../../../public/icons/cog.svg"

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
    <div className="dropdown nav" style={{ height: menuHeight }} ref={dropdownRef}>
      <CSSTransition
        in={true}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <h1>{t("sidebar.editNavigationBar")}</h1>
          <DropdownItem
            leftIcon={<i><Message className="icon nav-icons"/></i>}
            onClick={handleMessage}>
            {t("sidebar.messaging")}
            <Switch
              onChange={handleMessage}
              checked={messagesChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Bell className="icon nav-icons"/></i>}
            onClick={handleAlerts}>
            {t("sidebar.alerts")}
            <Switch
              onChange={handleAlerts}
              checked={alertsChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Graph className="icon nav-icons"/></i>}
            onClick={handlePerformance}>
            {t("sidebar.performance")}
            <Switch
              onChange={handlePerformance}
              checked={performanceChecked}
              className="react-switch"
            />
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Cog className="icon nav-icons"/></i>}
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
