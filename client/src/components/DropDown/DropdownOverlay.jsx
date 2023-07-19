import React, { useState, useEffect, useRef, useCallback } from 'react';
import Switch from "react-switch";
import debounce from 'lodash.debounce';
import ConfirmationModal from "../Modal/ConfirmationModal";
import { useAlertContext } from "../Alerts/AlertContext";
import { useTranslation } from "react-i18next";
import MultiLevel from './Multilevel';

import "./Dropdown.css";

import Trash from "../../../public/icons/trash-can-alt-2.svg"

const DropdownOverlay = (props) => {

  const menuElem = useRef();
  const [selectedOption, setSelectedOption] = useState();
  const [conditions, setConditions] = useState(props.getOverlayState(props.overlayIndex)?.overlayCondition?.conditions || {});
  const [imageSelected, setImageSelected] = useState("images/ujjtehlwjgsfqngxesnd");
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }
  const [hideBtn, setHideBtn] = useState();
  const { t } = useTranslation();

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
          alertContext.showAlert(t("alert.setOnlyOneOverlay", { name: i+1 }), "warning");
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

  const debounceObjState = useCallback(
    debounce(state => handleChangeCondition(state), 100),
    [], // will be created only once initially
  );


  const handleUpdateConditions = (key, value) => {
    setConditions(old => ({
      ...old,
      [key]: value ? value : undefined
    }))
    debounceObjState({
      conditions: {
        ...conditions,
        [key]: value ? value : undefined
      }
    });
  }

  const handleChangeCondition = (e) => {
    const pages = [...props.pages];
    pages[props.level - 1].overlays[props.overlayIndex].overlayCondition = e;
    props.changePages(pages);
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


  const openWidget = (event) => {
    var myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "uottawaedusim",
        uploadPreset: "bb8lewrh"
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          props.handleOverlayIcon(result.info.public_id)
          myWidget.close();
        }
      }
    );
    myWidget.open();
  }
  
  const handleChange = (value) => {
    setConditions(old => ({
      ...old,
      varName: value.label[0] ? value.label[0] : undefined
    }))
    debounceObjState({
      conditions: {
        ...conditions,
        varName: value.label[0] ? value.label[0] : undefined
      }
    });
  }



  return (
    <>
      <div className="dropdown overlayOptionsDropdown" ref={menuElem}>
        <div className="menu">
          <div className="overlay-title-container"><h1 className="overlay-title">{t("edit.overlayXSettings", { name: props.overlayIndex + 1 })}</h1>
            <button type="button" className="modal-overlay-button" onClick={openWidget}>
              {t("modal.overlayImage")}
            </button>
          </div>
          <div className="overlayHideRow">
            <h2 className="overlaySettingsSub">{t("edit.hideOverlayButton")}</h2>
            <Switch
              onChange={hideToggled}
              checked={hideBtn ? hideBtn : false}
              disabled={props.pages[props.level - 1].overlays[props.overlayIndex] ?
                props.pages[props.level - 1].overlays[props.overlayIndex].overlayOpenOption === "doNotAutoOpen" : false}
              height={25}
              width={50}
              className="react-switch"
            />
          </div>
          <h2 className="overlaySettingsSub">{t("edit.openOverlayWhen")}</h2>
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
              {t("edit.pageEntered")}
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
              {t("edit.pageExited")}
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
              {t("edit.dontOpenOverlay")}
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
              {t("edit.conditionIsMet")}
            </label>

            <div className={`overlayConditions ${selectedOption !== "condition" ? "overlayConditionsDisabled" : ""}`}>
              {/* The overlay conditions for opening */}
              <MultiLevel data={props.variables} handleChange={handleChange} baseValue={conditions?.varName} className={'overlay-multilevel'} />
              {/* <input
                type="text"
                placeholder={t("edit.variableName")}
                value={conditions?.varName || ""}
                onChange={(e) => handleUpdateConditions("varName", e.target.value)}
              /> */}
              <select
                name="inputtype"
                value={conditions?.condition}
                onChange={(e) => handleUpdateConditions("condition", e.target.value)}
              >
                <option value="positive">{t("edit.cond.positive")}</option>
                <option value="negative">{t("edit.cond.negative")}</option>
                <option value="true">{t("edit.cond.istrue")}</option>
                <option value="false">{t("edit.cond.isfalse")}</option>
                <option value="isequal">{t("edit.cond.isequal")}</option>
                <option value="onchange">{t("edit.cond.onchange")}</option>
              </select>
              {conditions?.condition === "isequal" && (
                <input
                  type="text"
                  placeholder={t("edit.valueToCheckAgainst")}
                  value={conditions?.trueValue || ""}
                  onChange={(e) => handleUpdateConditions("trueValue", e.target.value)}
                />
              )}
            </div>
          </div>
          <div className="overlayDeleteRow">
            <h2 className="overlaySettingsSub">{t("edit.deleteOverlay")}</h2>

            <i onClick={() => {

              setConfirmationVisible(true);
            }} ><Trash className="icon"/></i>
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
        confirmMessage={t("edit.yesDeleteOverlay")}
        message={t("edit.confirmDeleteOverlay", { name: props.overlayIndex + 1 })}
      />
    </>
  );
}

export default DropdownOverlay;
