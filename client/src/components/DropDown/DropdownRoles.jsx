import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios";
import ConfirmationModal from "../Modal/ConfirmationModal";
import { useAlertContext } from "../Alerts/AlertContext";
import MultiLevel from './Multilevel';
import { useTranslation } from "react-i18next";

import "./Dropdown.css";
import Crown from "../../../public/icons/crown.svg"
import Trash from "../../../public/icons/trash-can-alt-2.svg"
import Check from "../../../public/icons/checkmark.svg"
import Copy from "../../../public/icons/copy.svg"
import Pencil from "../../../public/icons/pencil.svg"
import Add from "../../../public/icons/plus.svg"
import Left from "../../../public/icons/arrow-left.svg"
import Card from "../../../public/icons/id-card.svg"

const DropdownRoles = (props) => {
  const { t } = useTranslation();

  const PLACEHOLDER_TEXT = props.disabled ? t("game.noRoleTeacherAssigned") : t("game.selectRole");

  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleNum, setRoleNum] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleDesc, setRoleDesc] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [isCopyingRole, setIsCopyingRole] = useState(false);
  const [copyRole, setCopyRole] = useState(null);
  const [copyTo, setCopyTo] = useState(null);
  const [modifyIndex, setModifyIndex] = useState(-1);
  const [selected, setSelected] = useState(-1)
  const [description, setDescription] = useState(false);
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



  const handleClickOutside = e => {
    let menuRef = document.getElementsByClassName('personalAreaStageContainer')[0];
    let roleRef = document.getElementById('dropdown');
    // if (menuRef?.contains(e.target)) {
    //   setActiveMenu('main');
    //   setModifyIndex(-1);
    // }
  }


  useEffect(() => {
    updateRolesData();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [props.gameid, props.roles]);

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
    }
    setActiveMenu(newMenu);
  }

  const handleModifyRole = (e, index) => {
    e.stopPropagation();
    setModifyIndex(index);
    setSelected(index)
    setRoleName(roles[index].roleName);
    setRoleNum(roles[index].numOfSpots);
  }

  const DropdownItem = (item) => {
    return (
      <div className="menu-item">
        <div className="menu-item-container" onClick={() => handleActiveMenuChange(item.goToMenu)}>
          <span className="icon-button">{item.icon}</span>
          {item.children}
        </div>
        {(item.desc &&
          <div className="dropdown-desc">
            {selectedRole && !props.disabled && (
              <button className={props.editMode ? "role-deselect-icon" : "role-deselect-icon gamemode"} onClick={() => setActiveMenu('edit')}>
                <i onClick={() => props.editMode ? props.openInfoSection() : setDescription(!description)}><Card className="icon roles-icons card" /></i>
              </button>
            )}
          </div>)}
      </div>
    );
  }

  const handleRoleNameChange = (e) => {
    setRoleName(e.target.value);
  }

  const handleRoleNumChange = (e) => {
    setRoleNum(e.target.value);
  }
  useEffect(() => {
    if (props.initRole && !props.random) {
      setSelectedRole(props.initRole.name);
    }
  }, [props.initRole]);

  const handleRoleSelected = (e, roleName, roleNum, index) => {
    if (menuElem.current.contains(e.target)) {
      setSelected(index)
      setSelectedRole(roleName);
      setRoleDesc(roles[index].roleDesc)
      setActiveMenu('main');
      props.roleLevel(roleName, roleNum, roleDesc);
    }
  }

  const handleDeleteRole = async (e) => {
    props.deleteRoleRect(roles[e].roleName);
    let newRoles = [...roles];
    newRoles.splice(e, 1);
    setRoles(newRoles);
    props.handleSetRoles(newRoles);
    props.handleDeleteRole(roles[e]);
    setSelectedRole()
    setActiveMenu('main')
    setModifyIndex(-1);
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

    let role = {
      roleName: roleName.trim(),
      numOfSpots: parseInt(roleNum),
      roleDesc: roleDesc.trim()
    }
    setRoleName('');
    setRoleNum('');
    setRoleDesc('');
    setModifyIndex(-1);
    setActiveMenu('main')
    setRoles([...roles, role]);
    props.handleSetRoles([...roles, role]);
    props.addNewRoleRect(role.roleName);
  }

  const handleEditSelect = (e) => {
    setRoleDesc(e)
    setRoleName(roles[selected].roleName)
    setRoleNum(roles[selected].numOfSpots)
  }

  const handleSubmitModification = () => {
    let role = {
      roleName: roleName,
      numOfSpots: roleNum,
      roleDesc: roleDesc
    }
    if (role.roleName.trim() === roles[selected].roleName && role.numOfSpots === roles[selected].numOfSpots && role.roleDesc.trim() === roles[selected].roleDesc) {
      setRoleName('');
      setRoleNum('');
      setRoleDesc('');
      setModifyIndex(-1);
      setActiveMenu('main')
      return;
    }
    let newRoles = [...roles];
    newRoles[selected] = role;
    setRoles(newRoles);
    props.handleSetRoles(newRoles);

    if (role.roleName.trim() !== roles[selected].roleName) {
      props.renameRoleRect(roles[selected].roleName, roleName);
      props.roleLevel(roleName, roleNum, roleDesc);
      props.handleEditShapes(roles[selected].roleName, role.roleName)
      setSelectedRole(roleName);
    }

    setRoleName('');
    setRoleNum('');
    setRoleDesc('');
    setModifyIndex(-1);
    setActiveMenu('main')
  }

  const updateRolesData = () => {
    let currRoles = props.roles;
    if (currRoles.length === 0) {
      currRoles.push({
        roleName: t("game.defaultRole"),
        numOfSpots: -1,
        roleDesc: 'Default Role'
      })
      if (props.editMode) {
        props.addNewRoleRect(currRoles[0].roleName);
      }
    }

    setRoles(currRoles);
  }

  const handleChange = (data) => {
    setCopyTo(data.value[0] + 1)
  }
  const handleCopying = (e, role) => {
    e.stopPropagation();
    setIsCopyingRole(true);
    setActiveMenu('copy')
    setCopyRole(role)
  }
  const handleCopyRole = async () => {
    props.handleCopyRole(copyRole, copyTo);
  };

  const AvailableRoles = (
    <div className="roles-container">
      {roles.map((role, index) => {
        return (
          props.editMode ? (
            modifyIndex === index ? (
              <div
                className="menu-item"
                key={index}
              >
                <span className="icon-button" onClick={() => handleSubmitModification(index)}>
                  <i><Check className="icon roles-icons" /></i>
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
                <span className="icon-button" onClick={() => {
                  setConfirmationModal(true);
                  setDeleteIndex(index);
                }} >
                  <i><Trash className="icon roles-icons" /></i>
                </span>
                <h1>
                  {role.roleName}
                  {role.numOfSpots !== -1 && ` (${role.numOfSpots})`}
                </h1>
                <div className="icons-right">
                  <span className="icon-button" onClick={(e) => handleModifyRole(e, index)}>

                    <i><Pencil className="icon roles-icons" /></i>

                  </span>
                  <span className="icon-button" onClick={(e) => handleCopying(e, role)}>
                    <i><Copy className="icon roles-icons" /></i>
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

  const processData = () => {
    let data = props?.pages?.map((page, i) => ({ [page.name]: i }));

    if (props.level - 1 >= 0 && props.level - 1 < data.length) {
      data.splice(props.level - 1, 1);
    }

    return data;
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
            desc={true}
            goToMenu="roles"
            icon={<i><Crown className="icon roles-icons" /></i>}>
            {props.random ? "Random" : selectedRole || PLACEHOLDER_TEXT}
          </DropdownItem>

        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'copy'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            goToMenu="main"
            icon={<i><Left className="icon roles-icons" /></i>}>
            <h2 className="menu-copy">Copying {copyRole?.roleName}</h2>
          </DropdownItem>
          <div className='menu-copy-title'>
            <h2>Select page</h2>
            <MultiLevel
              data={processData()}
              handleChange={handleChange}
              baseValue={copyRole?.roleName}
              className={'roles-multilevel'}
            />
          </div>
          <button className="menu-copy-submit" onClick={handleCopyRole}>Submit</button>
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
            icon={<i><Left className="icon roles-icons" /></i>}>
            <h2 className="smaller">{props.editmode ? "Add Role Description" : "Role Description"}</h2>
          </DropdownItem>
          {props.editMode
            ? <> <textarea
              wrap="soft"
              value={roleDesc}
              onChange={e => handleEditSelect(e.target.value)}
              className="role-desc"

            />
              <button className="menu-copy-submit" onClick={handleSubmitModification}>Submit</button></>
            : <textarea
              readOnly
              wrap="soft"
              value={roleDesc}
              onChange={e => handleEditSelect(e.target.value)}
              className="role-desc"
              disabled="yes"
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
            icon={<i><Left className="icon roles-icons" /></i>}>
            <h2>{selectedRole || PLACEHOLDER_TEXT}</h2>
          </DropdownItem>
          {AvailableRoles}
          {props.editMode && (
            <div className="menu-item" disabled={modifyIndex >= 0}>
              <span className="icon-button" onClick={handleAddRole}>
                <i><Add className="icon roles-icons" /></i>
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
