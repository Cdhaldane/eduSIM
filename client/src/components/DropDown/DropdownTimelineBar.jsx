import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import Switch from "react-switch"

import "./Dropdown.css";

function DropdownTimelineBar(props) {
  const [activeMenu] = useState('main');
  const [checked, setChecked] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    console.log(dropdownRef.current);
    //setMenuHeight(dropdownRef.current?.firstChild.scrollHeight);

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleClickOutside = e => {
    if (!dropdownRef.current.contains(e.target)) {
      props.close();
    }
  }

  function handleType(e) {
    props.ptype(e.target.value);
  }

  function handleNum(e) {
    props.num(e.target.value);
  }

  return (
    <div className="dropdown" ref={dropdownRef}>
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit>
        <div className="menu">
          <h1>Edit Timeline Bar</h1>
          <h1>Number of pages:</h1>
          <button onClick={handleNum} value="1">1</button>
          <button onClick={handleNum} value="2">2</button>
          <button onClick={handleNum} value="3">3</button>
          <button onClick={handleNum} value="4">4</button>
          <button onClick={handleNum} value="5">5</button>
          <button onClick={handleNum} value="6">6</button>
          <div id="pagetype">
            <input
              type="text"
              name="ptype"
              placeholder="Enter a page type"
              onChange={handleType}
            />
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownTimelineBar;
