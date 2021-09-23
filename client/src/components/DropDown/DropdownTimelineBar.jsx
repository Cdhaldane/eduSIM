import React, { useState, useEffect, useRef } from 'react';
import { useAlertContext } from "../Alerts/AlertContext";

import "./Dropdown.css";

function DropdownTimelineBar(props) {
  const dropdown = useRef();

  const [pageName, setPageName] = useState("");
  const [pages, setPages] = useState([
    { pageName: "Test" },
    { pageName: "Hello" }]);

  const alertContext = useAlertContext();

  const handleClickOutside = e => {
    if (!dropdown.current.contains(e.target)) {
      props.close();
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  function handlePageTitle(e) {
    props.handlePageTitle(e.target.value);
  }

  function handlePageNum(e) {
    props.handlePageNum(e.target.value);
  }

  const handlePageNameChange = (e) => {
    setPageName(e.target.value);
  }

  const handleAddPage = () => {
    // Check if name is empty or a duplicate
    if (pageName.trim() === "") {
      alertContext.showAlert("Page name cannot be empty.", "warning");
      return;
    }
    if (pages.some(page => page.pageName === pageName.trim())) {
      alertContext.showAlert("A page with this name already exists. Please pick a new name.", "warning");
      return;
    }

    setPages([...pages, { pageName: pageName.trim() }]);
    setPageName("");
  }

  const handleDeletePage = (index) => {
    setTimeout(() => {
      const newPages = [...pages.slice(0, index), ...pages.slice(index + 1)];
      setPages(newPages);
    }, 0);
  }

  const AvailablePages = () => {
    return (
      <div>
        {pages.map((page, index) => {
          return (
            <div className="menu-item" style={{ display: "block", lineHeight: "40px" }} key={index}>
              <span className="icon-button" style={{ float: "left" }}>
                <i className="icons fa fa-trash" onClick={() => handleDeletePage(index)} />
              </span>
              <span style={{ float: "left" }}>
                {page.pageName}
              </span>
              <span style={{ float: "right", paddingRight: "10px" }}>
                <i>
                  #{index + 1}
                </i>
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="dropdown menu-primary timelineDropdown" style={{ height: "auto" }} ref={dropdown}>
      <div className="menu">
        <h1>Edit Timeline Bar</h1>
        <h1>Pages:</h1>

        <AvailablePages />

        <div className="menu-item">
          <span className="icon-button" onClick={handleAddPage}>
            <i className="icons fas fa-plus" />
          </span>
          <input
            className="add-dropdown-item-input"
            type="text"
            placeholder="New Page Name"
            onChange={handlePageNameChange}
            value={pageName} />
        </div>

        {/*
          <button onClick={handleNum} value="1">1</button>
          <button onClick={handleNum} value="2">2</button>
          <button onClick={handleNum} value="3">3</button>
          <button onClick={handleNum} value="4">4</button>
          <button onClick={handleNum} value="5">5</button>
          <button onClick={handleNum} value="6">6</button>
          */}
      </div>
    </div>
  );
}

export default DropdownTimelineBar;
