import React, { useState, useEffect, useRef } from 'react';
import Note from "../Note/Note";
import { CSSTransition } from 'react-transition-group';
import Stages from "../Stage/Stage"


import "./Dropdown.css";

  function DropdownMenu(props) {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [ components, setComponents ] = useState();
    const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight)
  }, [])

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
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
  }
  function addRectangle(){
    props.addRectangle();
  }
  function drawLine(){
    props.drawLine();
  }
  function drawText(){
    props.drawLine();
  }
  function drawImage(){
    props.drawLine();
  }
  function eraseLine(){
    props.eraseLine();
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
          <DropdownItems onClick="" leftIcon={<i id="iconst" class="fa fa-caret-up fa-2x" onClick=""></i>}>Triangle</DropdownItems>
          <DropdownItems onClick="" leftIcon={<i id="icons" class="fas fa-times" onClick=""></i>}>Cross</DropdownItems>
          <DropdownItems onClick="" leftIcon={<i id="icons" class="fa fa-star" onClick=""></i>}>Star</DropdownItems>
          <DropdownItems onClick={drawLine} leftIcon={<i id="icons" class="fas fa-marker" onClick={drawLine}></i>}>Draw</DropdownItems>
        <DropdownItems onClick={eraseLine} leftIcon={<i id="icons" class="fas fa-eraser" onClick={eraseLine}></i>}>Eraser</DropdownItems>
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
          <DropdownItem leftIcon={<i id="icons" class="fa fa-picture-o" onClick={drawImage}></i>}>Image</DropdownItem>
        <DropdownItem leftIcon={<i id="icons" class="fas fa-video" onClick=""></i>}>Video</DropdownItem>
          <DropdownItem leftIcon={<i id="icons" class="fas fa-volume-up"></i>}>Sound</DropdownItem>
          <DropdownItem leftIcon={<i id="icons" class="fas fa-file"></i>}>Document</DropdownItem>
        <DropdownItem leftIcon={<i id="icons" class="fas fa-text" onClick={drawText}></i>}>Textbox</DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownMenu;
