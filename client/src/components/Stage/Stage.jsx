import React, { useState, useRef } from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";

import { Stage, Layer, Text } from "react-konva";
import Rectangle from "./Shapes/Rectangle";
import Circle from "./Shapes/Circle";
import Triangle from "./Shapes/Triangle"
import Star from "./Shapes/Star"
import { addLine } from "./Shapes/Line";
import { addTextNode } from "./Shapes/Text";
import Image from "./Shapes/Img";
import { v1 as uuidv1 } from 'uuid';


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

  const [images, setImages] = useState([]);
  const [selectedId, selectShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [, updateState] = React.useState();
  const stageEl = React.createRef();
  const layerEl = React.createRef();
  const fileUploadEl = React.createRef();

  let history = [
    {
      x: 20,
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
  const addRectangle = () => {
    const rect = {
      x: 850,
      y: 400,
      width: 100,
      height: 100,
      fill: color,
      id: `rect${rectangles.length + 1}`,
      visible: true,
      zIndex: 2,
      strokeWidth: 3.75, // border width
      stroke:"black", // border color
      opacity: 1
    };
    const rects = rectangles.concat([rect]);
    setRectangles(rects);
    const shs = shapes.concat([`rect${rectangles.length + 1}`]);
    setShapes(shs);
  };
  const addCircle = () => {
    const circ = {
      x: getRandomInt(100),
      y: getRandomInt(100),
      width: 100,
      height: 100,
      fill: color,
      id: `circ${circles.length + 1}`,
      zIndex: 1
    };
    const circs = circles.concat([circ]);
    setCircles(circs);
    const shs = shapes.concat([`circ${circles.length + 1}`]);
    setShapes(shs);
  };
  const addTriangle = () => {
    const tri = {
      x: getRandomInt(100),
      y: getRandomInt(100),
      width: 100,
      height: 100,
      sides: 3,
      radius: 70,
      fill: color,
      id: `tri${triangles.length + 1}`,
    };
    const tris = triangles.concat([tri]);
    setTriangles(tris);
    const shs = shapes.concat([`tri${triangles.length + 1}`]);
    setShapes(shs);
  };
  const addStar = () => {
    const sta = {
      x: getRandomInt(100),
      y: getRandomInt(100),
      width: 100,
      height: 100,
      numPoints: 5,
      innerRadius: 30,
      outerRadius: 70,
      fill: color,
      id: `sta${stars.length + 1}`,
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
      <div className="header">
      <Level number={number} ptype={ptype} num={num}/>
        <h1 id="editmode">Edit Mode</h1>
        <Info
          stuff="asdasdas"
          editmode="1"
          addCircle={addCircle}
          addRectangle={addRectangle}
          addTriangle={addTriangle}
          addStar={addStar}
          drawLine={drawLine}
          drawText={drawText}
          drawImage={drawImage}
          eraseLine={eraseLine}
          />


          <Pencil
            id="2"
            psize="3"
            type="main"
            title="Edit Group Space"
            addCircle={addCircle}
            addRectangle={addRectangle}
            addTriangle={addTriangle}
            addStar={addStar}
            drawLine={drawLine}
            drawText={drawText}
            drawImage={drawImage}
            eraseLine={eraseLine}
            choosecolor={handleColor}
            />
          <Pencil
            id="3"
            psize="3"
            type="info"
            title=""
            ptype={handleType}
            num={handleNum}
          />
          <Pencil
            id="4"
            psize="2"
            type="nav"
            title=""
            mvisible={handleMvisible}
            avisible={handleAvisible}
            pavisible={handlePavisible}
            svisible={handleSvisible}
            pevisible={handlePevisible}
            />

            <Link to="/dashboard">
              <i id="editpagex" class="fas fa-times fa-3x"></i>
            </Link>
          </div>




    </div>
  );
}
export default Stages;



// <EditShapes
//   choosecolor={handleColor}
// />
