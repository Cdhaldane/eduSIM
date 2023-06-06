import React, { useEffect } from 'react';

const CanvasUtils = (props) => {

  //
  //        CONDITION UTILS 
  //

  const handleCompare = (variable1, comparator, variable2, math, variable3) => {
    variable2 = handleThenCompare(variable2, math, variable3);
    if (comparator === '=') {
      if (variable1 === variable2) return true;
      else return false;
    }
    if (comparator === '!=') {
      if (variable1 !== variable2) return true;
      else return false;
    }
    if (comparator === '>') {
      if (variable1 > variable2) return true;
      else return false;
    }
    if (comparator === '<') {
      if (variable1 < variable2) return true;
      else return false;
    }
  };

  const handleThenCompare = (variable2, math, variable3) => {
    if (isNumeric(variable2) && isNumeric(variable3)) {
      if (math === '+') {
        variable2 = variable2 + variable3;
      }
      if (math === '-') {
        variable2 = variable2 - variable3;
      }
      if (math === 'X') {
        variable2 = variable2 * variable3;
      }
      if (math === '/') {
        variable2 = variable2 / variable3;
      }
    }
    return variable2;
  };

  const isNumeric = (n) => {
    return /^-?\d+$/.test(n);
  };

  const checkCondition = (var1, comparator, var2, math, var3) => {
    let [variable1, variable2, variable3] = getRealValue(var1, var2, var3);
    if (variable1 === undefined || variable2 === undefined) return false;
    return handleCompare(variable1, comparator, variable2, math, variable3);
  };

  const setCondition = (var1, var2, math, var3) => {
    let [variable1, variable2, variable3] = getRealValue(var1, var2, var3);
    if (variable1 === undefined || variable2 === undefined) return false;
    let x = handleThenCompare(variable2, math, variable3);
    if (props.globalVars[var1] !== x) props.handleVariable(var1, x);
  };

  const getRealValue = (var1, var2, var3) => {
    let variable1, variable2, variable3;
    variable1 = props.globalVars[var1.toString()];
    if (Array.isArray(var2)) variable2 = props.globalVars[var2.toString()];
    else variable2 = var2;
    if (Array.isArray(var3)) variable3 = props.globalVars[var3.toString()];
    else variable3 = var3;

    if (var1 === 'true') variable1 = true;
    if (var1 === 'false') variable1 = false;
    if (var2 === 'true') variable2 = true;
    if (var2 === 'false') variable2 = false;
    if (var3 === 'true') variable3 = true;
    if (var3 === 'false') variable3 = false;
    if (isNumeric(variable1)) variable1 = parseInt(variable1);
    if (isNumeric(variable2)) variable2 = parseInt(variable2);
    if (isNumeric(variable3)) variable3 = parseInt(variable3);

    if (variable1 === undefined || variable2 === undefined) return false;
    return [variable1, variable2, variable3];
  };


  useEffect(() => {
    let x = []
    if (!props.editMode)
      for (let i = 0; i < props.globalCons.length; i++) {
        let result = [];
        for (let j = 0; j < props.globalCons[i].length; j++) {
          let var1 = props.globalCons[i][j][0];
          let comparator = props.globalCons[i][j][1];
          let var2 = props.globalCons[i][j][2];
          let math = props.globalCons[i][j][3];
          let var3 = props.globalCons[i][j][4];
          if (j < props.globalCons[i].length - 1) result.push(checkCondition(var1, comparator, var2, math, var3));
          else {
            if (!result.includes(false)) {
              setCondition(var1, var2, math, var3);
              return;
            }
          }
        }
      }
  }, [props.globalVars]);

  return <></>;
};

export default CanvasUtils;


export const handleCollisions = (shape1, shape2, isAnchored, props) => {
  console.log(shape1, shape2, isAnchored)
  props.globalTrigs.map((trigger) => {
    let shapeName1 = trigger[0];
    let shapeName2 = trigger[1];
    let variable = trigger[2];
    if (shape1 === shapeName1 && shape2 === shapeName2) {
      if (props.globalVars[variable] === isAnchored) return;
      props.socket.emit("varChange", {
        name: variable, value: isAnchored
      })
      return;
    }
  })
}

