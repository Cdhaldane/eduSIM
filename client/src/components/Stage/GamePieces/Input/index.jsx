import React, { forwardRef } from "react";
import CustomWrapper from "../CustomWrapper";

const Input = forwardRef((props, ref) => {

  const varName = props.varName || props.id;

  const handleChangeValue = (value) => {
    if (props.sync) {

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
    if (props.sync) {

    } else {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      return vars[varName];
    }
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      {({
        button: (
          <button onClick={() => handleChangeValue((getValue() || 0) + 1)}>click me</button>
        ),
        text: (
          <input 
            type="text" 
            placeholder="put text in me"
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
    </CustomWrapper>
  );
});

export default Input;
