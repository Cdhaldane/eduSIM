import React, { useState, useEffect, useRef } from 'react';
import Note from "../Note/Note";
import { CSSTransition } from 'react-transition-group';
import Stages from "../Stage/Stage"
import { TwitterPicker } from 'react-color';
import Switch from "react-switch"
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';



import "./Dropdownedit.css";

  function DropdownMenu(props) {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [ components, setComponents ] = useState();
    const dropdownRef = useRef(null);
    const [colourf, setColourf] = useState("");
    const [colours, setColours] = useState("");
    const [checkedd, setCheckedd] = useState(false);
    const [checkede, setCheckede] = useState(false);
    const [value, setValue] = React.useState(30);
    const [valueO, setValueO] = React.useState(1);

    function handleChangeF(e){
      setColourf(e);
      props.choosecolorf(e);
    };

    function handleChangeS(e){
      setColours(e);
      props.choosecolors(e);
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
      <a href="#" className="menu-itemedit" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-buttonedit">{props.leftIcon}</span>
        {props.children}
        <span className="icon-righedit">{props.rightIcon}</span>
      </a>
    );
  }


    function DropdownItems(props) {
      return (
        <a href="#" className="menu-itemedit" onClick={props.onClick}>
          <span className="icon-buttonedit">{props.leftIcon}</span>
          {props.children}
          <span className="icon-rightedit">{props.rightIcon}</span>
        </a>
      );
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
  function drawLine(){
    setCheckedd(!checkedd)
    props.drawLine();
  }
  function drawText(){
    props.drawText();
  }
  function drawImage(){
    props.drawImage();
  }
  function eraseLine(){
    setCheckede(!checkede)
    props.eraseLine();
  }

  function onSliderChange(e){
    setValue(e);
    props.handleWidth(e);
  };

  function onSliderChangeO(e){
    setValueO(e);
    props.handleOpacity(e);
  };

 return (
     <div className="dropdownedit" style={{ height: menuHeight }} ref={dropdownRef}>
       <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menuedit">
          <h1>{props.title}</h1>
          <b>
          Fill:
          <TwitterPicker
            colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
            color={ colourf }
            triangle="Fill"
            width={350}
            onChangeComplete={ handleChangeF }/>
          </b>
          <br />
            <b>
            Stroke:
            <TwitterPicker
              colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
              color={ colours }
              triangle="Fill"
              width={350}
              onChangeComplete={ handleChangeS }/>
            </b>
            <br />
          <b>
          Stroke width:
          <Slider
            className="slider"
            value={value}
            onChange={onSliderChange}
            railStyle={{
              height: 4,
              marginTop: 14,
              width: 400
            }}
            handleStyle={{
              height: 28,
              width: 28,
              marginTop: 0,
              backgroundColor: "black",
              border: 0,

            }}
            trackStyle={{
              marginTop: 14,
              background: "red"
            }}
          />

        </b>
        <br />
        <b>
        Opacity:
        <Slider
          className="slider"
          value={valueO}
          min={0}
          max={1}
          step={0.01}
          onChange={onSliderChangeO}
          railStyle={{
            height: 4,
            marginTop: 14,
            width: 400
          }}
          handleStyle={{
            height: 28,
            width: 28,
            marginTop: 0,
            backgroundColor: "black",
            border: 0,

          }}
          trackStyle={{
            marginTop: 14,
            background: "red"
          }}
        />

      </b>
      <br />

        </div>

      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'shapes'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menuedit">
          <DropdownItem goToMenu="main" leftIcon={<i id="iconsedit" class="fas fa-arrow-left"></i>}>
            <h2>COLOUR!</h2>
          </DropdownItem>








        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownMenu;
