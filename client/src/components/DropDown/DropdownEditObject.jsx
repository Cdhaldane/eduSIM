import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import { ChromePicker } from 'react-color';
import Slider from 'rc-slider';
import FontPicker from "font-picker-react";
import debounce from 'lodash.debounce';
import DOMPurify from 'dompurify';
import { CompactPicker } from 'react-color';
import { useTranslation } from "react-i18next";
import Wheel from '@uiw/react-color-wheel';

import 'rc-slider/assets/index.css';
import "./DropdownEditObject.css";
import DropdownEditPoll from './DropdownEditPoll';


import Left from "../../../public/icons/arrow-left.svg"
import { use } from 'i18next';

const DEFAULT_FONT_SIZE = 50;

const DropdownEditObject = (props) => {
  const [activeMenu, setActiveMenu] = useState('main');
  const dropdownRef = useRef(null);
  const [fillColor, setFillColor] = useState("black");
  const [strokeColor, setStrokeColor] = useState("black");
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [strokeWidth, setStrokeWidth] = React.useState(0);
  const [opacity, setOpacity] = React.useState(1);
  const [font, setFont] = React.useState("Belgrano");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [leftOrRight, setLeftOrRight] = useState(props.left ? { right: "110px", } : { left: "155px" });
  const [loading, setLoading] = useState(true);
  const [shape, setShape] = useState(props.getObj(props.selectedShapeName, false, false));
  const [objState, setObjState] = useState(props.grouped ? props.getObjGroup() : props.getObjState());
  const { t } = useTranslation();
  const [texts, setTexts] = useState("")
  const [vTexts, setVTexts] = useState(objState.style ? objState.varName : [])
  const [title, setTitle] = useState(props.title)

  const [index, setIndex] = useState(0)

  const [vTextsV, setVTextsV] = useState(objState.style ? objState.varValue : [])
  const [varOne, setVarOne] = useState(objState.style ? objState.varOne : "")
  const [varTwo, setVarTwo] = useState(objState.style ? objState.varTwo : "")

  const [showFill, setShowFill] = useState(false);
  const [showStroke, setShowStroke] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  // Input Settings
  const DEFAULT_INPUT_FILL = "#e4e4e4";
  const DEFAULT_INPUT_STROKE_W = 2;
  
  //const DEFAULT_INPUT_STROKE = "rgb(44, 44, 44)";
  const [inputFillColor, setInputFillColor] = useState(objState.style ?
    (objState.style.backgroundColor ? objState.style.backgroundColor : DEFAULT_INPUT_FILL) : DEFAULT_INPUT_FILL);
  const [inputStrokeWidth, setInputStrokeWidth] = useState(objState ?
    (objState.style ? objState.style.borderWidth : DEFAULT_INPUT_STROKE_W) : DEFAULT_INPUT_STROKE_W);
  const [inputCurrentOptions, setInputCurrentOptions] = useState("fill");

  const calcTopOffset = () => {
    const element = document.getElementsByClassName("dropdownedit")[0];
    if (element) {
      const dropHeight = element.clientHeight;
      const contextHeight = 300;
      const thresholdPx = dropHeight - contextHeight;
      if (props.top < thresholdPx) {
        return thresholdPx / 2;
      }
    }
    return null;
  }
  setTimeout(() => {
    setTopOffset(calcTopOffset());
  }, 10);
  const [topOffset, setTopOffset] = useState(null);



  useEffect(() => {
    if (Array.isArray(objState)) {
      setTexts(objState.map((obj) => obj.varName))
      setVTexts(objState.map((obj) => obj.varName))
      setVTextsV(objState.map((obj) => obj.varValue))
      setVarOne(objState.map((obj) => obj.varOne))
      setVarTwo(objState.map((obj) => obj.varTwo))
      // setInputFillColor(objState.map((obj) => obj.style.backgroundColor))
      // setInputStrokeWidth(objState.map((obj) => obj.style.borderWidth))
      if (props.grouped) {
        let shapeNames = [];
        const editTitleOptions = ["text", "poll", "connect4", "tic", "html", "input", "timer"];
        objState.map((obj) => {
          shapeNames.push(obj.id.replace(/\d+/g, ''))
        })
        const allEqual = arr => arr.every(v => v === arr[0]);
        if (allEqual(shapeNames) && editTitleOptions.includes(shapeNames[0].slice(0, -1))) {
          setTitle(shapeNames[0].slice(0, -1))
        } else {
          setTitle("shape")
        }
      }
      setObjState(objState[0])
    }
    if (!objState.volume) {
      props.updateObjState({ volume: 1 });
      setObjState(prev => ({
        ...prev,
        volume: 1
      }));
    }
    if (title === "shape") {
      setOpacity(shape.attrs.opacity ? shape.attrs.opacity : 1);
      setStrokeColor(shape.attrs.stroke);
      setFillColor(shape.attrs.fill);
      setStrokeWidth(shape.attrs.strokeWidth);
    } else if (title === "text") {
      if (props.font) {
        setFillColor(props.font.attrs.fill);
        setOpacity(props.font.attrs.opacity);
        setFont(props.font.attrs.fontFamily);
        setFontSize(props.font.attrs.fontSize);
      } else {
        console.error("ERROR: No Font.");
      }
    } else if (title === "Edit Poll") {

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
  const handleChangeB = (e) => {
    setBackgroundColor(e.hex);
    props.handleBackgroundColor(e);
  }


  const onSliderChange = (e) => {
    let newStrokeWidth = parseFloat(e);
    setStrokeWidth(newStrokeWidth);
    props.handleWidth(newStrokeWidth);
  }

  const onSliderChangeOpacity = (e) => {
    let newOpacity = parseFloat(e);
    setOpacity(newOpacity);
    props.handleOpacity(newOpacity);
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
    for (let i = 0; i < (objState?.amount ? objState?.amount : 3); i++) {
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

  const handleObjectName = (val) => {
    props.updateObjState({ name: val });
    debounceObjState({ name: val });
    setObjState(prev => ({
      ...prev,
      name: val
    }));
  }

  const newTabInputSettings = (tab) => {
    console.log(objState)
    setInputStrokeWidth(objState.style && objState.style.borderWidth ?
      parseInt(objState.style.borderWidth) : DEFAULT_INPUT_STROKE_W);
    setInputFillColor(tab === "fill" ? objState.style && objState.style.backgroundColor :
      (tab === "stroke" ? objState.style && objState.style.borderColor : DEFAULT_INPUT_FILL));
    setInputCurrentOptions(tab);
  }
  const getThemesBoxes = () => {
    console.log(props.themes)
    return props.themes.map((theme, i) => {
      return (
        <div className="theme-box" key={i} onClick={() => {
          setIndex(i)
          if (showFill) handleChangeF({ hex: theme })
          else if (showStroke) handleChangeS({ hex: theme })
        }}>
          <div className={"theme-box-color " + (i === index ? "selected" : "")  } style={{ backgroundColor: theme }}></div>
        </div>
      )
    })
  }

  if (!loading) {
    if (title === "shape") {
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
              <input id="menuedit-name" type="text" onChange={e => handleObjectName(e.target.value)} value={objState?.name} placeholder={objState?.id} />
              {!((objState?.id).includes("videos") || (objState?.id).includes("audios")) && (
                <>
                  <div className="menuedit-color-container">
                    {!props.selectedShapeName.includes("lines") && (
                      <>
                        <div className='color-button-container'>
                          <button onClick={() => { setShowFill(!showFill), setShowStroke(false) }} className={showFill ? 'active' : ''}  >Fill Color</button>
                          <button onClick={() => { setShowStroke(!showStroke), setShowFill(false) }} className={showStroke ? 'active' : ''}>Stroke Color</button>
                        </div>
                        {(showFill || showStroke) &&
                          <div className="theme-boxes-dropdown">
                            {getThemesBoxes()}
                          </div>
                        }
                        {showFill &&
                          <ChromePicker
                            color={fillColor}
                            onChangeComplete={handleChangeF}
                            className='color-picker'
                          />
                        }
                      </>
                    )}
                    {showStroke &&
                      <ChromePicker
                        className='color-picker'
                        color={strokeColor}
                        onChangeComplete={handleChangeS} />
                    }
                  </div>
                  <div className="menuedit-sliders">
                    <div className='slider-container'>
                      <h1>{t("edit.strokeWidth")}</h1>
                      <input type="number" value={Math.round(strokeWidth)} onChange={e => onSliderChange(e.target.value)} />
                    </div>
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
                  </div>
                  <div className="menuedit-sliders">
                    <div className='slider-container'>
                      <h1>{t("edit.opacity")}</h1>
                      <input type="number" value={opacity} onChange={e => onSliderChangeOpacity(e.target.value)} />
                    </div>
                    <Slider
                      className="slider"
                      value={opacity}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={onSliderChangeOpacity}
                      railStyle={railStyle}
                      handleStyle={handleStyle}
                      trackStyle={trackStyle}
                    />
                  </div>
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
    } else if (title === "text") {
      /* Edit a Text Object */
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
              <input id="menuedit-name" type="text" onChange={e => handleObjectName(e.target.value)} value={objState?.name} placeholder={objState?.id} />
              <div className="menuedit-color-container">
                <div className='color-button-container text'>
                  <button onClick={() => { setShowFill(!showFill), setShowStroke(false), setShowBackground(false) }} className={showFill ? 'active' : ''}  >Fill Color</button>
                  <button onClick={() => { setShowBackground(!showBackground), setShowFill(false), setShowStroke(false) }} className={showBackground ? 'active' : ''}>Background Color</button>
                  <button onClick={() => { setShowStroke(!showStroke), setShowFill(false), setShowBackground(false) }} className={showStroke ? 'active' : ''}>Stroke Color</button>

                </div>
                {showFill &&
                  <ChromePicker
                    color={fillColor}
                    onChangeComplete={handleChangeF}
                    className='color-picker'
                  />
                }
                {showBackground &&
                  <ChromePicker
                    className='color-picker'
                    color={backgroundColor}
                    onChangeComplete={handleChangeB} />
                }
                {showStroke &&
                  <>
                    <ChromePicker
                      className='color-picker'
                      color={strokeColor}
                      onChangeComplete={handleChangeS} />
                    <div className="menuedit-sliders">
                      <div className='slider-container'>
                        <h1>{t("edit.strokeWidth")}</h1>
                        <input type="number" value={Math.round(strokeWidth)} onChange={e => onSliderChange(e.target.value)} />
                      </div>
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
                    </div>
                  </>
                }
              </div>
              <div className="menuedit-sliders">
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
              </div>
              <div className="menuedit-sliders">
                <div className='slider-container'>
                  <h1>{t("edit.opacity")}</h1>
                  <input type="number" value={opacity} onChange={e => onSliderChangeOpacity(e.target.value)} />
                </div>
                <Slider
                  className="slider"
                  value={opacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={onSliderChangeOpacity}
                  railStyle={railStyle}
                  handleStyle={handleStyle}
                  trackStyle={trackStyle}
                />
              </div>
              <div className='menuedit-sliders'>
                <b>{t("edit.textSize")}</b>
                <input id="sizeinput" type="text" pattern="[0-9]*" onChange={handleSize} value={fontSize} />
              </div>
            </div>
          </CSSTransition>
        </div>
      );
    } else if (title === "poll") {
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
                {...props}
              />
              <p>{t("edit.variableNameToSet")}</p>
              <select onChange={e => handleVarName(e.target.value)} value={objState?.varName}>
                {props.globalVars.map((data) => {
                  return (
                    <option value={Object.keys(data)}>
                      {Object.keys(data)}
                    </option>
                  );
                })}
              </select>
            </div>
          </CSSTransition>
        </div>
      );
    } else if (title === "timer") {
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
                <input type="checkbox" checked={objState?.sync} onChange={() => handleProperty(!objState?.sync, 'sync')} />
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
    } else if (title === "html") {
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
                <input type="checkbox" checked={!!objState?.sync} onChange={() => handleProperty(!objState?.sync, 'sync')} value={true} />
                <p>{t("edit.variableSync")}</p>
              </div>
            </div>
          </CSSTransition>
        </div>
      );
    } else if (title === "input") {
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
              <input id="menuedit-name" type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} />

              {objState.varType !== "checkbox" && (

                <div className="menuedit-color-container">
                  <>
                    <div className='color-button-container text'>
                      <button
                        className={`${inputCurrentOptions === "fill" ? "editInputOptionSelected" : ""}`}
                        onClick={() => { newTabInputSettings("fill") }}
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
                        {t("edit.shape.simpleText")}
                      </button>
                    </div>
                    {inputCurrentOptions === "fill" &&
                      <ChromePicker
                        className="compactPickerEditInput"
                        color={inputFillColor}
                        disableAlpha={true}
                        onChange={(color) => {
                          setInputFillColor(color.hex);
                          handleInputStyle("backgroundColor", color.hex);
                        }}
                      />
                    }
                    {inputCurrentOptions === "stroke" &&
                      <>
                        <ChromePicker
                          className="compactPickerEditInput"
                          color={inputFillColor}
                          disableAlpha={true}
                          onChange={(color) => {
                            setInputFillColor(color.hex);
                            handleInputStyle("borderColor", color.hex);
                          }} />
                        <div className="menuedit-sliders">
                          <div className='slider-container'>
                            <h1>{t("edit.strokeWidth")}</h1>
                            <input type="number" value={Math.round(inputStrokeWidth)} onChange={(e) => {
                              setInputStrokeWidth(e.target.value);
                              handleInputStyle("borderWidth", e.target.value + "px");
                            }} />
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step={0.01}
                            className="slider"
                            value={inputStrokeWidth}
                            onChange={(e) => {
                              setInputStrokeWidth(e);
                              handleInputStyle("borderWidth", e + "px");
                            }}
                            railStyle={railStyle}
                            handleStyle={handleStyle}
                            trackStyle={trackStyle}
                          />
                        </div>
                      </>
                    }
                    {inputCurrentOptions === "text" &&
                      <>
                        <ChromePicker
                          className="compactPickerEditInput"
                          color={inputFillColor}
                          disableAlpha={true}
                          onChange={(color) => {
                            setInputFillColor(color.hex);
                            handleInputStyle("color", color.hex);
                          }} />

                      </>
                    }
                  </>
                </div>
              )}
              <div className="menuedit-sliders">
                <p>{t("edit.inputType")}</p>
                <select name="inputtype" onChange={e => handleVarType(e.target.value)} value={objState?.varType}>
                  <option value="checkbox">{t("edit.input.checkbox")}</option>
                  <option value="text">{t("edit.input.textbox")}</option>
                  <option value="button">{t("edit.input.button")}</option>
                  <option value="radio">{t("edit.input.radio")}</option>
                  <option value="variable">{t("edit.input.variable")}</option>
                </select>
              </div>

              {/* TODO MAKE LOCALSTORAGE WORK FOR INTERACTIONS AND CONDITIONS */}
              <div className="menuedit-sliders">
                <div className="htmliframeinput">
                  <input type="checkbox" checked={!!objState.sync} onChange={() => handleProperty(!objState?.sync, 'sync')} />
                  <p>{t("edit.variableSync")}</p>
                </div>
              </div>
              {objState?.varType !== "button" && <div className="menuedit-sliders">
                <p>{t("edit.variableNameToSet")}</p>
                <select onChange={e => handleVarName(e.target.value)} value={objState?.varName}>
                  {props.globalVars.map((data) => {
                    return (
                      <option value={Object.keys(data)}>
                        {Object.keys(data)}
                      </option>
                    );
                  })}
                </select>
              </div>}
              {objState?.varType === "radio" && (
                <div className="menuedit-sliders">
                  <div className="radio-dropdown">
                    <p>{t("edit.radioAmount")}</p>
                    <input type="text" value={objState?.amount} placeholder={3} onChange={e => handleRadio(e.target.value)} maxLength="1" />
                    <p>{t("edit.radioText")}</p>
                    {populateRadio()}
                  </div>
                </div>
              )}
              {objState?.varType === "checkbox" && (
                <div className="menuedit-sliders">
                  <div className="radio-dropdown">
                    <p>{t("edit.variableNameToSet")}</p>
                    <input className="margin-bottom" type="text" onChange={e => handleVarName(e.target.value)} value={objState?.varName} placeholder={objState?.id} />
                  </div>
                </div>
              )}
              <div className="menuedit-sliders">
                <p>{t("edit.label")}</p>
                <input type="text" onChange={e => handleVarLabel(e.target.value)} value={objState?.label} />
              </div>
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

