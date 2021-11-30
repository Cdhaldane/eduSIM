import React, { useState, useEffect, useRef, useCallback } from "react";
import debounce from 'lodash.debounce';
import DropdownEditObject from "../Dropdown/DropdownEditObject";

import "./ContextMenu.css"

const ContextMenu = (props) => {
  const [drop, setDrop] = useState(false);
  const [conditions, setConditions] = useState(props.getObjState()?.conditions || {});
  const [conditionsVisible, setConditionsVisible] = useState(false);
  const [editModalLeft, setEditModalLeft] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const menu = useRef();

  const setContextMenuTitle = () => {
    let set = false;
    [
      ["text",      "Edit Text"],
      ["poll",      "Edit Poll"],
      ["connect4",  "Edit Connect4"],
      ["tic",       "Edit TicTacToe"],
      ["html",      "Edit HTML"],
      ["input",    "Edit Input"]
    ].forEach(([key, text]) => {
      if (props.selectedShapeName.startsWith(key)) {
        set = true;
        setEditTitle(text);
      }
    })
    if (!set) setEditTitle("Edit Shape");
  }

  const handleClickOutside = e => {
    if (menu.current && !menu.current.contains(e.target)) {
      props.close();
    }
  };

  const calcOutOfBounds = (x, y) => {
    const dropHeight = menu.current ? menu.current.clientHeight : 235;
    const dropWidth = menu.current ? menu.current.clientWidth : 155;
    const editModalWidth = 400;
    const paddingPx = 7;
    const screenH = window.innerHeight - paddingPx;
    const screenW = window.innerWidth - paddingPx;

    let transformX = (x + dropWidth) - screenW;
    if (transformX < 0) {
      transformX = 0;
    }
    let transformY = (y + dropHeight) - screenH;
    if (transformY < 0) {
      transformY = 0;
    }
    let left = false;
    if (screenW - (x + dropWidth + editModalWidth) < 0 && menu.current) {
      left = true;
    }

    return {
      x: transformX,
      y: transformY,
      left: left
    }
  }
  const [offsetX, setOffsetX] = useState(-calcOutOfBounds(props.position.x, props.position.y).x);
  const [offsetY, setOffsetY] = useState(-calcOutOfBounds(props.position.x, props.position.y).y);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('contextmenu', handleRightClick);

    setEditModalLeft(calcOutOfBounds(props.position.x, props.position.y).left);
    setContextMenuTitle();

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('contextmenu', handleRightClick);
    }
  }, []);

  const handleRightClick = (e) => {
    setDrop(false);

    const offset = calcOutOfBounds(e.clientX, e.clientY);
    setOffsetX(-offset.x);
    setOffsetY(-offset.y);
    setEditModalLeft(offset.left);
  }

  const handleEdit = () => {
    setDrop(!drop);
    if (conditionsVisible) {
      props.updateObjState({
        conditions
      });
    }
    setConditionsVisible(false);
  }
  const handleConditionsVisible = () => {
    setDrop(false);
    if (conditionsVisible) {
      props.updateObjState({
        conditions
      });
    }
    setConditionsVisible(!conditionsVisible);
  }

  const handleGrouping = () => {
    props.handleGrouping();
    props.close();
  }

  const handleUngrouping = () => {
    props.handleUngrouping();
    props.close();
  }

  const debounceObjState = useCallback(
		debounce(state => props.updateObjState(state), 100),
		[], // will be created only once initially
	);

  const handleUpdateConditions = (key, value) => {
    setConditions(old => ({
      ...old,
      [key]: value ? value : undefined
    }))
    debounceObjState({ conditions: {
      ...conditions,
      [key]: value ? value : undefined
    }});
  }

  return (
    <div
      ref={menu}
      className="cmenu"
      style={{
        width: "155px",
        left: props.position.x + offsetX,
        top: props.position.y + offsetY
      }}
    >
      <ul>
        <li onClick={props.cut}>Cut</li>
        <li onClick={props.copy}>Copy</li>
        <li onClick={props.paste}>Paste</li>
        <li onClick={props.delete}>Delete</li>
        {!props.addGroup && !props.unGroup && (
          <li onClick={handleConditionsVisible}>Change Conditions</li>
        )}
        {!props.addGroup && !props.unGroup && (
          <li onClick={handleEdit}>{editTitle}</li>
        )}
        {props.addGroup && (
          <li onClick={handleGrouping}>Group Objects</li>
        )}
        {props.unGroup && (
          <li onClick={handleUngrouping}>Ungroup Objects</li>
        )}
      </ul>

      {drop && (
        <div className="drop">
          <DropdownEditObject
            setPollData={props.setPollData}
            top={menu.current.offsetTop}
            title={editTitle}
            handleFillColor={props.handleFillColor}
            handleStrokeColor={props.handleStrokeColor}
            handleWidth={props.handleWidth}
            handleOpacity={props.handleOpacity}
            handleSize={props.handleSize}
            handleFont={props.handleFont}
            font={props.selectedFont}
            left={editModalLeft}
            close={props.close}
            selectedShapeName={props.selectedShapeName}
            getObj={props.getObj}
            getObjState={props.getObjState}
            updateObjState={props.updateObjState}
          />
        </div>
      )}
      {conditionsVisible && (
        <div className="drop">
          <div 
            className="dropdownedit conditionsedit"
            style={{
              ...(editModalLeft ? { right: "110px" } : { left: "160px" }),
            }}
          >
            <p>Only display this if...</p>
            <input 
              type="text" 
              placeholder="Variable name" 
              value={conditions?.varName || ""} 
              onChange={(e) => handleUpdateConditions("varName", e.target.value)} 
            />
            <select 
              name="inputtype"
              value={conditions?.condition} 
              onChange={(e) => handleUpdateConditions("condition", e.target.value)} 
            >
              <option value="positive">contains a positive value</option>
              <option value="negative">contains a negative/null value</option>
              <option value="isgreater">is greater than</option>
              <option value="isless">is less than</option>
              <option value="isequal">is equal to</option>
              <option value="between">is between</option>
              <option value="onchange">changes</option>
            </select>
            {conditions?.condition?.startsWith('is') && (
              <input 
                type="text" 
                placeholder="Value to check against" 
                value={conditions?.trueValue || ""} 
                onChange={(e) => handleUpdateConditions("trueValue", e.target.value)} 
              />
            )}
            {conditions?.condition == 'between' && (
              <div className="conditionsbetween">
                <input 
                  type="text" 
                  placeholder="Min" 
                  value={conditions?.trueValue || ""} 
                  onChange={(e) => handleUpdateConditions("trueValue", e.target.value)} 
                />
                <p>and</p>
                <input 
                  type="text" 
                  placeholder="Max" 
                  value={conditions?.trueValueAlt || ""} 
                  onChange={(e) => handleUpdateConditions("trueValueAlt", e.target.value)} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
