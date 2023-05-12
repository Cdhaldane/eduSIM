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
    console.log(props.variables)
    let values = value
    let variable;
    let newArray;
    try{
      variable = bName.split("_")[0]
    } catch {
      variable = bName
    }

    if(Array.isArray(props.variables[variable])) {
      let currentArray = props.variables[bName.split('_')[0]]
      let replaceString = bName.split('_')[1]
      values = currentArray.map(str => str ===  replaceString ? value : str);
      variable = bName.split('_')[0]
      console.log(currentArray, replaceString, value, variable)
    } else {
      variable = bName
    }
    if (props.sync && props.updateVariable) {
      props.updateVariable(variable, values)
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      sessionStorage.setItem('gameVars', JSON.stringify({
        ...vars,
        [variable]: values
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
    for(let i = 0; i < props.interactions.length; i++)
      if(props.interactions[i][0] === props.varName){
        if(props.interactions[i][6] === 'incr'){
          if(parseInt(props.interactions[i][3]))
            value = parseInt(props.variables[props.interactions[i][1]]) + parseInt(props.interactions[i][3])
          else value = parseInt(props.variables[props.interactions[i][1]]) + parseInt(props.variables[props.interactions[i][3]])
          handleChangeValue(value, props.interactions[i][1])
        } else {
          value = hanldeInteractionValue()
        }
      }
  }

  const hanldeInteractionValue = () => {
    let interactions = props.interactions
    let ints;
    console.log(interactions)
    if(!props.editMode){
      for(let i = 0; i < interactions.length; i++){
        if(props.varName === interactions[i][0]){
          if(interactions[i][6] === 'page'){
            props.handleButtonPage(interactions[i][5])
            return;
          }
          ints = interactions[i]
          let operator = ints[4];
          let value;
          let result = true;
          let value2 = ints[5]
          let vName = ints[1]
          if(props.variables[ints[3]])
            value = props.variables[ints[3]]
          else value = ints[3]
          console.log(ints, Number(value), Number(value2), operator)
          switch (operator) {
            case '+':
              value = Number(value) + Number(value2);
              break;
            case '-':
              value = Number(value) - Number(value2);
              break;
            case '*':
              value = Number(value) * Number(value2);
              break;
            case '/':
              value = Number(value) / Number(value2);
              break;
            default:
              result = false;
          }
          handleChangeValue(value, vName)
        }
      }
    }
  }

  
  useEffect(()=> {
    if(!props.editMode)
    for(let i = 0; i < props.conditions.length; i++){
      let if_statement = props.conditions[i][0];
      let then_statement = props.conditions[i][1];
      let variable = parseInt(props.variables[if_statement[0]]);
      let operator = if_statement[1];
      let value = if_statement[2];
      if(isNaN(value) && props.variables[value]) value = props.variables[value];
      let t_variable = then_statement[0];
      let t_value = then_statement[2];
      if(isNaN(t_value) && props.variables[t_value]) t_value = props.variables[t_value];
      let result = true;
      for (let i = 3; i < if_statement.length; i += 2) {
        let operator2 = if_statement[i];
        let value2 = if_statement[i + 1];
        if(isNaN(value2) && props.variables[value2]) value2 = props.variables[value2];
        switch (operator2) {
          case '+':
            value = Number(value) + Number(value2);
            break;
          case '-':
            value = Number(value) - Number(value2);
            break;
          case '*':
            value = Number(value) * Number(value2);
            break;
          case '/':
            value = Number(value) / Number(value2);
            break;
          default:
            result = false;
        }
      }      
      switch (operator) {
          case '=':
            result = result && (variable == value);
            break;
          case '>':
            result = result && (Number(variable) > Number(value));
            break;
          case '<':
            result = result && (Number(variable) < Number(value));
            break
            case '>=':
              result = result && (Number(variable) >= Number(value));
              break;
            case '<=':
              result = result && (Number(variable) <= Number(value));
              break;
            default:
              result = false;
        }  
        if(result){
          for (let i = 3; i < then_statement.length; i += 2) {
            const t_operator = then_statement[i];
            let t_value2 = then_statement[i + 1];
            if(isNaN(t_value2) && props.variables[t_value2]) t_value2 = props.variables[t_value2];     
            switch (t_operator) {
              case '+':
                t_value += t_value2;
                break;
              case '-':
                t_value -= t_value2;
                break;
              case '*':
                t_value *= t_value2;
                break;
              case '/':
                t_value /= t_value2;
                break;
              default:
                console.log("Invalid operator");
            }
          }
          if(props.variables[t_variable] !== t_value)
            handleChangeValue(t_value, t_variable)
        }
      }
      
    
  }, [props.variables])

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
