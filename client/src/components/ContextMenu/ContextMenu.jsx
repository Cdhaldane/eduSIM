import React, { useState, useEffect, useRef } from "react";
import DropdownEditObject from "../Dropdown/DropdownEditObject";

import "./ContextMenu.css"

function ContextMenu(props) {
  const [drop, setDrop] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(window.matchMedia("(orientation: portrait)").matches ? 0 : 70);
  const menu = useRef();

  const handleClickOutside = e => {
    if (!menu.current.contains(e.target)) {
      props.close();
    }
  };

  useEffect(() => {
    console.log(sidebarWidth);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  function handleColorF(e) {
    props.choosecolorf(e);
  }

  function handleColorS(e) {
    props.choosecolors(e);
  }

  function handleEdit(e) {
    setDrop(!drop);
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
        left: props.position.x + sidebarWidth,
        top: props.position.y
      }}
    >
      <ul>
        <li onClick={props.cut}>Cut</li>
        <li onClick={props.copy}>Copy</li>
        <li onClick={props.paste}>Paste</li>
        <li onClick={props.delete}>Delete</li>
        <li onClick={handleEdit}>Edit shape</li>
      </ul>

      {drop && <div className="drop">
        <DropdownEditObject
          title="Edit Shape"
          choosecolorf={handleColorF}
          choosecolors={handleColorS}
          handleWidth={handleWidth}
          handleOpacity={handleOpacity}
        />
      </div>}
    </div>
  );
};

export default ContextMenu;
