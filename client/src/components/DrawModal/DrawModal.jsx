import React, { useState, useRef, useEffect } from "react";
import { ChromePicker } from 'react-color';
import Draggable from "react-draggable";

import "./DrawModal.css";

import Close from "../../../public/icons/close.svg"

const DrawModal = (props) => {

  const [color, setColor] = useState("#000");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [sidebarW, setSidebarW] = useState(0);
  const [topbarH, setTopbarH] = useState(0);
  const [strokeW, _setStrokeW] = useState(5);
  const [tool, setTool] = useState("pen");
  const ref = useRef();
  const scaleRef = useRef(props.scale);

  useEffect(() => {
    scaleRef.current = props.scale;
  }, [props.scale]);

  const drawCursor = (e) => {
    const cursor = document.getElementById("cursor");
    cursor.style.height = strokeWRef.current*scaleRef.current + "px";
    cursor.style.width = strokeWRef.current*scaleRef.current + "px";
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  }

  const strokeWRef = useRef(strokeW);
  const setStrokeW = data => {
    strokeWRef.current = data;
    _setStrokeW(data);
  };

  useEffect(() => {
    setWidth(ref.current.clientWidth);
    setHeight(ref.current.clientHeight);

    const mainContainer = document.getElementById("editMainContainer");
    mainContainer.classList.add("noCursor");

    document.body.addEventListener("mousemove", drawCursor);
    return () => {
      mainContainer.classList.remove("noCursor");
      document.body.removeEventListener("mousemove", drawCursor);
    }
  }, []);

  useEffect(() => {
    setSidebarW(window.matchMedia("(orientation: portrait)").matches ? 0 : 70);
    setTopbarH(window.matchMedia("(orientation: portrait)").matches ? 120 : 50);
  }, [window.matchMedia("(orientation: portrait)").matches])

  return (
    <Draggable
      handle=".drawModalDragBar"
      defaultPosition={{
        x: props.xPos,
        y: props.yPos
      }}
      bounds={{
        left: 0,
        top: 0,
        right: window.innerWidth - width - sidebarW,
        bottom: window.innerHeight - height - topbarH
      }}
    >
      <div className="drawModalContainer" ref={ref}>
        <div className="drawModalDragBar">
          <button className="drawModalExitButton" onClick={() => props.setDrawMode(false)}>
            <i><Close className="icon"/></i>
          </button>
        </div>
        <ChromePicker
          color={color}
          disableAlpha={true}
          onChange={(color) => {
            setColor(color.hex);
            props.chooseColor(color);
          }}
          styles={{
            "default": {
              picker: {
                boxShadow: "none",
              }
            }
          }}
        />
        <div className="drawModalBottomControls">
          <h4>{`Stroke Size: ${strokeW}`}</h4>
          <input
            type="range"
            min="5"
            max="100"
            value={strokeW}
            className="drawModalStrokeSlider"
            onChange={(e) => {
              props.setDrawStrokeWidth(e.target.value);
              setStrokeW(e.target.value);
            }}
          />
          <h4>Tool:</h4>
          <label
            onClick={() => {
              props.setDrawTool("pen");
              setTool("pen");
            }}
          >Pen</label>
          <input
            type="radio"
            name="drawModalTool"
            value="pen"
            checked={tool === "pen"}
            onChange={() => {
              props.setDrawTool("pen");
              setTool("pen");
            }}
          />
          <label
            style={{ paddingLeft: "5px" }}
            onClick={() => {
              props.setDrawTool("eraser");
              setTool("eraser");
            }}
          >
            Eraser
          </label>
          <input
            type="radio"
            name="drawModalTool"
            value="eraser"
            checked={tool === "eraser"}
            onChange={() => {
              props.setDrawTool("eraser");
              setTool("eraser");
            }}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default DrawModal;
