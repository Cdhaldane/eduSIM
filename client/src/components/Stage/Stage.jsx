import React, { useState, useRef } from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import { SelectableGroup } from 'react-selectable-fast'

import { Stage, Layer, Text, Shape } from "react-konva";
import Rectangle from "./Shapes/Rectangle";
import Circle from "./Shapes/Circle";
import Triangle from "./Shapes/Triangle"
import Star from "./Shapes/Star"
import Stick from "./Shapes/Stick"
import { addLine } from "./Shapes/Line";
import { addTextNode } from "./Shapes/Text";
import Image from "./Shapes/Img";
import { v1 as uuidv1 } from 'uuid';
import Canvas from "./Canvas.js"


import {Link } from "react-router-dom";
import Level from "../Level/Level";
import Info from "../Information/InformationPopup";
import EditShapes from "../EditShapes/EditShapes";
import Pencil from "../Pencils/Pencil";
import Sidebar from "../SideBar/Sidebar";
import Header from "../SideBar/Header";
import styled from "styled-components"

import { Container, Row, Col } from "react-bootstrap";

import "./Stage.css"


function Stages(props) {
  const [showNav, setShowNav] = useState(false);
  const [number, setNumber] = useState(6);
  const [mvisible, setMvisible] = useState("false")
  const [avisible, setAvisible] = useState("false")
  const [pavisible, setPavisible] = useState("false")
  const [svisible, setSvisible] = useState("false")
  const [pevisible, setPevisible] = useState("false")
  const [ptype, setType] = useState("")
  const [num, setNum] = useState(6)
  const [color, setColor]= useState("white")
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [stars, setStars] = useState([]);
  const [triangles, setTriangles] = useState([]);
  const [sticks, setSticks] = useState([]);
  const [arrows, setArrows] = useState([]);

  const [images, setImages] = useState([]);
  const [selectedId, selectShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [, updateState] = React.useState();
  const stageEl = React.createRef();
  const layerEl = React.createRef();
  const fileUploadEl = React.createRef();

  let history = [
    {
      x: 21,
      y: 20
    }
  ];
  let historyStep = 0;

  const [ position, setPoistion ] = useState(history[0])


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
  function handleType(e){
    setType(e);
  }
  function handleNum(e){
    setNum(e);
  }
  function handleColor(e){
    setColor(e.hex);
  }

  const getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  const draw = (context, shape) => {
    context.beginPath();
             context.moveTo(20, 50);
             context.lineTo(220, 80);
             context.quadraticCurveTo(150, 100, 260, 170);
             context.closePath();
             // (!) Konva specific method, it is very important
             context.fillStrokeShape(shape);
    console.log(8);
  }
  const addStick = () => {
    const sti = {
      x: getRandomInt(800,900),
      y: getRandomInt(400, 500),
      width: 3,
      height: 300,
      fill: color,
      id: `sti${sticks.length + 1}`,
      visible: true,
      zIndex: 2,
      strokeWidth: 3.75, // border width
      stroke:"black", // border color
      opacity: 1
    };
    const stis = sticks.concat([sti]);
    setSticks(stis);
    const shs = shapes.concat([`sti${sticks.length + 1}`]);
    setShapes(shs);
  };
  const addCircle = () => {
    const circ = {
      x: getRandomInt(800,900),
      y: getRandomInt(400, 500),
      width: 100,
      height: 100,
      fill: color,
      id: `circ${circles.length + 1}`,
      zIndex: 3,
      visible: true,
      zIndex: 2,
      strokeWidth: 3.75, // border width
      stroke:"black", // border color
      opacity: 1
    };
    const circs = circles.concat([circ]);
    setCircles(circs);
    const shs = shapes.concat([`circ${circles.length + 1}`]);
    setShapes(shs);
  };
  const addTriangle = () => {
    const tri = {
      x: getRandomInt(800,900),
      y: getRandomInt(400, 500),
      width: 100,
      height: 100,
      sides: 3,
      radius: 70,
      fill: color,
      id: `tri${triangles.length + 1}`,
      visible: true,
      zIndex: 2,
      strokeWidth: 3.75, // border width
      stroke:"black", // border color
      opacity: 1
    };
    const tris = triangles.concat([tri]);
    setTriangles(tris);
    const shs = shapes.concat([`tri${triangles.length + 1}`]);
    setShapes(shs);
  };
  const addArrow = () => {
    const arr = {
      x: getRandomInt(800,900),
      y: getRandomInt(400, 500),
      width: 100,
      height: 100,
      numPoints: 5,
      innerRadius: 30,
      outerRadius: 70,
      fill: color,
      id: `arr${arrows.length + 1}`,
      visible: true,
      zIndex: 2,
      strokeWidth: 3.75, // border width
      stroke:"black", // border color
      opacity: 1
    };
    const arrs = arrows.concat([arr]);
    setArrows(arrs);
    const shs = shapes.concat([`arr${arrows.length + 1}`]);
    setShapes(shs);
  };

  const addStar = () => {
    const sta = {
      x: getRandomInt(800,900),
      y: getRandomInt(400, 500),
      width: 100,
      height: 100,
      numPoints: 5,
      innerRadius: 30,
      outerRadius: 70,
      fill: color,
      id: `sta${stars.length + 1}`,
      visible: true,
      zIndex: 2,
      strokeWidth: 3.75, // border width
      stroke:"black", // border color
      opacity: 1
    };
    const stas = stars.concat([sta]);
    setStars(stas);
    const shs = shapes.concat([`sta${stars.length + 1}`]);
    setShapes(shs);
  };

  const drawLine = () => {
    addLine(stageEl.current.getStage(), layerEl.current, "brush", color);
  };
  const eraseLine = () => {
    addLine(stageEl.current.getStage(), layerEl.current, "erase");
  };

  const drawText = () => {
    const id = addTextNode(stageEl.current.getStage(), layerEl.current);
    const shs = shapes.concat([id]);
    setShapes(shs);
  };
  const drawImage = () => {
    fileUploadEl.current.click();
  };
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const fileChange = ev => {
    let file = ev.target.files[0];
    let reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        const id = uuidv1();
        images.push({
          content: reader.result,
          id,
        });
        setImages(images);
        fileUploadEl.current.value = null;
        shapes.push(id);
        setShapes(shapes);
        forceUpdate();
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    const lastId = shapes[shapes.length - 1];
    let index = circles.findIndex(c => c.id == lastId);
    if (index != -1) {
      circles.splice(index, 1);
      setCircles(circles);
    }
    index = rectangles.findIndex(r => r.id == lastId);
    if (index != -1) {
      rectangles.splice(index, 1);
      setRectangles(rectangles);
    }
    index = images.findIndex(r => r.id == lastId);
    if (index != -1) {
      images.splice(index, 1);
      setImages(images);
    }
    shapes.pop();
    setShapes(shapes);
    forceUpdate();
  };

  document.addEventListener("keydown", ev => {
    if (ev.code == "Delete") {
      let index = circles.findIndex(c => c.id == selectedId);
      if (index != -1) {
        circles.splice(index, 1);
        setCircles(circles);
      }
      index = rectangles.findIndex(r => r.id == selectedId);
      if (index != -1) {
        rectangles.splice(index, 1);
        setRectangles(rectangles);
      }
      index = triangles.findIndex(r => r.id == selectedId);
      if (index != -1) {
        triangles.splice(index, 1);
        setTriangles(triangles);
      }
      index = stars.findIndex(r => r.id == selectedId);
      if (index != -1) {
        stars.splice(index, 1);
        setStars(stars);
      }
      index = images.findIndex(r => r.id == selectedId);
      if (index != -1) {
        images.splice(index, 1);
        setImages(images);
      }
      forceUpdate();
    }
  });
  return (
    <div className="home-page">
      <input
        style={{ display: "none" }}
        type="file"
        ref={fileUploadEl}
        onChange={fileChange}
      />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageEl}
        onMouseDown={e => {
          // deselect when clicked on empty area
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            selectShape(null);
          }
        }}
      >

        <Layer ref={layerEl}>
          {rectangles.map((rect, i) => {
            return (
              <Rectangle
                fill= {props.color}
                key={i}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                onSelect={() => {
                  selectShape(rect.id);
                }}
                onChange={newAttrs => {
                  const rects = rectangles.slice();
                  rects[i] = newAttrs;
                  setRectangles(rects);
                }}
              />
            );
          })}
          {triangles.map((tri, i) => {
            return (
              <Triangle
                key={i}
                shapeProps={tri}
                isSelected={tri.id === selectedId}
                onSelect={() => {
                  selectShape(tri.id);
                }}
                onChange={newAttrs => {
                  const tris = triangles.slice();
                  tris[i] = newAttrs;
                  setTriangles(tris);
                }}
              />
            );
          })}
          {stars.map((sta, i) => {
            return (
              <Star
                key={i}
                shapeProps={sta}
                isSelected={sta.id === selectedId}
                onSelect={() => {
                  selectShape(sta.id);
                }}
                onChange={newAttrs => {
                  const stas = stars.slice();
                  stas[i] = newAttrs;
                  setStars(stas);
                }}
              />
            );
          })}
          {sticks.map((sti, i) => {
            return (
              <Stick
                key={i}
                shapeProps={sti}
                isSelected={sti.id === selectedId}
                onSelect={() => {
                  selectShape(sti.id);
                }}
                onChange={newAttrs => {
                  const stis = sticks.slice();
                  stis[i] = newAttrs;
                  setSticks(stis);
                }}
              />
            );
          })}
          {arrows.map((sti, i) => {
            return (
              <Stick
                key={i}
                shapeProps={sti}
                isSelected={sti.id === selectedId}
                onSelect={() => {
                  selectShape(sti.id);
                }}
                onChange={newAttrs => {
                  const stis = sticks.slice();
                  stis[i] = newAttrs;
                  setSticks(stis);
                }}
              />
            );
          })}
          {circles.map((circle, i) => {
            return (
              <Circle
                key={i}
                shapeProps={circle}
                isSelected={circle.id === selectedId}
                onSelect={() => {
                  selectShape(circle.id);
                }}
                onChange={newAttrs => {
                  const circs = circles.slice();
                  circs[i] = newAttrs;
                  setCircles(circs);
                }}

              />
            );
          })}
          {images.map((image, i) => {
            return (
              <Image
                key={i}
                imageUrl={image.content}
                isSelected={image.id === selectedId}
                onSelect={() => {
                  selectShape(image.id);
                }}
                onChange={newAttrs => {
                  const imgs = images.slice();
                  imgs[i] = newAttrs;
                }}
              />
            );
          })}

        </Layer>

      </Stage>

          <b id="canvas">
          <Canvas/>
        </b>



    </div>
  );
}
export default Stages;



// <EditShapes
//   choosecolor={handleColor}
// />
