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

  function addStick(){
    props.addStick();
  }
  function drawLine(){
    props.drawLine();
  }
  function drawText(){
    props.drawText();
  }
  function addImage(){
    props.addImage();
  }
  function eraseLine(){
    props.eraseLine();
  }
  function stopDrawing(){
    props.stopDrawing();
  }
  function handleColor(e){
    props.choosecolor(e);
  }
  function handleClose(e){
    setDrop(!drop);
  }
  function handleImage(e){
    props.handleImage(e);
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
        addStick={addStick}
        drawLine={drawLine}
        drawText={drawText}
        stopDrawing={stopDrawing}
        addImage={addImage}
        eraseLine={eraseLine}
        choosecolor={handleColor}
        close={handleClose}
        handleImage={handleImage}
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
