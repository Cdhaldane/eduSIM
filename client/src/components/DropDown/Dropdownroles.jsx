import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios"

import "./Dropdown.css";

  function Dropdowninfo(props) {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const dropdownRef = useRef(null);
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
    console.log(props)
    // setRoles(props.gameroles)
  }, [])


  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
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
    let data = {
      gameinstanceid: localStorage.adminid,
      gamerole: rolename
    }
      axios.post('http://localhost:5000/api/gameroles/createRole', data)
         .then((res) => {
            console.log(res)
           })
          .catch(error => console.log(error.response));
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
