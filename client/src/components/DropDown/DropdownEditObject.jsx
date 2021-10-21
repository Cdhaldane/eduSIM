import React, { useState, useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { TwitterPicker } from 'react-color';
import Slider from 'rc-slider';
import FontPicker from "font-picker-react";

import 'rc-slider/assets/index.css';
import "./DropdownEditObject.css";

const DEFAULT_FONT_SIZE = 50;

function DropdownEditObject(props) {
  const [activeMenu, setActiveMenu] = useState('main');
  const dropdownRef = useRef(null);
  const [fillColor, setFillColor] = useState("");
  const [strokeColor, setStrokeColor] = useState("");
  const [strokeWidth, setStrokeWidth] = React.useState(0);
  const [opacity, setOpacity] = React.useState(1);
  const [font, setFont] = React.useState("");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [leftOrRight, setLeftOrRight] = useState(props.left ? { right: "110px", } : { left: "160px" });
  const [loading, setLoading] = useState(true);

  const calcTopOffset = () => {
    const thresholdPx = props.title === "Edit Shape" ? 215 : 165;
    if (props.top < thresholdPx) {
      return thresholdPx - props.top;
    }
  }
  const [topOffset, setTopOffset] = useState(calcTopOffset());

  useEffect(() => {
    if (props.title === "Edit Shape") {
      setOpacity(props.shape.attrs.opacity ? props.shape.attrs.opacity : 1);
      setStrokeColor(props.shape.attrs.stroke);
      setFillColor(props.shape.attrs.fill);
      setStrokeWidth(props.shape.attrs.strokeWidth);
    } else if (props.title === "Edit Text") {
      if (props.font) {
        setFillColor(props.font.attrs.fill);
        setOpacity(props.font.attrs.opacity);
        setFont(props.font.attrs.fontFamily);
        setFontSize(props.font.attrs.fontSize);
      } else {
        console.log("No Font Error!");
      }
    } else if (props.title === "Edit Poll") {

    }

    setLoading(false);
  }, []);

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
    setFillColor(e);
    props.handleFillColor(e);
  }

  function handleChangeS(e) {
    setStrokeColor(e);
    props.handleStrokeColor(e);
  }

  function onSliderChange(e) {
    setStrokeWidth(e);
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

  if (!loading) {
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
                  color={fillColor}
                  triangle="hide"
                  width={350}
                  onChangeComplete={handleChangeF} />
              </b>
              <br />
              <b>
                Stroke:
                <TwitterPicker
                  colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                  color={strokeColor}
                  triangle="hide"
                  width={350}
                  onChangeComplete={handleChangeS} />
              </b>
              <br />
              <b>
                Stroke width:
                <Slider
                  min={0}
                  max={30}
                  step={0.01}
                  className="slider"
                  value={strokeWidth}
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
      );
    } else if (props.title === "Edit Text") {
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
                  color={fillColor}
                  triangle="hide"
                  width={350}
                  onChangeComplete={handleChangeF} />
              </b>
              <br />
              <b>Text Font:</b>

              <b id="fontpick">
                {font && (
                  <FontPicker
                    apiKey="AIzaSyCvq0AcfmcAeJeJ7-IZwi0JGjeTYBhWghU"
                    activeFontFamily={font}
                    onChange={(nextFont) => {
                      setFont(nextFont.family);
                      props.handleFont(nextFont.family);
                    }}
                  />
                )}
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
      );
    } else if (props.title === "Edit Poll") {
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
              <b>Text Size:</b>
              <input id="sizeinput" type="text" pattern="[0-9]*" onChange={handleSize} value={fontSize} />
            </div>
          </CSSTransition>
        </div>
      );
    }
  } else {
    return null;
  }
}

export default DropdownEditObject;
