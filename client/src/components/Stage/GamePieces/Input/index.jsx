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

  const handleChangeValue = (value) => {
    if (props.sync && props.updateVariable) {
      props.updateVariable(varName, value);
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

  const getValue = () => {
    if (props.sync && props.variables) {
      return props.variables[varName];
    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      return vars[varName];
    }
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
          )
        })[props.varType]}
      </Wrapper>
    </CustomWrapper>
  );
});

export default Input;
