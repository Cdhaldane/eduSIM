import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios"

import "./Dropdown.css";

function DropdownRoles(props) {
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);
  const [rolename, setRolename] = useState("");
  const [selectedRole, setSelectedRole] = useState("Select Role!");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight);
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
        gameinstanceid: props.gameid,
      }
    }).then((res) => {
      const allData = res.data;
      const stuff = [];
      for (let i = 0; i < allData.length; i++) {
        stuff.push({
          gameroleid: res.data[i].gameroleid,
          index: i,
          role: res.data[i].gamerole,
        });
        setRoles(stuff);
      }
    }).catch(error => {
      console.log(error);
    });
  }, [props]);

  function updateGameRoles() {
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
        gameinstanceid: props.gameid,
      }
    }).then((res) => {
      const allData = res.data;
      const stuff = [];
      for (let i = 0; i < allData.length; i++) {
        stuff.push({
          gameroleid: res.data[i].gameroleid,
          index: i,
          role: res.data[i].gamerole,
        });
        setRoles(stuff);
      }
    }).catch(error => {
      console.log(error);
    });
  }

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
    return (
      <a href="#" className="menu-item" onClick={props.onClack}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }

  function handleRole(e) {
    setSelectedRole(e);
    props.roleLevel(e);
  }

  function handleAddRole() {
    let data = {
      gameinstanceid: props.gameid,
      gamerole: rolename
    };

    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/createRole', data).then((res) => {
      updateGameRoles();
    }).catch(error => {
      console.log(error);
    });
  }

  function handleRoleChange(e) {
    setRolename(e.target.value);
  }

  function handleDelete(e) {
    axios.delete(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/deleteRole/:gameroleid', {
      params: {
        id: roles[e].gameroleid
      }
    }).then((res) => {
      setSelectedRole("Select Role!");
      props.roleLevel("Select Role!");
    }).catch(error => {
      console.log(error);
    });

    delete roles[e];
  }

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        className="menu-primary"
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
        className="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<i id="icons" class="fas fa-arrow-left"></i>}>
            <h2>{selectedRole}</h2>
          </DropdownItem>
          {roles.map((index) => {
            return (
              <DropdownItems onClick={() => handleRole(index.role)} value={index.index} leftIcon={<i id="icons" class="fa fa-trash" onClick={() => handleDelete(index.index)}></i>}>{index.role}</DropdownItems>
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
              onClick={handleAddRole}
            ></i>}
            goToMenu="main">

          </DropdownItem>
          <input id="rolenameinput" type="text" placeholder="Role Name!" onChange={handleRoleChange} value={rolename} />
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownRoles;
