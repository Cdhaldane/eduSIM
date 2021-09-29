import React, { useState, useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { TwitterPicker } from 'react-color';
import Slider from 'rc-slider';
import FontPicker from "font-picker-react";

import 'rc-slider/assets/index.css';
import "./DropdownEditObject.css";

function DropdownEditObject(props) {
  const [activeMenu, setActiveMenu] = useState('main');
  const dropdownRef = useRef(null);
  const [colourf, setColourf] = useState(props.font ? props.font.fill() : "");
  const [colours, setColours] = useState("");
  const [value, setValue] = React.useState(20);
  const [opacity, setOpacity] = React.useState(props.font ? props.font.opacity() : 1);
  const [font, setFont] = React.useState(props.font ? props.font.fontFamily() : "Open Sans");
  const [fontSize, setFontSize] = useState(props.font ? props.font.fontSize() : "50");
  const [leftOrRight, setLeftOrRight] = useState(props.left ? { right: "110px", } : { left: "160px" });
  
  console.log(props.font);

  const calcTopOffset = () => {
    const thresholdPx = props.title === "Edit Shape" ? 215 : 165;
    if (props.top < thresholdPx) {
      return thresholdPx - props.top;
    }
  }
  const [topOffset, setTopOffset] = useState(calcTopOffset());

  // Slider Styles
  const railStyle = {
    height: 4,
    marginTop: 14,
  };
  const handleStyle = {
    height: 28,
    width: 28,
    marginTop: 0,
    backgroundColor: "black",
    border: 0,
  };
  const trackStyle = {
    marginTop: 14,
    background: "red"
  };

  function DropdownItem(props) {
    return (
      <div className="menu-itemedit" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-buttonedit">{props.leftIcon}</span>
        {props.children}
        <span className="icon-righedit">{props.rightIcon}</span>
      </div>
    );
  }

  function handleChangeF(e) {
    setColourf(e);
    props.choosecolorf(e);
  }

  function handleChangeS(e) {
    setColours(e);
    props.choosecolors(e);
  }

  function onSliderChange(e) {
    setValue(e);
    props.handleWidth(e);
  }

  function onSliderChangeO(e) {
    setOpacity(e);
    props.handleOpacity(e);
  }

  function handleSize(e) {
    setFontSize(e.target.value);
    props.handleSize(e.target.value);
  }

  if (props.title === "Edit Shape") {
    /* Edit a Shape Object */
    return (
      <div
        className="dropdownedit"
        ref={dropdownRef}
        style={{
          ...leftOrRight,
          transform: `translateY(${topOffset}px)`
        }}>
        <CSSTransition
          in={activeMenu === 'main'}
          timeout={500}
          classNames="edit-menu-primary"
          unmountOnExit>
          <div className="menuedit">
            <h1>{props.title}</h1>
            <b>
              Fill:
              <TwitterPicker
                colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                color={colourf}
                triangle="hide"
                width={350}
                onChangeComplete={handleChangeF} />
            </b>
            <br />
            <b>
              Stroke:
              <TwitterPicker
                colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                color={colours}
                triangle="hide"
                width={350}
                onChangeComplete={handleChangeS} />
            </b>
            <br />
            <b>
              Stroke width:
              <Slider
                className="slider"
                value={value}
                onChange={onSliderChange}
                railStyle={railStyle}
                handleStyle={handleStyle}
                trackStyle={trackStyle}
              />
            </b>
            <br />
            <b>
              Opacity:
              <Slider
                className="slider"
                value={opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={onSliderChangeO}
                railStyle={railStyle}
                handleStyle={handleStyle}
                trackStyle={trackStyle}
              />
            </b>
            <br />
          </div>
        </CSSTransition>
        <CSSTransition
          in={activeMenu === 'shapes'}
          timeout={500}
          classNames="edit-menu-secondary"
          unmountOnExit>
          <div className="menuedit">
            <DropdownItem goToMenu="main" leftIcon={<i id="iconsedit" className="fas fa-arrow-left"></i>}>
              <h2>COLOUR!</h2>
            </DropdownItem>
          </div>
        </CSSTransition>
      </div>
    )
  } else {
    /* Edit a Text Object */
    return (
      <div
        className="dropdownedit"
        ref={dropdownRef}
        style={{
          ...leftOrRight,
          transform: `translateY(${topOffset}px)`
        }}>
        <CSSTransition
          in={activeMenu === 'main'}
          timeout={500}
          classNames="edit-menu-primary"
          unmountOnExit>
          <div className="menuedit">
            <h1>{props.title}</h1>
            <b>
              Text Color:
              <TwitterPicker
                colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                color={colourf}
                triangle="hide"
                width={350}
                onChangeComplete={handleChangeF} />
            </b>
            <br />
            <b>Text Font:</b>

            <b id="fontpick">
              <FontPicker
                apiKey="AIzaSyCvq0AcfmcAeJeJ7-IZwi0JGjeTYBhWghU"
                activeFontFamily={font}
                onChange={(nextFont) => {
                  setFont(nextFont.family);
                  props.handleFont(nextFont.family);
                }}
              />
            </b>
            <br />
            <b id="text">
              <br />
              Opacity:
              <Slider
                className="slider"
                value={opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={onSliderChangeO}
                railStyle={railStyle}
                handleStyle={handleStyle}
                trackStyle={trackStyle}
              />
            </b>
            <br />
            <br />
            <b>Text Size:</b>
            <input id="sizeinput" type="text" pattern="[0-9]*" onChange={handleSize} value={fontSize} />
          </div>
        </CSSTransition>
      </div>
    )
  }
}

export default DropdownEditObject;
