import React, { useState } from "react";
import Pencil from "../Pencils/Pencil";
import Dropdownroles from "../DropDown/Dropdownroles";
import {
  Rect,
  Stage,
  Layer,
  Transformer,
  Ellipse,
  Star,
  Text,
  RegularPolygon,
  Line,
  Arrow,
  Image
} from "react-konva";
import "./Info.css";

function Info(props) {
  const[open, setOpen] = useState(0);
  const[state, setState] = useState(false);

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

  return(
  <div>
    <div className={"info" + open}>
      <div id="infostage">
      <Stage width={1500} height={600} >
        <Layer>
          <Rect
            x={20}
            y={50}
            width={100}
            height={100}
            fill="red"
            shadowBlur={10}
            draggable
          />
        </Layer>
      </Stage>
      </div>
      {(open !== 1)
        ? <button onClick={() => setOpen(1)}><i class="fas fa-caret-square-up fa-3x"></i></button>
        : <button onClick={() => setOpen(0)}><i class="fas fa-caret-square-down fa-3x"></i></button>
      }
      <p id="rolesdrop">
        <Dropdownroles />
      </p>
        <b>
         {props.stuff}
        </b>
      </div>
      {(props.editmode == 1 )
        ? <div id={"pencili" + open}>
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
          </div>
        : ""
        }

    </div>
    )
  }

export default Info;
