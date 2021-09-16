import React from 'react';

import "./Dropdown.css";

const DropdownItem = (props) => {
  return (
    <div className="menu-item" onClick={props.onClick}>
      <span className="icon-button">{props.leftIcon}</span>
      {props.children}
      <span className="icon-right">{props.rightIcon}</span>
    </div>
  );
};

export default DropdownItem;