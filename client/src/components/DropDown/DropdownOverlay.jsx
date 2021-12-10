import React, { useState, useEffect, useRef } from 'react';
import Switch from "react-switch";
import ConfirmationModal from "../Modal/ConfirmationModal";
import { useAlertContext } from "../Alerts/AlertContext";

import "./Dropdown.css";

const DropdownOverlay = (props) => {

  const menuElem = useRef();
  const [selectedOption, setSelectedOption] = useState();
  const [conditions, setConditions] = useState({
    condition: true
  });
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const [hideBtn, setHideBtn] = useState();

  const handleClickOutside = e => {
    if (menuElem.current && !menuElem.current.contains(e.target)) {
      props.close();
    }
  }

  const alertContext = useAlertContext();

  useEffect(() => {
    const overlay = props.pages[props.level - 1].overlays[props.overlayIndex];
    if (overlay) {
      setSelectedOption(overlay.overlayOpenOption);
      setHideBtn(overlay.hideBtn);
    }
  }, [props]);

  const optionSelected = (e) => {
    const option = e.target.value;
    const pages = [...props.pages];
    if (option === "pageEnter" || option === "pageExit") {
      // Make sure this setting has not been used on another overlay on this page yet
      const overlays = pages[props.level - 1].overlays;
      for (let i = 0; i < overlays.length; i++) {
        if (i !== props.overlayIndex && overlays[i].overlayOpenOption === option) {
          alertContext.showAlert(`This setting can only be applied to one overlay at a time and is currently already applied to overlay ${i + 1}.`, "warning");
          return;
        }
      }
    }
    
    setSelectedOption(option);
    pages[props.level - 1].overlays[props.overlayIndex].overlayOpenOption = option;
    props.changePages(pages);

    if (option === "doNotAutoOpen") {
      hideToggled(false);
    }
  }

  const hideToggled = (e) => {
    setHideBtn(e);
    const pages = [...props.pages];
    pages[props.level - 1].overlays[props.overlayIndex].hideBtn = e;
    props.changePages(pages);
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <div className="dropdown overlayOptionsDropdown" ref={menuElem}>
        <div className="menu">
          <h1>{`Overlay ${props.overlayIndex + 1} Settings`}</h1>
          <div className="overlayHideRow">
            <h2 className="overlaySettingsSub">Hide Overlay Button:</h2>
            <Switch
              onChange={hideToggled}
              checked={hideBtn}
              disabled={props.pages[props.level - 1].overlays[props.overlayIndex] ? 
                props.pages[props.level - 1].overlays[props.overlayIndex].overlayOpenOption === "doNotAutoOpen" : false}
              height={25}
              width={50}
              className="react-switch"
            />
          </div>
          <h2 className="overlaySettingsSub">Automatically open the overlay when:</h2>
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
              The page is entered
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
                value={null}
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
                  value={null}
                  onChange={null}
                />
              )}
            </div>
          </div>
          <div className="overlayDeleteRow">
            <h2 className="overlaySettingsSub">Delete Overlay:</h2>
            <i className="icons fa fa-trash-alt" onClick={() => {
              setConfirmationVisible(true);
            }} />
          </div>
        </div>
      </div>

      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={() => {
          const newPages = [...props.pages];
          const page = newPages[props.level - 1];
          page.overlays.splice(props.overlayIndex, 1);
          props.changePages(newPages);    
        }}
        confirmMessage={"Yes - Delete Overlay"}
        message={`Are you sure you want to delete overlay ${props.overlayIndex + 1} and all associated data? This action cannot be undone.`}
      />
    </>
  );
}

export default DropdownOverlay;
