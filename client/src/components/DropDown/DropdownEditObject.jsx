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


import Left from "../../../public/icons/arrow-left.svg"

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
  const [texts, setTexts] = useState("")
  const [vTexts, setVTexts] = useState(objState.varName ? objState.varName : [])

  const [vTextsV, setVTextsV] = useState(objState.varValue ? objState.varValue : [])
  const [varOne, setVarOne] = useState(objState.varOne ? objState.varOne : "")
  const [varTwo, setVarTwo] = useState(objState.varTwo ? objState.varTwo : "")

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
    if (!objState.volume) {
      props.updateObjState({ volume: 1 });
      setObjState(prev => ({
        ...prev,
        volume: 1
      }));
    }
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

  useEffect(() => {
    // setTexts([])
  }, [activeMenu])

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

  const onSliderChangeV = (e) => {
    props.updateObjState({ volume: e });
    setObjState(prev => ({
      ...prev,
      volume: e
    }));
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
  const handleButtonCondition = (val) => {
    debounceObjState({ conditionAmount: val });
    props.updateObjState({ conditionAmount: val });
    setObjState(prev => ({
      ...prev,
      conditionAmount: val
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
    for (let i = 0; i < (objState?.amount ? objState?.amount : 0); i++) {
      list.push(
        <div>
          <input type="text" onChange={e => handleRadioText(e.target)} value={objState?.radioText ? objState?.radioText[i] : texts[i]} id={i} key={i} placeholder={t("edit.radioText")} />
        </div>
      );
    }
    return list
  }

  const handleRadioText = (e) => {
    let arr = []
    for (let i = 0; i < (objState?.amount ? objState?.amount : 0); i++) {
      if (e.id != i) {
        arr[i] = objState?.radioText ? objState?.radioText[i] : texts[i]
      }
    }
    arr[e.id] = e.value;
    props.updateObjState({ radioText: arr });
    debounceObjState({ radioText: arr });
    setObjState(prev => ({
      ...prev,
      radioText: arr
    }));

  }

  const populateVariable = () => {
    const list = [];
    let value = 0;
    if (objState?.variableAmount >= 1) {
      value = objState?.variableAmount
    }
    for (let i = 0; i < value; i++) {
        list.push(
          <div className = "button-vars">
          <input className="float-left" type="text" onChange={e => handleVars(e.target)} id={i} value={objState.varName ? objState.varName[i] : ""} placeholder="variable"/>
          <h1>=</h1>
        <input className="float-righty" type="text" onChange={e => handleVarValue(e.target)} id={i} value={objState.varValue ? objState.varValue[i] : ""}  placeholder="value"/>
          </div>
      );
    }
    return list
  }

  const populateConditions = () => {
    const list = [];
    let value = 0;
    if(objState?.conditionAmount < 1){
      let value = 1;
    } else {value = objState?.conditionAmount}
    for (let i = 0; i < value; i++) {
      list.push(
        <div  key={i} className="button-vars">
          <input
            className="float-left"
            type="text"
            onChange={e => handleVars(e.target)}
            id={i}
            value={objState.varName ? objState.varName[i] : ""}
            placeholder="variable" />
          <h1>=</h1>
          <input
            className="float-righty"
            type="text"
            onChange={e => handleVarValue(e.target)}
            id={i}
            value={objState.varValue ? objState.varValue[i] : ""}
            placeholder="value" />
        </div>
      );
    }
    return list;
  }

  const handleVarConditions = (e) => {
    let value = 0;
    if(objState?.conditionAmount < 1){
      let value = 1;
    } else {value = objState?.conditionAmount}

    let arr = []
    if(  objState?.varCon){
      for (let i = 0; i < value; i++) {
          if(e.id != i){
            arr[i] = objState?.varCon[i]
          }
      }
    }
    arr[e.id] = e.value;
    props.updateObjState({ varCon: arr });
    debounceObjState({ varCon: arr });
    setObjState(prev => ({
      ...prev,
      varCon: arr
    }));
  }


  const handleVars = (e) => {
    let value = 0;
    if (objState?.variableAmount < 1) {
      let value = 1;
    } else {value = objState?.variableAmount}
    let arr = []
    if( objState?.varName ){
      for (let i = 0; i < value; i++) {
          if(e.id != i){
            arr[i] = objState?.varName[i]
          }
      }
    }
    arr[e.id] = e.value;
    props.updateObjState({ varName: arr });
    debounceObjState({ varName: arr });
    setObjState(prev => ({
      ...prev,
      varName: arr
    }));
  }


  const handleVarValue = (e) => {
    let val;
    if (isNaN(val)) {
      val = e.value;
    } else {
      val = parseInt(e.value)
    }
    let value = 0;
    if (objState?.variableAmount < 1) {
      let value = 1;
    } else { value = objState?.variableAmount }

    let arr = []

    if(objState?.varValue){
      for (let i = 0; i < value; i++) {
          if(e.id != i){
            arr[i] = objState?.varValue[i]
          }

      }
    }
    arr[e.id] = val;
    props.updateObjState({ varValue: arr });
    debounceObjState({ varValue: arr });
    setObjState(prev => ({
      ...prev,
      varValue: arr
    }));
  }

  const handleMathOne = (e) => {
    let value = e.value;
    if (parseInt(e.value)) {
      value = parseInt(e.value)
    }
    props.updateObjState({ varOne: value });
    debounceObjState({ varOne: value });
    setObjState(prev => ({
      ...prev,
      varOne: value
    }));
  }
  const handleConEquals = (e) => {
    let val;
    if(isNaN(val)){
      val = e.value;
    } else {
      val = parseInt(e.value)
    }
    let value = 0;
    if(objState?.conditionAmount < 1){
      let value = 1;
    } else {value = objState?.conditionAmount}

    let arr = []
    if( objState?.conEquals ) {
      for (let i = 0; i < value; i++) {
          if(e.id != i){
            arr[i] = objState?.conEquals[i]
          }
      }
    }
    arr[e.id] = val;
    props.updateObjState({ conEquals: arr });
    debounceObjState({ conEquals: arr });
    setObjState(prev => ({
      ...prev,
      conEquals: arr
    }));
  }
  const handleMathTwo = (e) => {
    let value = e.value;
    if (parseInt(e.value)) {
      value = parseInt(e.value)
    }
    props.updateObjState({ varTwo: value });
    debounceObjState({ varTwo: value });
    setObjState(prev => ({
      ...prev,
      varTwo: value
    }));
  }
  const handleMath = (e) => {
    props.updateObjState({ math: e });
    debounceObjState({ math: e });
    setObjState(prev => ({
      ...prev,
      math: e
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
              {!((objState?.id).includes("videos") || (objState?.id).includes("audios")) && (
                <>
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
                </>
              )}
              {(objState?.id).includes("videos") || (objState?.id).includes("audios") ? (
                <div>
                  <div>

                    <b>
                      {t("edit.volume")}
                      <Slider
                        className="slider"
                        value={objState?.volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={onSliderChangeV}
                        railStyle={railStyle}
                        handleStyle={handleStyle}
                        trackStyle={trackStyle}
                      />
                    </b>
                    <br />
                  </div>
                  <div className="dropdowncheckbox">
                    <input type="checkbox" checked={!!objState?.autoStart} onChange={() => handleProperty(!objState?.autoStart, 'autoStart')} />
                    <p>{t("edit.autoStart")}</p>
                  </div>
                  <div className="dropdowncheckbox">
                    <input type="checkbox" checked={!!objState?.loop} onChange={() => handleProperty(!objState?.loop, 'loop')} />
                    <p>{t("edit.loop")}</p>
                  </div>
                </div>
              ) :
                (<div> </div>)
              }
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
              <DropdownItem goToMenu="main" leftIcon={<i><Left id="iconsedit" /></i>}>
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
                setData={props.setCustomObjData}
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
              <div className="htmliframeinput">
                <input type="checkbox" checked={!!objState?.sync} onChange={() => handleProperty(!objState?.sync, 'sync')} />
                <p>{t("edit.variableSync")}</p>
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
          className="dropdownedit input"
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
                <option value="variable">{t("edit.input.variable")}</option>
              </select>

              <div className="htmliframeinput">
                <input type="checkbox" checked={!!objState?.sync} onChange={() => handleProperty(!objState?.sync, 'sync')} />
                <p>{t("edit.variableSync")}</p>
              </div>

              {objState?.varType === "radio" ? (
                <div className="radio-dropdown">
                  <p>{t("edit.radioAmount")}</p>
                  <input type="text" value={objState?.amount} placeholder={3} onChange={e => handleRadio(e.target.value)} maxLength="1" />
                  <p>{t("edit.variableNameToSet")}</p>
                  <input className="margin-bottom" type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} />

                  <p>{t("edit.radioText")}</p>
                  {populateRadio()}
                </div>
              ) :
                (<div> </div>)
              }
              {objState?.varType === "text" ? (
               <div className="radio-dropdown">
               <p>{t("edit.variableNameToSet")}</p>
               <input className="margin-bottom" type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} />
               </div>
             ) :
             (<div> </div>)
           }
           {objState?.varType === "checkbox" ? (
             <div className="radio-dropdown">
             <p>{t("edit.variableNameToSet")}</p>
             <input className="margin-bottom" type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} />
             </div>
           ) :
           (<div> </div>)
         }
              {objState?.varType === "variable" ? (
                 <div className="radio-dropdown">
                   <div className="radio-conditional">
                     <input type="checkbox" checked={!!objState?.conditional} onChange={() => handleProperty(!objState?.conditional, 'conditional')} />
                       <p>{t("edit.ifStatement")}</p>
                   </div>
                 <p>{t("edit.variableNameToSet")}</p>
                 <input className="margin-bottom" type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} />

               {objState?.conditional ? (<div></div>) : (<div><h1>{t("edit.random")}</h1></div>) }
               {objState?.conditional ? (<div className="radio-conditional">
                 <input className="margin-bottom" type="text" value={objState?.conditionAmount} placeholder={1} onChange={e => handleButtonCondition(e.target.value)} maxlength="1" />
                   {populateConditions()}
                 </div>) : (<div className = "button-vars">
                 <input className="float-left math" type="text" onChange={e => handleMathOne(e.target)} value={objState?.varOne} placeholder={t("edit.input.varVal")}/>
                 <select id="math" className="float-left math-drop" value={objState?.math} onChange={e => handleMath(e.target.value)}>
                   <option value="">select option</option>
                   <option value="add">Add</option>
                   <option value="subtract">Subtract</option>
                   <option value="multiply">Multiply</option>
                   <option value="divide">Divide</option>
                 </select>
                 <input className="float-righty mathy" type="text" onChange={e => handleMathTwo(e.target)} value={objState?.varTwo}  placeholder={t("edit.input.varVal")}/>
                 </div>) }
                 </div>
               ) :
               (<div> </div>)
             }
              {objState?.varType === "button" ? (
                <div className="radio-dropdown">
                  <div className="htmliframeinput">
                    <input type="checkbox" checked={!!objState?.incr} onChange={() => handleProperty(!objState?.incr, 'incr')} />
                    <p>Incremental button</p>
                  </div>
                  {!objState?.incr ? (
                    <div>
                      <p>{t("edit.buttonAmount")}</p>
                      <input className="margin-bottom" type="text" value={objState?.variableAmount} placeholder={1} onChange={e => handleButtonVariable(e.target.value)} maxLength="1" />

                      {populateVariable()}
                    </div>
                  ) : (
                    <div><p>{t("edit.variableNameToSet")}</p>
                      <input type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} /></div>
                  )
                  } </div>
              ) :
                (<div> </div>)
              }
              <p>{t("edit.label")}</p>
              <input type="text" onChange={e => handleVarLabel(e.target.value)} value={objState?.label} />
              {objState.varType !== "checkbox" && (
                <>
                  <div className="color-buttons">
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
                      className={`${inputCurrentOptions === "text" ? navigator.userAgentData?.brands?.some(b => b.brand === 'Google Chrome') ? "editInputOptionSelected simple" : "editInputOptionSelected notSimple" : navigator.userAgentData?.brands?.some(b => b.brand === 'Google Chrome') ? "simple" :"notSimple"}`}
                      onClick={() => newTabInputSettings("text")}
                    >
                      {t("edit.shape.simpleText")}
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
