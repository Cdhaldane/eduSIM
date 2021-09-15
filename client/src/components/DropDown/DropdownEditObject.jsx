import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { TwitterPicker } from 'react-color';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import FontPicker from "font-picker-react";
import "./DropdownEditObject.css";

function DropdownEditObject(props) {
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);
  const [colourf, setColourf] = useState("");
  const [colours, setColours] = useState("");
  const [value, setValue] = React.useState(20);
  const [valueO, setValueO] = React.useState(1);
  const [font, setFont] = React.useState("Choose a font!")
  const [fontSize, setFontSize] = useState("50")

  function handleChangeF(e) {
    setColourf(e);
    props.choosecolorf(e);
  };

  function handleChangeS(e) {
    setColours(e);
    props.choosecolors(e);
  };

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight);
  }, []);

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function DropdownItem(props) {
    return (
      <div className="menu-itemedit" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-buttonedit">{props.leftIcon}</span>
        {props.children}
        <span className="icon-righedit">{props.rightIcon}</span>
      </div>
    );
  }

  /*function DropdownItems(props) {
    return (
      <div className="menu-itemedit" onClick={props.onClick}>
        <span className="icon-buttonedit">{props.leftIcon}</span>
        {props.children}
        <span className="icon-rightedit">{props.rightIcon}</span>
      </div>
    );
  }*/

  function onSliderChange(e) {
    setValue(e);
    props.handleWidth(e);
  }

  function onSliderChangeO(e) {
    setValueO(e);
    props.handleOpacity(e);
  }

  function handleSize(e) {
    setFontSize(e.target.value);
    props.handleSize(e.target.value);
  }

  if (props.title === "Edit Shape") {
    /* Edit a Shape Object */
    return (
      <div className="dropdownedit" style={{ height: menuHeight }} ref={dropdownRef}>
        <CSSTransition
          in={activeMenu === 'main'}
          timeout={500}
          classNames="edit-menu-primary"
          unmountOnExit
          onEnter={calcHeight}>
          <div className="menuedit">
            <h1>{props.title}</h1>
            <b>
              Fill:
              <TwitterPicker
                colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                color={colourf}
                triangle="Fill"
                width={350}
                onChangeComplete={handleChangeF} />
            </b>
            <br />
            <b>
              Stroke:
              <TwitterPicker
                colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                color={colours}
                triangle="Fill"
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
          classNames="edit-menu-secondary"
          unmountOnExit
          onEnter={calcHeight}>
          <div className="menuedit">
            <DropdownItem goToMenu="main" leftIcon={<i id="iconsedit" className="fas fa-arrow-left"></i>}>
              <h2>COLOUR!</h2>
            </DropdownItem>
          </div>
        </CSSTransition>
      </div>
    )
  } else {
    /* Edit a text Object */
    return (
      <div className="dropdownedit" style={{ height: menuHeight }} ref={dropdownRef}>
        <CSSTransition
          in={activeMenu === 'main'}
          timeout={500}
          classNames="edit-menu-primary"
          unmountOnExit
          onEnter={calcHeight}>
          <div className="menuedit">
            <h1>{props.title}</h1>
            <b>
              Text Color:
              <TwitterPicker
                colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                color={colourf}
                triangle="Fill"
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
                  setFont(nextFont.family)
                  props.handleFont(nextFont.family)
                }}
              />
            </b>
            <br />
            <b id="text">
              <br />
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
