import React, { forwardRef, useContext, useState, useEffect } from "react";
import CustomWrapper from "../CustomWrapper";
import styled from "styled-components";
import { SettingsContext } from "../../../../App";

const Wrapper = styled.div`
  & > * {
    font-size: ${p => p.textsize || '1'}em;
  }
`;

const Input = forwardRef((props, ref) => {
  const { settings } = useContext(SettingsContext);
  const [radios, setRadios] = useState(3)
  const varName = props.varName || props.id;
  const [number, setNum] = useState(0)
  const [updater, setUpdater] = useState(0)
  const random = useState(props.random)

  const handleChangeValue = (value) => {
    if (props.sync && props.updateVariable) {
      props.updateVariable(varName, value)
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);

      sessionStorage.setItem('gameVars', JSON.stringify({
        ...vars,
        [varName]: value
      }));
      sessionStorage.setItem('lastSetVar', varName);
      props.refresh();
    }
  }

  const handleChangeValueButton = () => {
    if (props.sync && props.updateVariable) {
      for (let i = 0; i < props.varName.length; i++) {
        let name = varName[i];
        let value = props.varValue[i];
        if(!isNaN(value)){
          value = parseInt(props.varValue[i])
        }
        props.updateVariable(name, value)
      }
    } else {
      let vars = {};
      for (let i = 0; i < props.varName.length; i++) {
        if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
        let name = varName[i];
        let value;
        if (!props.varValue[i]) {
          value = 1;
        }
        if (Number.isInteger(props.varValue[i])) {
          value = props.varValue[i] + 1;
        } else {
          value = props.varValue[i];
        }
        sessionStorage.setItem('gameVars', JSON.stringify({
          ...vars,
          [name]: value
        }));
        sessionStorage.setItem('lastSetVar', varName);
      }
      props.refresh();
    }
  }

  const getValue = () => {
    if (props.sync && props.variables) {
      return props.variables[varName];
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      return vars[varName];
    }
  }

  const checkRadio = (i) => {
    if (props.sync && props.variables && props.radioText) {
      return (props.radioText[i] === props.variables[varName])
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      if (props.radioText && vars[varName]) {
        return ((props.radioText ? props.radioText[i] : 1) === vars[varName])
      }
    }
  }



  const calculateRadios = () => {
    const list = []
    let length = props.amount;
    if (!length) {
      length = 3;
    }
    for (let i = 0; i < length; i++) {
      let checked = checkRadio(i);
        list.push(
          <div className="radio-inputs" key={i}>
          <input
            key={i}
            className={"inputradio" + (props.editMode)}
            type="radio"
            value={props.radioText ? props.radioText[i] : "nothing"}
            checked={checkRadio(i)}
            onClick={(e) => (props.visible ? handleChangeValue(e.target.value) : false)}
          />
          <label htmlFor="radio">{props.radioText ? props.radioText[i] : "nothing"}</label>
        </div>
      );
    }
    return list;
  }

  useEffect(()=>{
    if(!props.editMode){
    let sessionVars = JSON.parse(sessionStorage.gameVars)
    let num = "NA";
    let math = (props.math ? props.math : 0)
    let one, two;
    if(!props.sync){
       one = parseInt(sessionVars[props.varOne] ? sessionVars[props.varOne] : 0)
       two = parseInt(sessionVars[props.varTwo] ? sessionVars[props.varTwo] : 0)
    }  else {
       one = parseInt(props.variables[props.varOne] ? props.variables[props.varOne] : 0)
       two = parseInt(props.variables[props.varTwo] ? props.variables[props.varTwo] : 0)
    }

    if(parseInt(props.varOne)){
        one = props.varOne
    }if(parseInt(props.varTwo)){
        two = props.varTwo
    }
    if(props.varTwo === "Random" && num !==number){
        two = parseFloat(random)
    }
    if(math === "add"){
      num = one + two;
    } else if (math === "subtract") {
      num = one - two
    } else if (math === "divide") {
      num = one / two
    } else if (math === "multiply") {
      num = one * two
    }

    if(num!==number){
      num = Math.round(num * 100) / 100
      setNum(num)
      if(props.variables[props.varName] !== num && props.varName && num){
        handleChangeValue(num)
      }
    }
  }
}, [props.variables])





  return (
    <CustomWrapper {...props} ref={ref}>
      <Wrapper {...settings}>
        {({
          button: (
            {...props.incr ? (
              <button
             className={"inputButtonDefault " + props.visible}
             style={{
               ...props.style
             }}
             onClick={() => (props.visible ? handleChangeValue((getValue() || 0) + 1) : false)}>{props.label}</button>
            ) : (
              <button
                className={"inputButtonDefault " + props.visible}
                style={{
                  ...props.style
                }}
                onClick={() => (props.visible ? handleChangeValueButton() : false)}>{props.label}</button>
            )}

          ),
          text: (
            <input
              type="text"
              className={"inputTextDefault " + props.visible}
              style={{
                ...props.style
              }}
              placeholder={props.label}
              value={getValue()}
              onChange={(e) => (props.visible ? handleChangeValue(e.target.value) : false)}
            />
          ),
          checkbox: (
            <input
              className={"inputButtonDefault " + props.visible}
              type="checkbox"
              checked={!!getValue()}
              onChange={(e) => (props.visible ? handleChangeValue((!!getValue() ? false : true)) : false)}
            />
          ),
          radio: (
            <div className={"inputButtonDefault " + "input-radio" + (props.editMode) + " " + props.visible} style={{
                ...props.style
              }}>
              {calculateRadios()}
            </div>
          ),
          variable: (
            <div className={"input-var" + (props.editMode) + " " + props.visible} >
              <div className="var-output" style={{...props.style}} >
                <p className="variable-dsplay" key={number}>{number}</p>
              </div>
            </div>
          )
        })[props.varType]}
      </Wrapper>
    </CustomWrapper>
  );
});

export default Input;
