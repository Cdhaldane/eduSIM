 import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import { TwitterPicker } from 'react-color';
import Slider from 'rc-slider';
import FontPicker from "font-picker-react";
import debounce from 'lodash.debounce';
import DOMPurify from 'dompurify';
import { CompactPicker } from 'react-color';
import { useTranslation } from "react-i18next";

import 'rc-slider/assets/index.css';
import "./DropdownEditObject.css";
import DropdownEditPoll from './DropdownEditPoll';

const DEFAULT_FONT_SIZE = 50;

const DropdownEditObject = (props) => {
  const [activeMenu, setActiveMenu] = useState('main');
  const dropdownRef = useRef(null);
  const [fillColor, setFillColor] = useState("black");
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = React.useState(0);
  const [opacity, setOpacity] = React.useState(1);
  const [font, setFont] = React.useState("Belgrano");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [leftOrRight, setLeftOrRight] = useState(props.left ? { right: "110px", } : { left: "160px" });
  const [loading, setLoading] = useState(true);
  const [shape, setShape] = useState(props.getObj(props.selectedShapeName, false, false));
  const [objState, setObjState] = useState(props.getObjState());
  const { t } = useTranslation();
  const [texts, setTexts] = useState(objState.radioText ? objState.radioText : [])
  const [vTexts, setVTexts] = useState(objState.varName ? objState.varName : [])

  // Input Settings
  const DEFAULT_INPUT_FILL = "#e4e4e4";
  const DEFAULT_INPUT_STROKE_W = 2;
  //const DEFAULT_INPUT_STROKE = "rgb(44, 44, 44)";
  const [inputFillColor, setInputFillColor] = useState(objState.style ?
    (objState.style.backgroundColor ? objState.style.backgroundColor : DEFAULT_INPUT_FILL) : DEFAULT_INPUT_FILL);
  const [inputStrokeWidth, setInputStrokeWidth] = useState(objState.style ?
    (objState.style.borderWidth ? objState.style.borderWidth : DEFAULT_INPUT_STROKE_W) : DEFAULT_INPUT_STROKE_W);
  const [inputCurrentOptions, setInputCurrentOptions] = useState("fill");

  const calcTopOffset = () => {
    const thresholdPx = props.title === "Edit Shape" ? 215 : 165;
    if (props.top < thresholdPx) {
      return thresholdPx - props.top;
    }
  }
  const [topOffset, setTopOffset] = useState(calcTopOffset());

  useEffect(() => {
    if (props.title === "shape") {
      setOpacity(shape.attrs.opacity ? shape.attrs.opacity : 1);
      setStrokeColor(shape.attrs.stroke);
      setFillColor(shape.attrs.fill);
      setStrokeWidth(shape.attrs.strokeWidth);
    } else if (props.title === "text") {
      if (props.font) {
        setFillColor(props.font.attrs.fill);
        setOpacity(props.font.attrs.opacity);
        setFont(props.font.attrs.fontFamily);
        setFontSize(props.font.attrs.fontSize);
      } else {
        console.error("ERROR: No Font.");
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

  const DropdownItem = (props) => {
    return (
      <div className="menu-itemedit" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-buttonedit">{props.leftIcon}</span>
        {props.children}
        <span className="icon-righedit">{props.rightIcon}</span>
      </div>
    );
  }

  const handleChangeF = (e) => {
    setFillColor(e.hex);
    props.handleFillColor(e);
  }

  const handleChangeS = (e) => {
    setStrokeColor(e.hex);
    props.handleStrokeColor(e);
  }

  const onSliderChange = (e) => {
    setStrokeWidth(e);
    props.handleWidth(e);
  }

  const onSliderChangeO = (e) => {
    setOpacity(e);
    props.handleOpacity(e);
  }

  const handleSize = (e) => {
    setFontSize(e.target.value);
    props.handleSize(e.target.value);
  }

  const debounceObjState = useCallback(
    debounce(state => props.updateObjState(state), 100),
    [], // will be created only once initially
  );

  const handleVarLabel = (val) => {
    debounceObjState({ label: val });
    setObjState(prev => ({
      ...prev,
      label: val
    }));
  }
  const handleInputStyle = (type, val) => {
    const style = {
      ...objState.style,
      [type]: val
    }

    setObjState(prev => {
      debounceObjState({
        style: {
          ...style
        }
      });
      return ({
        ...prev,
        style: {
          ...style
        }
      })
    }
    );
  }
  const handleVarName = (val) => {
    debounceObjState({ varName: val });
    setObjState(prev => ({
      ...prev,
      varName: val
    }));
  }
  const handleRadio = (val) => {
    debounceObjState({ amount: val });
    props.updateObjState({ amount: val });
    setObjState(prev => ({
      ...prev,
      amount: val
    }));
  }
  const handleButtonVariable = (val) => {
    debounceObjState({ variableAmount: val });
    props.updateObjState({ variableAmount: val });
    setObjState(prev => ({
      ...prev,
      variableAmount: val
    }));
  }

  const handleVarEnable = (val) => {
    props.updateObjState({ varEnable: val });
    setObjState(prev => ({
      ...prev,
      varEnable: val
    }));
  }
  const handleVarInterval = (val) => {
    props.updateObjState({ varInterval: val });
    setObjState(prev => ({
      ...prev,
      varInterval: val
    }));
  }
  const handleVarType = (val) => {
    props.updateObjState({ varType: val });
    setObjState(prev => ({
      ...prev,
      varType: val
    }));
  }
  const handleIFrameURL = (val) => {
    debounceObjState({ iframeSrc: val });
    setObjState(prev => ({
      ...prev,
      iframeSrc: val
    }));
  }
  const handleHTML = (val) => {
    let sanitized = DOMPurify.sanitize(val);
    debounceObjState({ htmlValue: sanitized });
    setObjState(prev => ({
      ...prev,
      htmlValue: val
    }));
  }
  const handleWidth = (val) => {
    props.updateObjState({ containerWidth: val });
    setObjState(prev => ({
      ...prev,
      containerWidth: val
    }));
  }
  const handleHeight = (val) => {
    props.updateObjState({ containerHeight: val });
    setObjState(prev => ({
      ...prev,
      containerHeight: val
    }));
  }
  const handleProperty = (val, prop) => {
    props.updateObjState({ [prop]: val });
    setObjState(prev => ({
      ...prev,
      [prop]: val
    }));
  }

  const handleTimeLimit = (num, correct = false) => {
    let val = num;
    if (correct && (isNaN(num) || parseInt(num) < 1 || num.length == 0)) {
      val = 1;
    }
    props.updateObjState({ timeLimit: val });
    setObjState(prev => ({
      ...prev,
      timeLimit: val
    }));
  }
  const populateRadio = () => {
    const list = [];
    let value = 0;
    for (let i = 0; i < objState?.amount; i++) {
        list.push(
          <div>
          <input type="text" onChange={e => handleRadioText(e.target)} value={texts[i]} id={i} />
          </div>
      );
    }
    return list
  }

  const handleRadioText = (e) => {
    texts[e.id] = e.value;
    debounceObjState({ radioText: texts });
    setObjState(prev => ({
      ...prev,
      radioText: texts
    }));
  }

  const populateVariable = () => {
    const list = [];
    let value = 0;
    if(objState?.variableAmount < 1){
      let value = 1;
    } else {value = objState?.variableAmount;}
    for (let i = 0; i < value; i++) {
        list.push(
          <div>
          <input type="text" onChange={e => handleVars(e.target)} value={vTexts[i]} id={i} />
          </div>
      );
    }
    return list
  }

  const handleVars = (e) => {
    vTexts[e.id] = e.value;
    debounceObjState({ varName: vTexts });
    setObjState(prev => ({
      ...prev,
      varName: vTexts
    }));
  }





  const newTabInputSettings = (tab) => {
    setInputStrokeWidth(objState.style.borderWidth ?
      parseInt(objState.style.borderWidth.slice(0, -2)) : DEFAULT_INPUT_STROKE_W);
    setInputFillColor(tab === "fill" ? objState.style.backgroundColor :
      (tab === "stroke" ? objState.style.borderColor : objState.style.color));
    setInputCurrentOptions(tab);
  }

  if (!loading) {
    if (props.title === "shape") {
      /* Edit a Shape Object */
      return (
        <div
          className="dropdownedit paddingRight fixed-anim-2"
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
              <h1>{t("edit.shapeEdit")}</h1>
              {!props.selectedShapeName.includes("lines") && (
                <>
                  <b>
                    {t("edit.colorFill")}
                    <TwitterPicker
                      colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                      color={fillColor}
                      triangle="hide"
                      width={350}
                      onChangeComplete={handleChangeF} />
                  </b>
                  <br />
                </>
              )}
              <b>
                {t("edit.colorStroke")}
                <TwitterPicker
                  colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                  color={strokeColor}
                  triangle="hide"
                  width={350}
                  onChangeComplete={handleChangeS} />
              </b>
              <br />
              <b>
                {t("edit.strokeWidth")}
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
                {t("edit.opacity")}
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
              <div className="dropdowncheckbox">
                <input type="checkbox" checked={!!objState?.draggable} onChange={() => handleProperty(!objState?.draggable, 'draggable')} />
                <p>{t("edit.draggable")}</p>
              </div>
              <div className="dropdowncheckbox">
                <input type="checkbox" checked={!!objState?.anchor} onChange={() => handleProperty(!objState?.anchor, 'anchor')} />
                <p>{t("edit.setAsAnchorPoint")}</p>
              </div>
            </div>
          </CSSTransition>
          <CSSTransition
            in={activeMenu === 'shapes'}
            timeout={500}
            classNames="edit-menu-secondary"
            unmountOnExit>
            <div className="menuedit">
              <DropdownItem goToMenu="main" leftIcon={<i id="iconsedit" className="lni lni-arrow-left"></i>}>
                <h2>COLOUR!</h2>
              </DropdownItem>
            </div>
          </CSSTransition>
        </div>
      );
    } else if (props.title === "text") {
      /* Edit a Text Object */
      return (
        <div
          className="dropdownedit paddingRight"
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
              <h1>{t("edit.textEdit")}</h1>
              <b>
                {t("edit.textColor")}
                <TwitterPicker
                  colors={['black', '#FCB900', '#FF6900', '#00D084', '#0693E3',]}
                  color={fillColor}
                  triangle="hide"
                  width={350}
                  onChangeComplete={handleChangeF} />
              </b>
              <br />
              <b>{t("edit.textFont")}</b>

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
                {t("edit.opacity")}
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
              <b>{t("edit.textSize")}</b>
              <input id="sizeinput" type="text" pattern="[0-9]*" onChange={handleSize} value={fontSize} />
            </div>
          </CSSTransition>
        </div>
      );
    } else if (props.title === "poll") {
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
                title={t("edit.pollEdit")}
              />
            </div>
          </CSSTransition>
        </div>
      );
    } else if (props.title === "timer") {
      return (
        <div
          className="dropdownedit timer"
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
              <h1>{t("edit.timerEdit")}</h1>
              <div className="htmliframeinput">
                <input type="checkbox" checked={!!objState?.controls} onChange={() => handleProperty(!objState?.controls, 'controls')} />
                <p>{t("edit.enableControls")}</p>
              </div>
              <div className="htmliframeinput">
                <input type="checkbox" checked={!objState?.invisible} onChange={() => handleProperty(!objState?.invisible, 'invisible')} />
                <p>{t("edit.visible")}</p>
              </div>
              <div className="htmliframeinput">
                <input type="checkbox" checked={!!objState?.timeLimit} onChange={() => handleTimeLimit(!objState?.timeLimit ? 60 : null)} />
                <p>{t("edit.timerCountDown")}</p>
              </div>
              {!!objState?.timeLimit && (
                <>
                  <p>{t("edit.timeLimitSeconds")}</p>
                  <input type="number" onChange={e => handleTimeLimit(e.target.value, true)} value={objState?.timeLimit} placeholder="Time limit" />
                  <p>{t("edit.timerFinishedVariable")}</p>
                  <input type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName || ""} placeholder="Variable name" />
                </>
              )}
              <p>{t("edit.timerStartVariable")}</p>
              <input type="text" onChange={e => handleVarEnable(e.target.value)} value={objState?.varEnable || ""} placeholder="Variable name" />
            </div>
          </CSSTransition>
        </div>
      );
    } else if (props.title === "html") {
      return (
        <div
          className="dropdownedit html"
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
              <h1>{t("edit.htmlEdit")}</h1>
              <div className="htmlwhinput">
                <div>
                  <p>{t("edit.width")}</p>
                  <input type="number" onChange={e => handleWidth(e.target.value)} value={objState?.containerWidth} placeholder="Auto" />
                </div>
                <div>
                  <p>{t("edit.height")}</p>
                  <input type="number" onChange={e => handleHeight(e.target.value)} value={objState?.containerHeight} placeholder="Auto" />
                </div>
              </div>
              <p>{t("edit.htmlContent")}</p>
              <textarea className="htmltextarea" onChange={e => handleHTML(e.target.value)} value={objState?.htmlValue} />
              <p>{t("edit.iframeURL")}</p>
              <input type="text" onChange={e => handleIFrameURL(e.target.value)} value={objState?.iframeSrc} placeholder="URL" />

              <div className="htmliframeinput">
                <input type="checkbox" checked={objState?.varEnable} onChange={() => handleVarEnable(!objState?.varEnable)} />
                <p>{t("edit.listenToMessages")}</p>
              </div>
              <p>{t("edit.variablesToSendCommaSeparated")}</p>
              <input type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} />
              <div className="htmliframeinput">
                <input type="checkbox" checked={objState?.varInterval} onChange={() => handleVarInterval(!objState?.varInterval)} />
                <p>{t("edit.sendAtIntervals")}</p>
              </div>
              <div className="htmliframeinput">
                <input type="checkbox" checked={!!objState?.sync} onChange={() => handleProperty(!objState?.sync, 'sync')} />
                <p>{t("edit.variableSync")}</p>
              </div>
            </div>
          </CSSTransition>
        </div>
      );
    } else if (props.title === "input") {
      return (
        <div
          className={"dropdownedit input " + objState.varType}
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
              <h1>{t("edit.inputEdit")}</h1>
              <p>{t("edit.inputType")}</p>
              <select name="inputtype" onChange={e => handleVarType(e.target.value)} value={objState?.varType}>
                <option value="checkbox">{t("edit.input.checkbox")}</option>
                <option value="text">{t("edit.input.textbox")}</option>
                <option value="button">{t("edit.input.button")}</option>
                <option value="radio">{t("edit.input.radio")}</option>
              </select>
              {objState.infolevel !== true ? (
              <div className="htmliframeinput">
                <input type="checkbox" checked={!!objState?.sync} onChange={() => handleProperty(!objState?.sync, 'sync')} />
                <p>{t("edit.variableSync")}</p>
              </div>
                ) :
                (
                  <div className="htmliframeinput">
                    <input type="checkbox" disabled={true} checked={false} onChange={() => handleProperty(!objState?.sync, 'sync')} />
                    <p>{t("edit.variableSync")}</p>
                  </div>
                )}
                {objState?.varType === "radio" ? (
                  <div className="radio-dropdown">
                  <p>{t("edit.radioAmount")}</p>
                    <input type="text" value={objState?.amount} placeholder={3} onChange={e => handleRadio(e.target.value)}  maxlength="1"/>
                    <p>{t("edit.radioText")}</p>
                    {populateRadio()}
                  </div>
                ) :
                (<div> </div>)
              }
              {objState?.varType === "button" ? (
                <div className="radio-dropdown">
                <p>{t("edit.buttonAmount")}</p>
                  <input type="text" value={objState?.variableAmount} placeholder={1} onChange={e => handleButtonVariable(e.target.value)} maxlength="1" />
                  <p>{t("edit.variableNameToSet")}</p>
                  {populateVariable()}

                </div>
              ) :
              (<div> <p>{t("edit.variableNameToSet")}</p>
              <input type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} /></div>)
            }
              <p>{t("edit.label")}</p>
              <input type="text" onChange={e => handleVarLabel(e.target.value)} value={objState?.label} />
              {objState.varType !== "checkbox" && (
                <>
                  <div>
                    <button
                      className={`${inputCurrentOptions === "fill" ? "editInputOptionSelected" : ""}`}
                      onClick={() => newTabInputSettings("fill")}
                    >
                      {t("edit.colorFill")}
                    </button>
                    <button
                      className={`${inputCurrentOptions === "stroke" ? "editInputOptionSelected" : ""}`}
                      onClick={() => newTabInputSettings("stroke")}
                    >
                      {t("edit.colorStroke")}
                    </button>
                    <button
                      className={`${inputCurrentOptions === "text" ? "editInputOptionSelected" : ""}`}
                      onClick={() => newTabInputSettings("text")}
                    >
                      {t("edit.shape.text")}
                    </button>
                  </div>
                  {inputCurrentOptions === "fill" && (
                    <CompactPicker
                      className="compactPickerEditInput"
                      color={inputFillColor}
                      disableAlpha={true}
                      onChange={(color) => {
                        setInputFillColor(color.hex);
                        handleInputStyle("backgroundColor", color.hex);
                      }}
                      style={{
                        boxShadow: "none"
                      }}
                    />
                  )}
                  {inputCurrentOptions === "stroke" && (
                    <>
                      <CompactPicker
                        className="compactPickerEditInput"
                        color={inputFillColor}
                        disableAlpha={true}
                        onChange={(color) => {
                          setInputFillColor(color.hex);
                          handleInputStyle("borderColor", color.hex);
                        }}
                      />
                      <span>{t("edit.strokeWidth")}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={inputStrokeWidth}
                        className="inputEditSlider"
                        onChange={(e) => {
                          setInputStrokeWidth(e.target.value);
                          handleInputStyle("borderWidth", e.target.value + "px");
                        }}
                      />
                    </>
                  )}
                  {inputCurrentOptions === "text" && (
                    <>
                      <CompactPicker
                        className="compactPickerEditInput"
                        color={inputFillColor}
                        disableAlpha={true}
                        onChange={(color) => {
                          setInputFillColor(color.hex);
                          handleInputStyle("color", color.hex);
                        }}
                      />
                    </>
                  )}
                </>
              )}
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
