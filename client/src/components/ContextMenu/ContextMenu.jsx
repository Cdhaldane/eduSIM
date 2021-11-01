import React, { useState, useEffect, useRef } from "react";
import DropdownEditObject from "../Dropdown/DropdownEditObject";

import "./ContextMenu.css"

const ContextMenu = (props) => {
  const [drop, setDrop] = useState(false);
  const [editModalLeft, setEditModalLeft] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const menu = useRef();

  const setContextMenuTitle = () => {
    if (props.selectedShapeName.startsWith("text")) {
      setEditTitle("Edit Text");
    } else if (props.selectedShapeName.startsWith("poll")) {
      setEditTitle("Edit Poll");
    } else if (props.selectedShapeName.startsWith("connect4")) {
      setEditTitle("Edit Connect4");
    } else if (props.selectedShapeName.startsWith("tic")) {
      setEditTitle("Edit TicTacToe");
    } else {
      setEditTitle("Edit Shape");
    }
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
    document.addEventListener('contextmenu', handleRightClick);

    setEditModalLeft(calcOutOfBounds(props.position.x, props.position.y).left);
    setContextMenuTitle();

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

  const handleEdit = () => {
    setDrop(!drop);
  }

  const handleGrouping = () => {
    props.handleGrouping();
    props.close();
  }

  const handleUngrouping = () => {
    props.handleUngrouping();
    props.close();
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
            setJson={props.setJson}
            setName={props.setName}
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
          />
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
