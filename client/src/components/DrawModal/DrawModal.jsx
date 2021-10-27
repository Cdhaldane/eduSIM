import React, { useState, useRef, useEffect } from "react";
import { ChromePicker } from 'react-color';
import Draggable from "react-draggable";

import "./DrawModal.css";

const DrawModal = (props) => {

  const [color, setColor] = useState("#000");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [sidebarW, setSidebarW] = useState(0);
  const [topbarH, setTopbarH] = useState(0);
  const [strokeW, setStrokeW] = useState(5);
  const [tool, setTool] = useState("pen");
  const ref = useRef();

  useEffect(() => {
    setWidth(ref.current.clientWidth);
    setHeight(ref.current.clientHeight);
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
            <i className="fa fa-times" />
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
          <label>Pen</label>
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
          <label style={{ paddingLeft: "5px" }}>Eraser</label>
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