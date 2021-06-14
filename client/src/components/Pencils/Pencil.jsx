import React, { useState } from "react";
import Dropdown from "../DropDown/Dropdown";
import Dropdowninfo from "../DropDown/Dropdowninfo";
import "./Pencil.css";

function Pencil(props) {
  const [drop, setDrop] = useState(false);
  return (
    <div className="pencil">
      <i
        id={"pencil" + props.id}
        aria-hidden="true"
        class={"fa fa-pencil fa-" + props.psize + "x"}
        onClick={() => setDrop(!drop)}
        >
      </i>

      {drop && <div className={"drop" + props.id}>
        <Dropdown type= {props.type} />
      </div>}
    </div>
  );
}

export default Pencil;
