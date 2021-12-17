import React, { useState } from "react";
import Pencil from "../Pencils/Pencil";
import DropdownRoles from "../Dropdown/DropdownRoles";

import "./Info.css";

const Info = (props) => {
  const [open, setOpen] = useState(0);

  const addCircle = () => {
    props.addCircle();
  }

  const addRectangle = () => {
    props.addRectangle();
  }

  const addTriangle = () => {
    props.addTriangle();
  }

  const addStar = () => {
    props.addStar();
  }

  const drawLine = () => {
    props.drawLine();
  }

  const drawText = () => {
    props.drawText();
  }

  const drawImage = () => {
    props.drawImage();
  }

  const eraseLine = () => {
    props.eraseLine();
  }

  return (
    <div>
      <div className={"info" + open}>
        {(open !== 1)
          ? <button onClick={() => setOpen(1)}><i className="fas fa-caret-square-up fa-3x"></i></button>
          : <button onClick={() => setOpen(0)}><i className="fas fa-caret-square-down fa-3x"></i></button>
        }
        <p id="rolesdrop">
          <DropdownRoles />
        </p>
        <b>
          {props.stuff}
        </b>
      </div>
      {(props.editmode === 1) && <div id={"pencili" + open}>
        <Pencil
          id="1"
          psize="2"
          type="main"
          title="Edit Personal Space"
          addCircle={addCircle}
          addRectangle={addRectangle}
          addTriangle={addTriangle}
          addStar={addStar}
          drawLine={drawLine}
          drawText={drawText}
          drawImage={drawImage}
          eraseLine={eraseLine}
        />
      </div>}
    </div>
  )
}

export default Info;
