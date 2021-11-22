import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import { TwitterPicker } from 'react-color';
import Slider from 'rc-slider';
import FontPicker from "font-picker-react";
import debounce from 'lodash.debounce';
import DOMPurify from 'dompurify';

import 'rc-slider/assets/index.css';
import "./DropdownEditObject.css";
import DropdownEditPoll from './DropdownEditPoll';

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
  const [shape, setShape] = useState(props.getObj(props.selectedShapeName, false, false));
  const [objState, setObjState] = useState(props.getObjState());

  const calcTopOffset = () => {
    const thresholdPx = props.title === "Edit Shape" ? 215 : 165;
    if (props.top < thresholdPx) {
      return thresholdPx - props.top;
    }
  }
  const [topOffset, setTopOffset] = useState(calcTopOffset());

  useEffect(() => {
    if (props.title === "Edit Shape") {
      setOpacity(shape.attrs.opacity ? shape.attrs.opacity : 1);
      setStrokeColor(shape.attrs.stroke);
      setFillColor(shape.attrs.fill);
      setStrokeWidth(shape.attrs.strokeWidth);
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

  const debounceObjState = useCallback(
		debounce(state => props.updateObjState(state), 100),
		[], // will be created only once initially
	);

  function handleVarLabel(val) {
    debounceObjState({ label: val });
    setObjState(prev => ({
      ...prev,
      label: val
    }));
  }
  function handleVarName(val) {
    debounceObjState({ varName: val });
    setObjState(prev => ({
      ...prev,
      varName: val
    }));
  }
  function handleVarEnable(val) {
    props.updateObjState({ varEnable: val });
    setObjState(prev => ({
      ...prev,
      varEnable: val
    }));
  }
  function handleVarInterval(val) {
    props.updateObjState({ varInterval: val });
    setObjState(prev => ({
      ...prev,
      varInterval: val
    }));
  }
  function handleVarType(val) {
    props.updateObjState({ varType: val });
    setObjState(prev => ({
      ...prev,
      varType: val
    }));
  }
  function handleIFrameURL(val) {
    debounceObjState({ iframeSrc: val });
    setObjState(prev => ({
      ...prev,
      iframeSrc: val
    }));
  }
  function handleHTML(val) {
    let sanitized = DOMPurify.sanitize(val);
    debounceObjState({ htmlValue: sanitized });
    setObjState(prev => ({
      ...prev,
      htmlValue: val
    }));
  }
  function handleWidth(val) {
    props.updateObjState({ containerWidth: val });
    setObjState(prev => ({
      ...prev,
      containerWidth: val
    }));
  }
  function handleHeight(val) {
    props.updateObjState({ containerHeight: val });
    setObjState(prev => ({
      ...prev,
      containerHeight: val
    }));
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
                  max={100}
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
              <DropdownEditPoll
                setData={props.setPollData}
                shape={shape}
                title={props.title}
              />
            </div>
          </CSSTransition>
        </div>
      );
    } else if (props.title === "Edit HTML") {
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
            <div className="menuedit htmledit">
              <h1>{props.title}</h1>
              <div className="htmlwhinput">
                <div>
                  <p>Width</p>
                  <input type="number" onChange={e => handleWidth(e.target.value)} value={objState?.containerWidth} placeholder="Auto"/>
                </div>
                <div>
                  <p>Height</p>
                  <input type="number" onChange={e => handleHeight(e.target.value)} value={objState?.containerHeight} placeholder="Auto"/>
                </div>
              </div>
              <p>HTML Content:</p>
              <textarea className="htmltextarea" onChange={e => handleHTML(e.target.value)} value={objState?.htmlValue}/>
              <p>iFrame URL:</p>
              <input type="text" onChange={e => handleIFrameURL(e.target.value)} value={objState?.iframeSrc} placeholder="URL" />
              
              <div className="htmliframeinput">
                <input type="checkbox" checked={objState?.varEnable} onChange={() => handleVarEnable(!objState?.varEnable)} />
                <p>Listen to messages</p>
              </div>
              <p>Variables to send (separated by commas):</p>
              <input type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} />
              <div className="htmliframeinput">
                <input type="checkbox" checked={objState?.varInterval} onChange={() => handleVarInterval(!objState?.varInterval)} />
                <p>Send at intervals</p>
              </div>
            </div>
          </CSSTransition>
        </div>
      );
    } else if (props.title === "Edit Input") {
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
            <div className="menuedit htmledit">
              <h1>{props.title}</h1>
              <p>Input type:</p>
              <select name="inputtype" onChange={e => handleVarType(e.target.value)} value={objState?.varType}>
                <option value="checkbox">Checkbox</option>
                <option value="text">Text</option>
                <option value="button">Button</option>
              </select>
              <p>Variable name to set:</p>
              <input type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} />
              <p>Label:</p>
              <input type="text" onChange={e => handleVarLabel(e.target.value)} value={objState?.label} />
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
