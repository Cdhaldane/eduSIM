import React, { useState, useEffect, useRef } from 'react';
import { useAlertContext } from "../Alerts/AlertContext";

import "./Dropdown.css";

function DropdownTimelineBar(props) {
  
  const [pages, setPages] = useState(["1"]);
  const [numOfPages, setNumOfPages] = useState(1);
  const dropdown = useRef();

  const alertContext = useAlertContext();

  const handleClickOutside = e => {
    if (dropdown.current && !dropdown.current.contains(e.target)) {
      props.close();
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    setNumOfPages(props.numOfPages);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const currentNum = pages.length;
    if (numOfPages > currentNum) {
      const newArr = [];
      for (let i = 0; i < numOfPages - currentNum; i++) {
        newArr[i] = (currentNum + i + 1).toString();
      }
      setPages([...pages, ...newArr]);
    } else if (numOfPages < currentNum) {
      setPages([...pages.slice(0, pages.length - 1)]);
    }
    props.handlePageNum(numOfPages);
  }, [numOfPages]);

  useEffect(() => {
    props.handlePageTitle(pages);
  }, [pages]);

  const pageNameChanged = (name, index) => {
    const newArr = pages.slice();
    newArr[index] = name;
    setPages(newArr);
  }

  return (
    <div className="dropdown menu-primary timelineDropdown" style={{ height: "auto" }} ref={dropdown}>
      <div className="menu">
        <h1>Edit Timeline Bar</h1>

        <div>
          <span id="numOfPagesLabel"># of Pages (from 1-6):</span>
          <input
            id="numOfPagesInput"
            type="number"
            readOnly
            min="1" max="6"
            onKeyDown={(e) => {
              e.preventDefault();
              return false;
            }}
            value={numOfPages} />
          <div style={{
            width: "10px",
            display: "inline"
          }}>
            <button
              className={"numOfPagesInputBtn"}
              onClick={() => {
                const num = document.getElementById("numOfPagesInput");
                num.stepDown()
                setNumOfPages(num.value);
              }} >
              -
            </button>
            <button
              className={"numOfPagesInputBtn"}
              onClick={() => {
                const num = document.getElementById("numOfPagesInput");
                num.stepUp();
                setNumOfPages(num.value);
              }} >
              +
            </button>
          </div>
        </div>

        <div style={{
          margin: "10px 0px"
        }}>
          {pages.map((pageName, index) => {
            return (
              <input
                key={index}
                className="pageNameInput"
                type="text"
                placeholder="Page Name"
                onChange={(e) => pageNameChanged(e.target.value, index)}
                value={pageName} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DropdownTimelineBar;
