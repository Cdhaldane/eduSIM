import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import Switch from "react-switch"
import Button from "../Buttons/Button"


import "./Dropdown.css";


  function Dropdowninfo(props) {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [checked, setChecked] = useState(false);
    const dropdownRef = useRef(null);
    const [ptype, setType] = useState([]);
    const [numpages, setNumpages ] = useState();

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight)
  }, [])

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function handleType(e){
    props.ptype(e.target.value);
  }

  function handleNum(e){
    console.log(e)
    props.num(e.target.value);
  }

  function DropdownItem(props) {
    return (
      <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
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
            <DropdownItem
              leftIcon={<i id="icons" class="fab fa-critical-role"></i>}
              rightIcon={""}
              goToMenu="roles">
              Roles
            </DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'roles'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<i id="icons" class="fas fa-arrow-left"></i>}>
            <h2>Roles!</h2>
          </DropdownItem>
          <DropdownItem  onClick="" leftIcon={<i id="icons" class="fas fa-atom" onClick=""></i>}>The Scientist</DropdownItem>
          <DropdownItem  onClick="" leftIcon={<i id="icons" class="fas fa-cogs" onClick=""></i>}>The Engineer</DropdownItem>
          <DropdownItem  onClick="" leftIcon={<i id="icons" class="fas fa-balance-scale" onClick=""></i>}>The Politician</DropdownItem>
          <DropdownItem  onClick="" leftIcon={<i id="icons" class="fas fa-user-plus" onClick=""></i>}>Add a role</DropdownItem>




        </div>
      </CSSTransition>
    </div>
  );
}

export default Dropdowninfo;
