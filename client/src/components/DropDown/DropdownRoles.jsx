import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios";
import { useAlertContext } from "../Alerts/AlertContext";

import "./Dropdown.css";

const DropdownRoles = (props) => {

  const PLACEHOLDER_TEXT = "Select Role";

  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleNum, setRoleNum] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);

  const alertContext = useAlertContext();

  const menuElem = useRef();

  const updateRolesData = () => {
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
        gameinstanceid: props.gameid,
      }
    }).then((res) => {
      const rolesData = [];
      for (let i = 0; i < res.data.length; i++) {
        rolesData.push({
          id: res.data[i].gameroleid,
          roleName: res.data[i].gamerole,
          numOfSpots: res.data[i].numspots
        });
      }
      setRoles(rolesData);
    }).catch(error => {
      console.log(error);
    });
  }

  const handleClickOutside = e => {
    if (menuElem.current && !menuElem.current.contains(e.target)) {
      handleActiveMenuChange('main');
    }
  }

  useEffect(() => {
    updateRolesData();

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    calcHeight(menuElem.current?.firstChild);
    if (!roles.some(role => role.roleName === selectedRole)) {
      setSelectedRole(null);
    }
  }, [roles]);

  const calcHeight = (el) => {
    let height = el.offsetHeight;
    setMenuHeight(height);
  }

  const handleActiveMenuChange = (newMenu) => {
    if (newMenu !== "main") {
      if (props.openInfoSection) {
        props.openInfoSection();
      }
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    setActiveMenu(newMenu);
  }

  const DropdownItem = (props) => {
    return (
      <div className="menu-item" onClick={() => props.goToMenu && handleActiveMenuChange(props.goToMenu)}>
        <span className="icon-button">{props.icon}</span>
        {props.children}
      </div>
    );
  }

  const AvailableRoles = () => {
    return (
      <div>
        {roles.map((role, index) => {
          return (
            props.editMode ? (
              <div 
                className="menu-item" 
                onClick={(e) => handleRoleSelected(e, role.roleName, role.numOfSpots)} 
                key={index}
              >
                <span className="icon-button">
                  <i className="icons fa fa-trash" onClick={() => handleDeleteRole(index)} />
                </span>
                {`${role.roleName} (${role.numOfSpots})`}
              </div>
            ) : (
              <div 
                className="menu-item" 
                onClick={(e) => handleRoleSelected(e, role.roleName, role.numOfSpots)} 
                key={index}
                disabled={props.rolesTaken[role.roleName] && props.rolesTaken[role.roleName] === role.numOfSpots}
              >
                {props.rolesTaken[role.roleName] 
                ? `${role.roleName} (${role.numOfSpots}, ${props.rolesTaken[role.roleName]} ingame)`
                : `${role.roleName} (${role.numOfSpots})`}
              </div>
            )
          );
        })}
      </div>
    );
  }

  const handleRoleSelected = (e, roleName, roleNum) => {
    if (e.target.tagName.toLowerCase() !== "i") {
      setSelectedRole(roleName);
      props.roleLevel(roleName, roleNum);
    }
  }

  const handleRoleNameChange = (e) => {
    setRoleName(e.target.value);
  }

  const handleRoleNumChange = (e) => {
    setRoleNum(e.target.value);
  }

  const handleDeselectRole = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRole("");
    props.roleLevel(null, null);
    return false;
  }

  const handleDeleteRole = async (e) => {
    await axios.delete(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/deleteRole/:gameroleid', {
      params: {
        id: roles[e].id
      }
    }).then((res) => {
      props.roleLevel(PLACEHOLDER_TEXT);
      updateRolesData();
    }).catch(error => {
      console.log(error);
    });
  }

  const handleAddRole = () => {
    // Check if name is empty or a duplicate
    if (roleName.trim() === "") {
      alertContext.showAlert("Role name cannot be empty.", "warning");
      return;
    }
    if (roles.some(role => role.roleName === roleName.trim())) {
      alertContext.showAlert("A role with this name already exists. Please pick a new name.", "warning");
      return;
    }
    // Check if number value is valid (is an integer)
    if (roleNum === null || !/^\d+$/.test(roleNum)) {
      alertContext.showAlert("Role quantity must be an integer.", "warning");
      return;
    }

    let data = {
      gameinstanceid: props.gameid,
      gamerole: roleName.trim(),
      numspots: parseInt(roleNum)
    };

    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/createRole', data).then((res) => {
      updateRolesData();
      setRoleName("");
      setRoleNum("");
    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={menuElem}>
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            goToMenu="roles"
            icon={<i className="icons fab fa-critical-role"></i>}>
            {selectedRole || PLACEHOLDER_TEXT}
            {selectedRole && (
              <button className="role-deselect-icon" onClick={handleDeselectRole}>
                <i className="fa fa-times-circle"></i>
              </button>
            )}
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
          <DropdownItem
            goToMenu="main"
            icon={<i className="icons fas fa-arrow-left"></i>}>
            <h2>{selectedRole || PLACEHOLDER_TEXT}</h2>
          </DropdownItem>
          <AvailableRoles />
          {props.editMode && (
            <div className="menu-item">
              <span className="icon-button" onClick={handleAddRole}>
                <i className="icons fas fa-plus" />
              </span>
              <input
                id="roleNameAdd"
                className="add-dropdown-item-input"
                type="text"
                placeholder="New Role Name"
                onChange={handleRoleNameChange}
                value={roleName} />
              <input
                id="roleNumAdd"
                className="add-dropdown-item-input"
                type="text"
                placeholder="#"
                maxLength="3"
                onChange={handleRoleNumChange}
                value={roleNum} />
            </div>
          )}
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownRoles;
