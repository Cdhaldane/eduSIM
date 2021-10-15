import React, { useState } from "react";
import DropdownTimelineBar from "../Dropdown/DropdownTimelineBar";
import DropdownNavigationBar from "../Dropdown/DropdownNavigationBar";

import "./Pencil.css";

const Pencil = (props) => {
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
      <i
        id={"pencil" + props.id}
        aria-hidden="true"
        className={"fa fa-pencil fa-" + props.psize + "x" + (props.hidden ? " hidden" : "") + (props.submenu ? " submenu" : "")}
        onClick={handleDrop}
      />
      {drop && (
        <div className={"drop" + props.id + (props.hidden ? " hidden" : "") + (props.submenu ? " submenu" : "")}>
          {props.type === "info" && (
            <DropdownTimelineBar
              pages={props.pages}
              handlePageTitle={props.handlePageTitle}
              handlePageNum={props.handlePageNum}
              numOfPages={props.numOfPages}
              close={handleClose} />
          )}
          {props.type === "nav" && (
            <DropdownNavigationBar
              mvisible={props.mvisible}
              avisible={props.avisible}
              pavisible={props.pavisible}
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
