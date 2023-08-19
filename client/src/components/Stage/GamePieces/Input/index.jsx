import React, { forwardRef, useContext, useState, useEffect } from "react";
import CustomWrapper from "../CustomWrapper";
import styled from "styled-components";
import { SettingsContext } from "../../../../App";
import { throttle, debounce } from 'lodash';


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
    if (!props.editMode) {
      if (props.sync) {
        let out = props.variables[props.varName]
        if (out === true)
          out = 'true'
        if (out === false)
          out = 'false'
        setNum(out)
      }
      else
        setNum(JSON.parse(sessionStorage.gameVars)[props.varName] ? JSON.parse(sessionStorage.gameVars)[props.varName] : 'NA')
    }
  }, [props.variables])

  const handleChangeValue = (value, bName, type) => {
    let values = value
    let variable;
    let newArray;
    try {
      variable = bName.split("_")[0]
    } catch {
      variable = bName
    }
    if (Array.isArray(props.variables[variable])) {
      let currentArray = props.variables[bName.split('_')[0]]
      let replaceString = bName.split('_')[1]
      values = currentArray.map(str => str === replaceString ? value : str);
      variable = bName.split('_')[0]
    } else {
      variable = bName
    }
    const delayInMilliseconds = 500; // customize this value to your needs

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
            checked={checked == i ? true : false}
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
    let int;
    const delayInMilliseconds = 50; // customize this value to your needs
    props.updateStatus({
      button: props.label,
      clickAmount: props.status.clickAmount ? props.status.clickAmount + 1 : 1
    })
    console.log(props)
    for (let i = 0; i < props.interactions.length; i++) {
      setTimeout(() => {
        int = props.interactions[i].flat()
        if (int[0] === props.varName) {
          if (int[6] === 'incr') {
            if (parseInt(int[3]))
              value = parseInt(props.variables[int[1]]) + parseInt(int[3])
            handleChangeValue(value, int[1])
          } else {
            value = hanldeInteractionValue(int)
          }
        }
      }, delayInMilliseconds);
    }
  }


  const hanldeInteractionValue = (int) => {
    if (!props.editMode) {
      if (props.varName === int[0]) {
        if (int[6] === 'page') {
          props.handleButtonPage(parseInt(int[5]))
          return;
        }
        let ints = int
        let operator = ints[4];
        let value;
        let result = true;
        let value2 = ints[5]
        let vName = ints[1]
        if (props.variables[ints[3]])
          value = props.variables[ints[3]]
        else value = ints[3]

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
              onChange={(e) => (props.visible ? handleChangeValue((e.target.value).toLowerCase(), props.varName) : false)}
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
              <div className="var-output" style={{ ...props.style }} >
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
