import React, { useState, useEffect, useRef } from 'react';

import "./Dropdown.css";

const DropdownOverlay = (props) => {

  const menuElem = useRef();
  const [selectedOption, setSelectedOption] = useState(props.pages[props.level - 1].overlayOpenOption || "pageEnter");

  const [conditions, setConditions] = useState({
    condition: true
  });

  const handleClickOutside = e => {
    if (menuElem.current && !menuElem.current.contains(e.target)) {
      props.close();
    }
  }

  const optionSelected = (e) => {
    setSelectedOption(e.target.value);
    const pages = [...props.pages];
    const currentPage = pages[props.level - 1];
    currentPage.overlayOpenOption = e.target.value;
    pages[props.level - 1] = currentPage;
    props.changePages(pages);
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="dropdown overlayOptionsDropdown" ref={menuElem}>
      <div className="menu">
        <h1>Overlay Settings</h1>
        <h2>Automatically open the overlay when:</h2>

        <div className={"overlayOpenOptions"}>
          <input
            id="overlayOpenOnEnter"
            type="radio"
            name="overlayOpenOption"
            value="pageEnter"
            onChange={optionSelected}
            checked={selectedOption === "pageEnter"}
          />
          <label htmlFor="overlayOpenOnEnter">
            The page is entered (Default)
          </label><br />

          <input
            id="overlayOpenOnExit"
            type="radio"
            name="overlayOpenOption"
            value="pageExit"
            onChange={optionSelected}
            checked={selectedOption === "pageExit"}
          />
          <label htmlFor="overlayOpenOnExit">
            The page is exited
          </label><br />

          <input
            id="overlayOpenNotAuto"
            type="radio"
            name="overlayOpenOption"
            value="doNotAutoOpen"
            onChange={optionSelected}
            checked={selectedOption === "doNotAutoOpen"}
          />
          <label htmlFor="overlayOpenNotAuto">
            Do not automatically open overlay
          </label><br />

          <input
            id="overlayOpenOnCondition"
            type="radio"
            name="overlayOpenOption"
            value="condition"
            onChange={optionSelected}
            checked={selectedOption === "condition"}
          />
          <label htmlFor="overlayOpenOnCondition">
            The following condition is met:
          </label>

          <div className={`overlayConditions ${selectedOption !== "condition" ? "overlayConditionsDisabled" : ""}`}>
            {/* The overlay conditions for opening */}
            <input
              type="text"
              placeholder="Variable name"
              value={""}
              onChange={null}
            />
            <select
              name="inputtype"
              value={conditions?.condition}
              onChange={null}
            >
              <option value="positive">contains a positive value</option>
              <option value="negative">contains a negative/null value</option>
              <option value="equalto">is equal to</option>
              <option value="onchange">changes</option>
            </select>
            {conditions?.condition === "equalto" && (
              <input
                type="text"
                placeholder="Value to check against"
                value={""}
                onChange={null}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DropdownOverlay;
