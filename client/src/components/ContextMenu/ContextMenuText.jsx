import React, { useState } from "react";
import DropdownEditObject from "../DropDown/DropdownEditObject";
import "./ContextMenu.css"

function ContextMenuText(props) {
  const [drop, setDrop] = useState(false);

  function handleColorF(e) {
    props.choosecolorf(e);
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
      className="cmenu"
      style={{
        position: "absolute",
        left: props.position.x + 100,
        top: props.position.y - 20,
      }}
    >
      <ul>
        <li onClick={props.cut}>Cut</li>
        <li onClick={props.copy}>Copy</li>
        <li onClick={props.paste}>Paste</li>
        <li onClick={props.delete}>Delete</li>
        <li onClick={handleEdit}>Edit text</li>
        <hr />
        <li onClick={props.close}>Close</li>
      </ul>
      {drop && <div className="drop">
        <DropdownEditObject
          title="Edit Text"
          choosecolorf={handleColorF}
          handleSize={(e) => props.handleSize(e)}
          handleWidth={handleWidth}
          handleOpacity={handleOpacity}
          handleFont={(e) => props.handleFont(e)}
        />
      </div>}
    </div>
  );
};

export default ContextMenuText;
