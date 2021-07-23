import React, { useState, useEffect, useRef } from 'react';
import Note from "../Note/Note";
import { CSSTransition } from 'react-transition-group';
import Switch from "react-switch"
import NavLinksGroup from "../SideBar/NavLinksGroup"

import "./Dropdown.css";

  function DropdownNav(props) {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [checked1, setChecked1] = useState(true);
    const [checked2, setChecked2] = useState(true);
    const [checked3, setChecked3] = useState(true);
    const [checked4, setChecked4] = useState(true);
    const [checked5, setChecked5] = useState(true);
    const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight)
  }, [])

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }


  function DropdownItem(props) {
    return (
      <a href="#" className="menu-item" onClick={props.onClick}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }

  function handleMessage(){
    setChecked1(!checked1)
    props.mvisible(!checked1);
  }

  function handleAlerts(){
    setChecked2(!checked2)
    props.avisible(!checked2);
  }

  function handleParameters(){
    setChecked3(!checked3)
    props.pavisible(!checked3);
  }

  function handleSettings(){
    setChecked4(!checked4)
    props.svisible(!checked4);
  }

  function handlePerformance(){
    setChecked5(!checked5)
    props.pevisible(!checked5);
  }


 return (
     <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
       <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <h1>Edit Navigation Bar</h1>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-comment-dots"></i>}
            onClick={handleMessage}
            >
            Messaging
          </DropdownItem>
          <label id="switch1">
          <Switch
            onChange={handleMessage}
            checked={checked1}
            className="react-switch"
          />
        </label>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-bell"></i>}
            rightIcon=""
            onClick={handleAlerts}>
            Alerts
          </DropdownItem>
          <label id="switch2">
          <Switch
            onChange={handleAlerts}
            checked={checked2}
            className="react-switch"
          />
        </label>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-sliders-h"></i>}
            rightIcon=""
            onClick={handleParameters}>
            Parameters
          </DropdownItem>
          <label id="switch3">
          <Switch
            onChange={handleParameters}
            checked={checked3}
            className="react-switch"
          />
        </label>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-cog"></i>}
            rightIcon=""
            onClick={handleSettings}>
            Settings
          </DropdownItem>
          <label id="switch4">
          <Switch
            onChange={handleSettings}
            checked={checked4}
            className="react-switch"
          />
        </label>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-chart-bar"></i>}
            rightIcon=""
            onClick={handlePerformance}>
            Performance
          </DropdownItem>
          <label id="switch5">
          <Switch
            onChange={handlePerformance}
            checked={checked5}
            className="react-switch"
          />
        </label>


        </div>
      </CSSTransition>

    </div>
  );
}

export default DropdownNav;
