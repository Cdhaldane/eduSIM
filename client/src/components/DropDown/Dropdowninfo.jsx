import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import Switch from "react-switch"



import "./Dropdown.css";


  function Dropdowninfo(props) {
    const [activeMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [checked, setChecked] = useState(false);
    const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight)
  }, [])

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function handleType(e){
    props.ptype(e.target.value);
  }

  function handleNum(e){
    console.log(e)
    props.num(e.target.value);
  }


 return (
     <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
       <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <h1>Edit Timeline Bar</h1>
          <label id="switchtime">
            <Switch
              onChange={() => setChecked(!checked)}
              checked={checked}
              className="react-switch"
            />
          </label>
          <h1>Number of pages:</h1>
            <button onClick={handleNum} value="1">1</button>
            <button onClick={handleNum} value="2">2</button>
            <button onClick={handleNum} value="3">3</button>
            <button onClick={handleNum} value="4">4</button>
            <button onClick={handleNum} value="5">5</button>
            <button onClick={handleNum} value="6">6</button>
          <p id="pagetype">
        <input
             type="text"
             name="ptype"
             placeholder="Enter a page type"
             onChange={handleType}
           />
         </p>



        </div>
      </CSSTransition>
    </div>
  );
}

export default Dropdowninfo;
