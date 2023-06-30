import React, { useState, useRef } from "react";
import DropdownTimelineBar from "../Dropdown/DropdownTimelineBar";
import DropdownNavigationBar from "../Dropdown/DropdownNavigationBar";
import { useTranslation } from "react-i18next";

import "./Pencil.css";

import PencilIcon from "../../../public/icons/pencil.svg"

const Pencil = (props) => {
  const { t } = useTranslation();
  const [drop, setDrop] = useState(false);
  const pencilRef = useRef(null);

  const handleDrop = () => {
    setDrop(!drop);
  }

  return (
    <>
      <div className={"pencil" + props.type} onClick={handleDrop}>
        <i
          id={"pencil" + props.id}
          aria-hidden="true"
          className={"" +(props.hidden ? " hidden" : "") + (props.submenu ? " submenu" : "")}
          onClick={handleDrop}
        ><PencilIcon className="icon pencil"/></i>
        {props.type == "info" && (
          <div>
            <h1>{t("admin.simedit")}</h1>
          </div>
        )}
      </div>
      {drop && (
        <div className={"drop" + props.id + (props.hidden ? " hidden" : "") + (props.submenu ? " submenu" : "")} ref={pencilRef}>
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
              close={handleDrop}
              getObjState={props.getObjState} 
              pencilRef={pencilRef}
              />
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
      </>
  );
}

export default Pencil;
