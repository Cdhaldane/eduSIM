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
    <div className="pencil">
      <i
        id={"pencil" + props.id}
        aria-hidden="true"
        className={"fa fa-pencil fa-" + props.psize + "x" + (props.hidden ? " hidden" : "")}
        onClick={handleDrop}
      />
      {drop && (
        <div className={"drop" + props.id + (props.hidden ? " hidden" : "")}>
          {props.type === "info" && (
            <DropdownTimelineBar
              handlePageTitle={(e) => props.pageType(e)}
              handlePageNum={(e) => props.pageNum(e)}
              close={handleClose} />
          )}
          {props.type === "nav" && (
            <DropdownNavigationBar
              mvisible={(e) => props.mvisible(e)}
              avisible={(e) => props.avisible(e)}
              pavisible={(e) => props.pavisible(e)}
              svisible={(e) => props.svisible(e)}
              pevisible={(e) => props.pevisible(e)}
              close={handleClose} />
          )}
        </div>
      )}
    </div>
  );
}

export default Pencil;
