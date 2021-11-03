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
      <button onClick={() => handleChangeValue((getValue() || 0) + 1)}>CLICK ME</button>
    </CustomWrapper>
  );
});

export default Input;
