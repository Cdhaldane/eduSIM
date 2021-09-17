import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios"

import "./Dropdown.css";

const DropdownRoles = (props) => {

  const PLACEHOLDER_TEXT = "Select Role!";

  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [emptyRoleName, setEmptyRoleName] = useState(false);
  const [sameRoleName, setSameRoleName] = useState(false);

  const menuElem = useRef(null);

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
        });
      }
      setRoles(rolesData);
    }).catch(error => {
      console.log(error);
    });
  }

  const handleClickOutside = e => {
    if (!menuElem.current.contains(e.target)) {
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
            <div className="menu-item" onClick={(e) => handleRoleSelected(e, role.roleName)} key={index}>
              <span className="icon-button">
                <i id="icons" className="fa fa-trash" onClick={() => handleDeleteRole(index)} />
              </span>
              {role.roleName}
            </div>
          );
        })}
      </div>
    );
  }

  const handleRoleSelected = (e, roleName) => {
    if (e.target.tagName.toLowerCase() !== "i") {
      setSelectedRole(roleName);
      props.roleLevel(roleName);
    }
  }

  const handleRoleChange = (e) => {
    setRoleName(e.target.value);
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
    let data = {
      gameinstanceid: props.gameid,
      gamerole: roleName
    };

    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/createRole', data).then((res) => {
      updateRolesData();
      setRoleName("");
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
            icon={<i id="icons" className="fab fa-critical-role"></i>}>
            {selectedRole || PLACEHOLDER_TEXT}
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
            icon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>{selectedRole || PLACEHOLDER_TEXT}</h2>
          </DropdownItem>
          <AvailableRoles />
          <div className="menu-item">
            <span className="icon-button" onClick={handleAddRole}>
              <i id="icons" className="fas fa-plus" />
            </span>
            <input className="role-name-input2" type="text" placeholder="New Role Name" onChange={handleRoleChange} value={roleName} />
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownRoles;
