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
    const [rolename, setRolename] = useState("")
    const [selectedRole, setSelectedRole] = useState("Select Role!");
    const [roles, setRoles] = useState([
      {
        role: "The Scientist"
      } ,
      {
        role: "The Engineer"
      }
    ])

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
  function DropdownItems(props) {
    console.log(selectedRole)
    return (
      <a href="#" className="menu-item" onClick={() => handleRole(props.value)}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }
  function handleRole(e){
    setSelectedRole(e)
    props.roleLevel(e)
  }
  function handleAddRole(){
    console.log(rolename)
    setRoles([...roles, {role: rolename}])
  }
  function handleRoleChange(e){
    setRolename(e.target.value)
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
              {selectedRole}
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
            <h2>{selectedRole}</h2>
          </DropdownItem>
          {roles.map((index) => {
            return(
              <DropdownItems onClick="" value={index.role} leftIcon={<i id="icons" class="fas fa-atom" onClick=""></i>}>{index.role}</DropdownItems>
            )
          })}
          <DropdownItem goToMenu="addrole" leftIcon={<i id="icons" class="fas fa-plus"></i>}>
            Add Role
          </DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
       in={activeMenu === 'addrole'}
       timeout={500}
       classNames="menu-primary"
       unmountOnExit
       onEnter={calcHeight}>
       <div className="menu">
         <DropdownItem goToMenu="roles" leftIcon={<i id="icons" class="fas fa-arrow-left"></i>}>
           <h2>ROLES!</h2>
         </DropdownItem>
         <DropdownItem
           leftIcon={<i id="icons" class="fas fa-plus"
           onClick={handleAddRole}></i>}>
       </DropdownItem>
         <input id="rolenameinput" type="text" placeholder="Role Name!" onChange={handleRoleChange} value={rolename} />
       </div>
     </CSSTransition>
    </div>
  );
}

export default Dropdowninfo;
