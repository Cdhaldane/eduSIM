import React, { useState, useEffect, useRef } from 'react';
import ConfirmationModal from "../Modal/ConfirmationModal";

import "./Dropdown.css";

function DropdownTimelineBar(props) {

  const [pages, setPages] = useState(props.pages);
  const [numOfPages, setNumOfPages] = useState(props.numOfPages);
  const dropdown = useRef();

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }

  const handleClickOutside = e => {
    if (dropdown.current &&
      !dropdown.current.contains(e.target) &&
      !confirmationVisibleRef.current) {
      props.close();
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
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
              disabled={parseInt(numOfPages) === 1}
              className={"numOfPagesInputBtn"}
              onClick={() => setConfirmationModal(true)} >
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

      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={() => {
          const num = document.getElementById("numOfPagesInput");
          num.stepDown()
          setNumOfPages(num.value);
        }}
        confirmMessage={"Yes - Delete Page"}
        message={`Are you sure you want to delete page 
        ${pages[numOfPages - 1] ? (pages[numOfPages - 1].trim() !== "" ? pages[numOfPages - 1] : "Untitled") : ""}? 
        This action cannot be undone.`}
      />
    </div>
  );
}

export default DropdownTimelineBar;
