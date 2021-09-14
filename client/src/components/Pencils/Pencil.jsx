import React, { useState } from "react";
import DropdownAddObjects from "../DropDown/DropdownAddObjects";
import DropdownTimelineBar from "../DropDown/DropdownTimelineBar";
import DropdownNavigationBar from "../DropDown/DropdownNavigationBar";
import "./Pencil.css";

function Pencil(props) {
  const [drop, setDrop] = useState(false);

  function handleMvisible(e) {
    props.mvisible(e);
  }

  function handleAvisible(e) {
    props.avisible(e);
  }

  function handlePavisible(e) {
    props.pavisible(e);
  }

  function handleSvisible(e) {
    props.svisible(e);
  }

  function handlePevisible(e) {
    props.pevisible(e);
  }

  function handleType(e) {
    props.ptype(e);
  }

  function handleNum(e) {
    props.num(e);
  }

  function addCircle() {
    props.addCircle();
  }

  function addRectangle() {
    props.addRectangle();
  }

  function addTriangle() {
    props.addTriangle();
  }

  function addStar() {
    props.addStar();
  }

  function addStick() {
    props.addStick();
  }

  function drawLine() {
    props.drawLine();
  }

  function drawText() {
    props.addText();
  }

  function addImage() {
    props.addImage();
  }

  function addVideo() {
    props.addVideo();
  }

  function addAudio() {
    props.addAudio();
  }

  function addDocument() {
    props.addDocument();
  }

  function addTic() {
    props.addTic();
  }

  function addConnect() {
    props.addConnect();
  }
  
  function eraseLine() {
    props.eraseLine();
  }

  function stopDrawing() {
    props.stopDrawing();
  }

  function handleColor(e) {
    props.choosecolor(e);
  }

  function handleClose(e) {
    setDrop(!drop);
  }

  function handleImage(e) {
    props.handleImage(e);
  }

  function handleVideo(e) {
    props.handleVideo(e);
  }

  function handleAudio(e) {
    props.handleAudio(e);
  }
  function handleDocument(e) {
    props.handleDocument(e);
  }

  function handleDrop() {
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
        class={"fa fa-pencil fa-" + props.psize + "x"}
        onClick={handleDrop}
      />

      {drop && <div className={"drop" + props.id}>
        {props.type === "info" && (
          <DropdownTimelineBar ptype={handleType} num={handleNum} />
        )}

        {props.type === "main" && (
          <DropdownAddObjects
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
            addVideo={addVideo}
            addAudio={addAudio}
            addDocument={addDocument}
            addConnect={addConnect}
            addTic={addTic}
            eraseLine={eraseLine}
            choosecolor={handleColor}
            close={handleClose}
            handleImage={handleImage}
            handleVideo={handleVideo}
            handleAudio={handleAudio}
            handleDocument={handleDocument}
          />
        )}

        {props.type === "nav" && (
          <DropdownNavigationBar
            mvisible={handleMvisible}
            avisible={handleAvisible}
            pavisible={handlePavisible}
            svisible={handleSvisible}
            pevisible={handlePevisible} />
        )}
      </div>}
    </div>
  );
}

export default Pencil;
