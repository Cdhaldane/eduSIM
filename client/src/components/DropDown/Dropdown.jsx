import React, { useState, useEffect, useRef } from 'react';
import Note from "../Note/Note";
import { CSSTransition } from 'react-transition-group';
import Stages from "../Stage/Stage"
import { SketchPicker, CirclePicker, ChromePicker } from 'react-color';
import Switch from "react-switch"


import "./Dropdown.css";

  function DropdownMenu(props) {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [ components, setComponents ] = useState();
    const dropdownRef = useRef(null);
    const [colour, setColour] = useState("");
    const [checkedd, setCheckedd] = useState(false);
    const [checkede, setCheckede] = useState(false);
    const [imgsrc, setImgsrc] = useState("");

    function handleChange(e){
      setColour(e);
      props.choosecolor(e);
    };

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight)
  }, [])

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function handleDraw(){
    setCheckedd(!checkedd)
  }

  function handleErase(){
    setCheckede(!checkede)
  }

  function DropdownItem(props) {
    return (
      <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }


    function DropdownItems(props) {
      return (
        <a href="#" className="menu-item" onClick={props.onClick}>
          <span className="icon-button">{props.leftIcon}</span>
          {props.children}
          <span className="icon-right">{props.rightIcon}</span>
        </a>
      );
    }

  function addCircle(){
    props.addCircle();
    props.close();
  }
  function addRectangle(){
    props.addRectangle();
    props.close();
  }
  function addTriangle(){
    props.addTriangle();
    props.close();
  }
  function addStar(){
    props.addStar();
    props.close();
  }
  function addStick(){
    props.addStick();
    props.close();
  }
  function drawLine(){
    setCheckedd(!checkedd)
    props.drawLine();
  }
  function drawText(){
    props.drawText();
    props.close();
  }
  function addImage(){
    props.addImage();
    props.close();
  }
  function eraseLine(){
    setCheckede(!checkede)
    props.eraseLine();
  }
  function stopDrawing(){
    setCheckede(!checkede)
    props.stopDrawing();
  }
  function handleImage(e){
    setImgsrc(e.target.value)
    props.handleImage(imgsrc)
  }


 return (
     <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
       <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <h1>{props.title}</h1>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-shapes"></i>}
            rightIcon={""}
            goToMenu="shapes">
            Add shapes
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-camera"></i>}
            rightIcon=""
            goToMenu="media">
            Add Media
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-puzzle-piece"></i>}
            rightIcon=""
            goToMenu="pieces">
            Game Piece
          </DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'shapes'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<i id="icons" class="fas fa-arrow-left"></i>}>
            <h2>SHAPES!</h2>
          </DropdownItem>
          <DropdownItems  onClick={addRectangle} leftIcon={<i id="icons" class="fa fa-square" onClick={addRectangle} ></i>}>Square</DropdownItems>
          <DropdownItems onClick={addCircle} leftIcon={<i id="icons" class="fa fa-circle" onClick={addCircle}></i>}>Circle</DropdownItems>
        <DropdownItems onClick={addTriangle} leftIcon={<i id="iconst" class="fa fa-caret-up fa-2x" onClick={addTriangle}></i>}>Triangle</DropdownItems>
        <DropdownItems onClick={addStar} leftIcon={<i id="icons" class="fa fa-star" onClick={addStar}></i>}>Star</DropdownItems>
      <DropdownItems onClick={addStick} leftIcon={<i id="icons" class="fa fa-minus" onClick={addStick}></i>}>Stick</DropdownItems>
          <DropdownItem
            leftIcon={<i id="icons" class="fas fa-marker"></i>}
            rightIcon=""
            goToMenu="draw">
            Drawing
          </DropdownItem>

        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'media'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<i id="icons" class="fas fa-arrow-left"></i>}>
            <h2>MEDIA!</h2>
          </DropdownItem>
            <DropdownItem
              leftIcon={<i id="icons" class="fa fa-picture-o"></i>}
              rightIcon=""
              goToMenu="image">
              Image
            </DropdownItem>
          <DropdownItems leftIcon={<i id="icons" class="fas fa-video" onClick=""></i>}>Video</DropdownItems>
          <DropdownItems leftIcon={<i id="icons" class="fas fa-volume-up"></i>}>Sound</DropdownItems>
          <DropdownItems leftIcon={<i id="icons" class="fas fa-file"></i>}>Document</DropdownItems>
          <DropdownItems onClick={drawText} leftIcon={<i id="icons" class="fas fa-comment-alt" onClick={drawText}></i>}>Textbox</DropdownItems>
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'image'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="media" leftIcon={<i id="icons" class="fas fa-arrow-left"></i>}>
            <h2>Image</h2>
          </DropdownItem>
          <label htmlFor="some-id">
          Image source ->
          </label>
          <input id="some-id" type="text"  onChange={handleImage} value={imgsrc} />
          <DropdownItems
            onClick={addImage}
            leftIcon={<i id="icons" class="fas fa-plus"
            onClick={addImage}></i>}>Add</DropdownItems>

        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'draw'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="shapes" leftIcon={<i id="icons" class="fas fa-arrow-left"></i>}>
            <h2>DRAW!</h2>
          </DropdownItem>
          <b id="colourp">
            <ChromePicker
              color={ colour }
              disableAlpha={ true }
              onChangeComplete={ handleChange }/>
          </b>

          <DropdownItems
            onClick={drawLine}
            leftIcon={<i id="icons" class="fas fa-marker" onClick={drawLine}></i>}>
            Draw</DropdownItems>


          <DropdownItems
             onClick={eraseLine}
            leftIcon={<i id="icons" class="fas fa-eraser"
            onClick={eraseLine}></i>}>Eraser</DropdownItems>

          <DropdownItems
             onClick={stopDrawing}
            leftIcon={<i id="icons" class="fas fa-eraser"
            onClick={stopDrawing}></i>}>Select</DropdownItems>

        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownMenu;
