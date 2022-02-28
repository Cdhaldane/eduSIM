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
  console.log(props.variables)
  console.log(JSON.parse(sessionStorage.gameVars))
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
      for(let i = 0; i < props.varName.length; i ++){
        let name = varName[i];
        let value;
        if(!props.varValue[i]){
          value = 1;
        }
        if(Number.isInteger(props.varValue[i])){
          value = props.varValue[i] + 1;
        } else {
          value = props.varValue[i];
        }
        console.log(value)
        props.updateVariable(name, value)
      }
    } else {
      let vars = {};
      for(let i = 0; i < props.varName.length; i ++){
        if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
        let name = varName[i];
        let value;
        if(!props.varValue[i]){
          value = 1;
        }
        if(Number.isInteger(props.varValue[i])){
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
      console.log(sessionStorage)
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
      return(props.radioText[i] === props.variables[varName])
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
        if(props.radioText && vars[varName]){
          return((props.radioText ? props.radioText[i] : 1)  === vars[varName])
      }
    }
  }

  const calculateRadios = () => {
    const list = []
    let length = props.amount;
    if(!length){
      length=3;
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
            onClick={(e) => handleChangeValue(e.target.value)}
          />
          <label for="radio">{props.radioText ? props.radioText[i] : "nothing"}</label>
          </div>
      );
    }
    return list
  }


  const calculateVariable = () => {
    if(!props.editMode){
    let sessionVars = JSON.parse(sessionStorage.gameVars)
    let num = "NA";
    let math = (props.math ? props.math : 0)
    let one, two;
    if(!props.sync){
      console.log(sessionVars[props.varOne])
       one = parseInt(sessionVars[props.varOne] ? sessionVars[props.varOne] : 0)
       two = parseInt(sessionVars[props.varTwo] ? sessionVars[props.varTwo] : 0)
    }  else {
       one = parseInt(props.variables[props.varOne] ? props.variables[props.varOne] : 0)
       two = parseInt(props.variables[props.varTwo] ? props.variables[props.varTwo] : 0)
    }

    if(parseInt(props.varOne)){
        one = props.varOne
    } if(parseInt(props.varTwo)){
        two = props.varTwo
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
    console.log(props.variables)
    console.log(one)
    console.log(two)

    if(num!==number && Number.isInteger(num)){
      setNum(num)
      handleChangeValue(num)
    }
  }
    return (
      <div className="var-output" style={{...props.style}}>
        <p className="variable-dsplay">{number}</p>
      </div>
    )
  }


  return (
    <CustomWrapper {...props} ref={ref}>
      <Wrapper {...settings}>
        {({
          button: (
            {...props.incr ? (
              <button
             className="inputButtonDefault"
             style={{
               ...props.style
             }}
             onClick={() => handleChangeValue((getValue() || 0) + 1)}>{props.label}</button>
            ) : (
              <button
                className="inputButtonDefault"
                style={{
                  ...props.style
                }}
                onClick={() => handleChangeValueButton()}>{props.label}</button>
            )}

          ),
          text: (
            <input
              type="text"
              className="inputTextDefault"
              style={{
                ...props.style
              }}
              placeholder={props.label}
              value={getValue()}
              onChange={(e) => handleChangeValue(e.target.value)}
            />
          ),
          checkbox: (
            <input
              type="checkbox"
              checked={!!getValue()}
              onChange={(e) => handleChangeValue((!!getValue() ? false : true))}
            />
          ),
          radio: (
            <div className={"input-radio" + (props.editMode)} style={{
                ...props.style
              }}>
              {calculateRadios()}
            </div>
          ),
          variable: (
            <div className={"input-var" + (props.editMode)}>
              {calculateVariable()}
            </div>
          )
        })[props.varType]}
      </Wrapper>
    </CustomWrapper>
  );
});

export default Input;
