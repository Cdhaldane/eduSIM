import React from "react";
import "./ContextMenu.css";

const ContextMenu = ({ position, onOptionSelected }) => {
  const handleOptionSelected = option => () => onOptionSelected(option);

  return (
    <div
      className="cmenu"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y
      }}
    >
      <ul>
        <li onClick={handleOptionSelected("Cut")}>Cut</li>
        <li onClick={handleOptionSelected("Copy")}>Copy</li>
        <li onClick={handleOptionSelected("Paste")}>Paste</li>
        <li onClick={handleOptionSelected("Delete")}>Delete</li>
        <li onClick={handleOptionSelected("Undo")}>Undo</li>
      </ul>
    </div>
  );
};

export default ContextMenu;
