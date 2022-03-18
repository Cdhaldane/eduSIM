import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios";
import ConfirmationModal from "../Modal/ConfirmationModal";
import { useAlertContext } from "../Alerts/AlertContext";

import { v4 as uuidv4 } from 'uuid';

import { useTranslation } from "react-i18next";

import "./Dropdown.css";

const DropdownRoles = (props) => {
  const { t } = useTranslation();

  const PLACEHOLDER_TEXT = props.disabled ? t("game.noRoleTeacherAssigned") : t("game.selectRole");

  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleNum, setRoleNum] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [modifyIndex, setModifyIndex] = useState(-1);
  const [selected, setSelected] = useState(-1)

  const alertContext = useAlertContext();

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }

  const menuElem = useRef();

  useEffect(() => {
    if (props.refreshPersonalCanvas && props.personalAreaOpen) props.refreshPersonalCanvas();
  }, [selectedRole]);

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
          numOfSpots: res.data[i].numspots,
          roleDesc: res.data[i].roleDesc
        });
      }
      if (rolesData.length) {
        setRoles(rolesData);
      } else {
        const defaultRoleAPI = {
          gameinstanceid: props.gameid,
          gamerole: t("game.defaultRole"),
          numspots: -1,
          roleDesc: "Default role",
        };
        axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/createRole', defaultRoleAPI).then((res) => {
          setRoles([{
            id: res.data.gameroleid,
            roleName: t("game.defaultRole"),
            numOfSpots: -1,
            roleDesc: res.data.roleDesc,
          }]);
        }).catch(error => {
          console.error(error);
        });
      }
    }).catch(error => {
      console.error(error);
    });

  }

  const handleClickOutside = e => {
    if (menuElem.current &&
      !menuElem.current.contains(e.target) &&
      !e.target.className.startsWith("icon") &&
      !confirmationVisibleRef.current &&
      activeMenu != 'main') {
      handleActiveMenuChange('main');
      setModifyIndex(-1);
    }
  }

  useEffect(() => {
    updateRolesData();

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    calcHeight(menuElem.current?.firstChild);
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

  const handleModifyRole = (e, index) => {
    setModifyIndex(index);
    setRoleName(roles[index].roleName);
    setRoleNum(roles[index].numOfSpots);
  }

  const handleSubmitModification = async () => {
    console.log(roleDesc)
    await props.handleEditRole({
      id: roles[modifyIndex].id,
      roleName,
      roleNum,
      roleDesc
    });
    setRoles(roles.map((v, i) => i === modifyIndex ? {
      ...v,
      roleName: roleName,
      numOfSpots: roleNum,
      roleDesc: roleDesc
    } : v));
    setSelectedRole(roleName);
    props.roleLevel(roleName, roleNum, roleDesc);
    setRoleName('');
    setRoleNum('');
    setRoleDesc('');
    setModifyIndex(-1);
  }

  const handleCopyRole = async (gameroleid) => {
    const newRole = await props.handleCopyRole(gameroleid);
    setRoles([...roles, {
      id: newRole.gameroleid,
      roleName: newRole.gamerole,
      numOfSpots: newRole.numspots,
      roleDesc: newRole.roleDesc
    }]);
  }

  const DropdownItem = (props) => {
    return (
      <div className="menu-item" onClick={() => props.goToMenu && handleActiveMenuChange(props.goToMenu)}>
        <span className="icon-button">{props.icon}</span>
        {props.children}
      </div>
    );
  }

  const handleRoleNameChange = (e) => {
    setRoleName(e.target.value);
  }

  const handleRoleNumChange = (e) => {
    setRoleNum(e.target.value);
  }

  const AvailableRoles = (
    <div>
      {roles.map((role, index) => {
        return (
          props.editMode ? (
            modifyIndex === index ? (
              <div
                className="menu-item"
                key={index}
              >
                <span className="icon-button" onClick={handleSubmitModification}>
                  <i className="icons lni lni-checkmark" />
                </span>
                <input
                  id="roleNameAdd"
                  className="add-dropdown-item-input"
                  type="text"
                  placeholder={t("edit.newRoleName")}
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
            ) : (
              <div
                className="menu-item"
                onClick={(e) => handleRoleSelected(e, role.roleName, role.numOfSpots, index)}
                key={index}
                disabled={modifyIndex >= 0}
              >
                {index !== 0 && (
                  <span className="icon-button" onClick={() => {
                    setConfirmationModal(true);
                    setDeleteIndex(index);
                  }} >

                    <i className="icons lni lni-trash-can" />

                  </span>
                )}
                {index === 0 && (
                  <span className="icon-button" style={{ backgroundColor: "rgba(0,0,0,0)" }} ><i className="icons lni lni-crown" /></span>
                )}
                {role.roleName}
                {role.numOfSpots !== -1 && ` (${role.numOfSpots})`}
                <div className="icons-right">
                  <span className="icon-button" onClick={(e) => handleModifyRole(e, index)}>

                    <i className="icons lni lni-pencil" />

                  </span>
                  <span className="icon-button" onClick={() => handleCopyRole(role.id)}>
                    <i className="icons lni lni-files" />
                  </span>
                </div>
              </div>
            )
          ) : (
            <div
            className="menu-item"
            onClick={(e) => handleRoleSelected(e, role.roleName, role.numOfSpots, index)}
            key={index}
            disabled={role.numOfSpots !== -1 &&
              props.rolesTaken[role.roleName] &&
              props.rolesTaken[role.roleName] >= role.numOfSpots || role.numOfSpots == 0}
          >
            {role.roleName}
            {role.numOfSpots !== -1 && (props.rolesTaken[role.roleName]
              ? ` (${role.numOfSpots}, ${t("game.xInGame", { count: props.rolesTaken[role.roleName] })})`
              : ` (${role.numOfSpots})`)}
          </div>
          )
        );
      })}
    </div>
  );

  useEffect(() => {
    if (!props.personalAreaOpen) {
      setActiveMenu('main');
    }
  }, [props.personalAreaOpen]);

  useEffect(() => {
    if (props.initRole && !props.random) {
      setSelectedRole(props.initRole.name);
    }
  }, [props.initRole]);

  const handleRoleSelected = (e, roleName, roleNum,index) => {
    console.log(index)
    if (!e.target.className.startsWith("icon")) {
      setSelected(index)
      setSelectedRole(roleName);
      props.roleLevel(roleName, roleNum, roleDesc);
      handleActiveMenuChange('main');
    }
  }

  const handleDeselectRole = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRole(null);
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
      console.error(error);
    });
  }

  const handleAddRole = () => {
    // Check if name is empty or a duplicate
    if (roleName.trim() === "") {
      alertContext.showAlert(t("alert.noRoleName"), "warning");
      return;
    }
    if (roles.some(role => role.roleName === roleName.trim())) {
      alertContext.showAlert(t("alert.roleAlreadyExists"), "warning");
      return;
    }
    // Check if number value is valid (is an integer)
    if (roleNum === null || !/^\d+$/.test(roleNum)) {
      alertContext.showAlert(t("alert.noRoleLimit"), "warning");
      return;
    }

    let data = {
      gameinstanceid: props.gameid,
      gamerole: roleName.trim(),
      numspots: parseInt(roleNum),
      roleDesc: "temp"
    };

    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/createRole', data).then((res) => {
      updateRolesData();
      setRoleName("");
      setRoleNum("");
    }).catch(error => {
      console.error(error);
    });
  }

  const handleEditSelect = (e) => {
    setRoleDesc(e)
  }

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={menuElem} disabled={props.disabled}>
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            goToMenu="roles"
            icon={<i className="icons lni lni-crown"></i>}>
            {props.random ? "Random" : selectedRole || PLACEHOLDER_TEXT}
          </DropdownItem>
          <div className="dropdown-desc">
            {selectedRole && !props.disabled && (
              <button className={props.editMode ? "role-deselect-icon" : "role-deselect-icon gamemode"} onClick={() => setActiveMenu('edit')}>
                <i className="lni lni-license" onClick={() => props.openInfoSection()}></i>
              </button>
            )}
          </div>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'edit'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            goToMenu="main"
            icon={<i className="icons lni lni-arrow-left"></i>}>
            <h2 className="smaller">{props.editmode ? "Add Role Description" : "Role Description"}</h2>
          </DropdownItem>
          {props.editMode
            ? <textarea
              wrap="soft"
              value={roleDesc}
              onChange={e => handleEditSelect(e.target.value)}
              className="role-desc"
              placeholder={roles[1] ? roles[1].roleDesc : ""}
            />
            : <textarea
              readOnly
              wrap="soft"
              value={roleDesc}
              onChange={e => handleEditSelect(e.target.value)}
              className="role-desc"
              placeholder={roles[selected] ? roles[selected].roleDesc : ""}
            />
          }

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
            icon={<i className="icons lni lni-arrow-left"></i>}>
            <h2>{selectedRole || PLACEHOLDER_TEXT}</h2>
          </DropdownItem>
          {AvailableRoles}
          {props.editMode && (
            <div className="menu-item" disabled={modifyIndex >= 0}>
              <span className="icon-button" onClick={handleAddRole}>
                <i className="icons lni lni-plus" />
              </span>
              <input
                id="roleNameAdd"
                className="add-dropdown-item-input"
                type="text"
                placeholder={t("edit.newRoleName")}
                {...(modifyIndex === -1 && {
                  onChange: handleRoleNameChange,
                  value: roleName
                })} />
              <input
                id="roleNumAdd"
                className="add-dropdown-item-input"
                type="text"
                placeholder="#"
                maxLength="3"
                {...(modifyIndex === -1 && {
                  onChange: handleRoleNumChange,
                  value: roleNum
                })} />
            </div>
          )}
        </div>
      </CSSTransition>

      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={() => handleDeleteRole(deleteIndex)}
        confirmMessage={t("edit.deleteRole")}
        message={t("edit.confirmDeleteRole", { name: roles[deleteIndex] ? roles[deleteIndex].roleName : "" })}
      />
    </div>
  );
}

export default DropdownRoles;
