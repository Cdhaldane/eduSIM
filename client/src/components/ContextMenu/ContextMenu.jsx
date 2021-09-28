import React, { useState, useEffect, useRef } from "react";
import DropdownEditObject from "../Dropdown/DropdownEditObject";

import "./ContextMenu.css"

function ContextMenu(props) {
  const [drop, setDrop] = useState(false);
  const [editModalLeft, setEditModalLeft] = useState(false);
  const menu = useRef();

  const handleClickOutside = e => {
    if (menu.current && !menu.current.contains(e.target)) {
      props.close();
    }
  };

  const calcOutOfBounds = (x, y) => {
    const dropHeight = menu.current ? menu.current.clientHeight : 205;
    const dropWidth = menu.current ? menu.current.clientWidth : 155;
    const editModalWidth = 300;
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
    document.addEventListener('contextmenu', handleRightClick);
    
    setEditModalLeft(calcOutOfBounds(props.position.x, props.position.y).left);

    return () => {
      document.removeEventListener('click', handleClickOutside);
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

  function handleEdit() {
    setDrop(!drop);
  }

  function handleColorF(e) {
    props.choosecolorf(e);
  }

  function handleColorS(e) {
    props.choosecolors(e);
  }

  function handleWidth(e) {
    props.handleWidth(e);
  }

  function handleOpacity(e) {
    props.handleOpacity(e);
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
        <li onClick={handleEdit}>{props.editTitle}</li>
      </ul>

      {drop && (
        <div className="drop">
          <DropdownEditObject
            title={props.editTitle}
            choosecolorf={handleColorF}
            choosecolors={handleColorS}
            handleWidth={handleWidth}
            handleOpacity={handleOpacity}
            handleSize={(e) => props.handleSize(e)}
            handleFont={(e) => props.handleFont(e)}
            left={editModalLeft}
          />
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
