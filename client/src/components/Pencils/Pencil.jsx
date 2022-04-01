import React, { useState } from "react";
import DropdownTimelineBar from "../Dropdown/DropdownTimelineBar";
import DropdownNavigationBar from "../Dropdown/DropdownNavigationBar";
import { useTranslation } from "react-i18next";

import "./Pencil.css";

const Pencil = (props) => {
  const { t } = useTranslation();
  const [drop, setDrop] = useState(false);

  const handleClose = () => {
    setDrop(!drop);
  }

  const handleDrop = () => {
    setDrop(!drop);
    if (props.editModeToggle === true) {
      props.editMode();
    }
    if (props.editModeToggle === false) {
      props.editMode();
    }
  }

  return (
    <div>
      <div className={"pencil" + props.type} onClick={handleDrop}>
        <i
          id={"pencil" + props.id}
          aria-hidden="true"
          className={"lni lni-pencil" + (props.hidden ? " hidden" : "") + (props.submenu ? " submenu" : "")}
          onClick={handleDrop}
        />
        {props.type == "info" && (
          <div>
            <h1>{t("admin.simedit")}</h1>
          </div>
        )}
      </div>
      {drop && (
        <div className={"drop" + props.id + (props.hidden ? " hidden" : "") + (props.submenu ? " submenu" : "")}>
          {props.type === "info" && (
            <DropdownTimelineBar
              positionRect={props.positionRect}
              pages={props.pages}
              refreshCanvas={props.refreshCanvas}
              changeObjectPage={props.changeObjectPage}
              handlePageTitle={props.handlePageTitle}
              handlePageNum={props.handlePageNum}
              numOfPages={props.numOfPages}
              updateObjState={props.updateObjState}
              handleCopyPage={props.handleCopyPage}
              close={handleClose}
              getObjState={props.getObjState} />

          )}
          {props.type === "nav" && (
            <DropdownNavigationBar
              mvisible={props.mvisible}
              avisible={props.avisible}
              svisible={props.svisible}
              pevisible={props.pevisible}
              close={handleClose} />
          )}
        </div>
      )}
    </div>
  );
}

export default Pencil;
