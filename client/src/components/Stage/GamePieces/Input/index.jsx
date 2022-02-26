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
    console.log(sessionStorage)
    console.log(varName.length)
  }

  const getValue = () => {
    if (props.sync && props.variables) {
      console.log(props.variables)
      return props.variables[varName];
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);

        return vars[varName];

    }
  }

  const calculateRadios = () => {
    const list = []
    let length = props.amount;
    if(!length){
      length=3;
    }
    for (let i = 0; i < length; i++) {
        list.push(
          <div className="radio-inputs">
          <input
            type="radio"
            value={props.radioText ? props.radioText[i] : "nothing"}
            name="radio"
            checked={!!getValue()}
          />
          <label for="radio">{props.radioText ? props.radioText[i] : "nothing"}</label>
          </div>
      );
    }
    return list
  }


  return (
    <CustomWrapper {...props} ref={ref}>
      <Wrapper {...settings}>
        {({
          button: (
            <button
              className="inputButtonDefault"
              style={{
                ...props.style
              }}
              onClick={() => handleChangeValue((getValue() || 0) + 1)}>{props.label}</button>
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
            <div className={"input-radio" + (props.editMode)} onChange={(e) => handleChangeValue(e.target.value)}>
              {calculateRadios()}
            </div>
          )
        })[props.varType]}
      </Wrapper>
    </CustomWrapper>
  );
});

export default Input;
