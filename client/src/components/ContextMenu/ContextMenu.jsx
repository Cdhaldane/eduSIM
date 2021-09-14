import React, { useState } from "react";
import DropdownEditObject from "../Dropdown/DropdownEditObject";
import "./ContextMenu.css"

function ContextMenu(props) {
  const [drop, setDrop] = useState(false);
  const [menuWidth, setMenuWidth] = useState(0);
  const menu = React.useRef();

  const handleClickOutside = e => {
    if (!menu.current.contains(e.target)) {
      props.close();
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  React.useEffect(() => {
    setMenuWidth(menu.current.clientWidth);
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
        position: "absolute",
        left: props.position.x + menuWidth / 2,
        top: props.position.y + 2,
        borderRadius: "5px",
        boxShadow: "rgba(0,0,0,0.25) 4px 4px 4px 0px",
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
