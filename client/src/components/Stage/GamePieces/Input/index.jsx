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
  const varName = props.varName || props.id;
  const [number, setNum] = useState('NA')
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if(!props.editMode){
      if(props.sync){
        let out = props.variables[props.varName]
        if(out === true)
          out = 'true'
        if(out === false)
        out = 'false'
        setNum(out)
      }
      else
        setNum(JSON.parse(sessionStorage.gameVars)[props.varName] ? JSON.parse(sessionStorage.gameVars)[props.varName] : 'NA')
    }
  }, [props.variables])

  const handleChangeValue = (value, bName) => {
    let variable = props.varName
    if(bName)
      variable = bName
    if (props.sync && props.updateVariable) {
      props.updateVariable(variable, value)
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);

      sessionStorage.setItem('gameVars', JSON.stringify({
        ...vars,
        [variable]: value
      }));
      sessionStorage.setItem('lastSetVar', variable);
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

  const handleRadio = (e, i) => {
    handleChangeValue(e)
    setChecked(i)
  }

  const calculateRadios = () => {
    const list = []
    let length = props.amount;
    if (!length) {
      length = 3;
    }
    for (let i = 0; i < length; i++) {
        list.push(
          <div className="radio-inputs" key={i}>
          <input
            key={i}
            className={"inputradio" + (props.editMode)}
            type="radio"
            value={props.radioText ? props.radioText[i] : "nothing"}
            checked={checked == i ? true:false}
            onClick={(e) => (props.visible ? handleRadio(e.target.value, i) : false)}
          />
          <label htmlFor="radio">{props.radioText ? props.radioText[i] : "nothing"}</label>
        </div>
      );
    }
    return list;
  }

  const handleButton = () => {
    let value;
    for(let i = 0; i < props.ints.length; i++)
      if(props.ints[i][0] === props.varName){
        if(props.ints[i][6] === 'incr')
          value = parseInt(props.variables[props.ints[i][1]]) + parseInt(props.ints[i][3])
        else {
          value = props.ints[i][3]
        }
        handleChangeValue(value, props.ints[i][1])
      }
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      <Wrapper {...settings}>
        {({
          button: (
              <button
             className={"inputButtonDefault " + props.visible}
             style={{
               ...props.style
             }}
             onClick={() => (props.visible ? handleButton() : false)}>{props.label}</button>
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
              onChange={(e) => (props.visible ? handleChangeValue((e.target.value).toLowerCase()) : false)}
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
