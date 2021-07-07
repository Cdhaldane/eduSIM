import React, { useState } from "react";
import Dropdown from "../DropDown/Dropdown";
import Dropdowninfo from "../DropDown/Dropdowninfo";
import Dropdownnav from "../DropDown/Dropdownnav";
import "./Pencil.css";

function Pencil(props) {
  const [drop, setDrop] = useState(false);

  function handleMvisible(e) {
    props.mvisible(e)
  }
  function handleAvisible(e) {
    props.avisible(e)
  }
  function handlePavisible(e) {
    props.pavisible(e)
  }
  function handleSvisible(e) {
    props.svisible(e)
  }
  function handlePevisible(e) {
    props.pevisible(e)
  }
  function handleType(e) {
    props.ptype(e)
  }
  function handleNum(e) {
    props.num(e)
  }

  function addCircle(){
    props.addCircle();
  }
  function addRectangle(){
    props.addRectangle();
  }
  function addTriangle(){
    props.addTriangle();
  }
  function addStar(){
    props.addStar();
  }
  function drawLine(){
    props.drawLine();
  }
  function drawText(){
    props.drawText();
  }
  function drawImage(){
    props.drawImage();
  }
  function eraseLine(){
    props.eraseLine();
  }

  function handleColor(e){
    props.choosecolor(e);
  }

  function handleClose(e){
    setDrop(!drop);
  }

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

      {props.type == "info"  ? (
        <Dropdowninfo ptype={handleType} num={handleNum}/>
    ) : (
      ""
    )}
    {props.type == "main"  ? (
      <Dropdown
        title={props.title}
        addCircle={addCircle}
        addRectangle={addRectangle}
        addTriangle={addTriangle}
        addStar={addStar}
        drawLine={drawLine}
        drawText={drawText}
        drawImage={drawImage}
        eraseLine={eraseLine}
        choosecolor={handleColor}
        close={handleClose}
      />
    ) : (

    ""
    )}
    {props.type == "nav"  ? (
    <Dropdownnav
      mvisible={handleMvisible}
      avisible={handleAvisible}
      pavisible={handlePavisible}
      svisible={handleSvisible}
      pevisible={handlePevisible}/>
    ) : (
      ""
    )}

      </div>}
    </div>
  );
}

export default Pencil;
