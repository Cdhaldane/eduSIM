import React, { useState } from "react";
import Pencil from "../Pencils/Pencil";
import { SketchPicker, CirclePicker, ChromePicker } from 'react-color';
import "./EditShapes.css";

function EditShapes(props) {
  const [open, setOpen] = useState(0);
  const [state, setState] = useState(false);
  const [value, setValue] = useState(0);
  const [colour, setColour] = useState("");

  function handleChange(e){
    setColour(e);
    props.choosecolor(e);
  };

  return(
  <div>
  <div className={"editshapes" + open}>
    {(open !== 1)
      ? <button onClick={() => setOpen(1)}><i class="fas fa-caret-square-up fa-3x"></i></button>
      : <button onClick={() => setOpen(0)}><i class="fas fa-caret-square-down fa-3x"></i></button>
    }
    <h1 id="color">Edit Color</h1>
      <b>
      <ChromePicker
      color={ colour }
      disableAlpha={ true }
      onChangeComplete={ handleChange }/>
      </b>
    <h1 id={"opacity" + open}>Edit Opacity</h1>
    </div>
    }
    </div>
    )
  }


export default EditShapes;
