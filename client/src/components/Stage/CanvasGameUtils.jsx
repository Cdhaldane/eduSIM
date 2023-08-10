import { is } from 'immutable';
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

    if (variable1 === 'true') variable1 = true;
    if (variable1 === 'false') variable1 = false;
    if (variable2 === 'true') variable2 = true;
    if (variable2 === 'false') variable2 = false;
    if (variable3 === 'true') variable3 = true;
    if (variable3 === 'false') variable3 = false;
    if (isNumeric(variable1)) variable1 = parseInt(variable1);
    if (isNumeric(variable2)) variable2 = parseInt(variable2);
    if (isNumeric(variable3)) variable3 = parseInt(variable3);
    // if (variable1 === undefined || variable2 === undefined) return [false];
    return [variable1, variable2, variable3];
  };


  useEffect(() => {
    let x = []
    if (!props.editMode)
      for (let i = 0; i < props.globalCons.length; i++) {
        let result = [];
        for (let j = 0; j < props.globalCons[i].length; j++) {
          let con = props.globalCons[i][j].flatMap(x => x)
         
          let var1 = con[0];
          let comparator = con[1];
          let var2 = con[2];
          let math = con[3];
          let var3 = con[4];
          if (j < props.globalCons[i].length - 1) {
            result.push(checkCondition(var1, comparator, var2, math, var3));
          }
          else {
            if (!result.includes(false)) {
              console.log(var1, var2, math, var3)
              setCondition(var1, var2, math, var3);
            }
          }
        }
      }
  }, [props]);

  return <></>;
};

export default CanvasUtils;

function splitArrayByValue(arr, index) {
  const result = [];
  arr.forEach(item => {
    const value = item[index];
    const existingArray = result.find(arr => arr[0][index] === value);
    if (existingArray) {
      existingArray.push(item);
    } else {
      result.push([item]);
    }
  });
  return result;
}
const filterObjectBasedOnArray = (obj, arr) => {
  const newObj = {};

  arr.forEach(item => {
    // assuming each object in the array has an 'id' property
    const key = item.id;
    if (key in obj) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
}
const checkCorrespondence = (objArray, subArray) => {
  // Check if we've reached a bottom-level array (its elements are not arrays)
  if (!Array.isArray(subArray[0])) {
    // Check first two positions
    for(let j = 0; j < Math.min(2, subArray.length); j++) {
      let objExists = objArray.some(obj => (
        obj.name === subArray[j]
       ) );
      if(!objExists) return false;
    }
    return true;
  }

  // If we haven't reached a bottom-level array, recurse into each subArray
  for(let i = 0; i < subArray.length; i++) {
    if(!checkCorrespondence(objArray, subArray[i])) return false;
  }
  
  return true;
};
const filterArrayBasedOnArray = (arr, obj) => {
  let out = []
  for(let i = 0; i < arr.length; i++) {
    if(checkCorrespondence(obj, arr[i])) {
      out.push(arr[i]);
    }
  }
  return out
};


export const handleCollisions = (props, state) => {
  let trigs = props.globalTrigs;
  trigs = trigs.map(subArr => subArr.map(item => Array.isArray(item) ? item.flat().join('') : item));
  for (let i = 0; i < trigs.length; i++) {
    if (trigs[i].length === 4) {
      trigs[i].splice(3, 1);
    }
  }
  let result = props.savedObjects.flatMap(key => state[key])
  let filteredResult = result.filter(obj => obj.level === state.level);
  let groupedArrays = splitArrayByValue(trigs, 2);
  groupedArrays = filterArrayBasedOnArray(groupedArrays, filteredResult)
  const gamepieces = filterObjectBasedOnArray(props.gamepieceStatus, filteredResult)
  groupedArrays.map((group) => {
    let touchingArray = [];
    group.map((item) => {
      let name = filteredResult.filter(obj => obj.name === item[0]);
      let shape = undefined;
      name.map((obj) => {
        if (Object.keys(gamepieces).includes(obj.id)) {
          shape=gamepieces[obj.id]
        }
      })
      if (name === undefined) return
      if (shape === undefined) return
      shape.id = item[0]
      let touch = handleTouching(shape, item[1], filteredResult)
      
      touchingArray.push(touch)
    });
    if (touchingArray.includes(true) && !props.globalVars[group[0][2]]) {
      props.socket.emit("varChange", {
        name: group[0][2], value: true
      })
    } else if (!touchingArray.includes(true) && props.globalVars[group[0][2]] !== false) {
      props.socket.emit("varChange", {
        name: group[0][2], value: false
      })
    }

  });
}

export const handleTouching = (shapeOne, shapeTwo, filteredResult) => {
  let shape1 = shapeOne
  let shape2 = filteredResult.find(obj => obj.name === shapeTwo);
  if (shape1 === undefined || shape2 === undefined) return false;
  const shape1Left = shape1.x;
  const shape1Right = shape1.x;
  const shape1Top = shape1.y;
  const shape1Bottom = shape1.y;

  const shape2Left = shape2.x - shape2.width / 2;
  const shape2Right = shape2.x + 0.5 * shape2.width;
  const shape2Top = shape2.y - shape2.height / 2;
  const shape2Bottom = shape2.y + 0.5 * shape2.height;
  // Check for intersection along the x-axis
  const isIntersectX = shape1Right >= shape2Left && shape1Left <= shape2Right;

  // Check for intersection along the y-axis
  const isIntersectY = shape1Bottom >= shape2Top && shape1Top <= shape2Bottom;

  // if(isIntersectX && isIntersectY) console.log(shapeOne, shapeTwo)

  // Return true if there is intersection along both axes
  return isIntersectX && isIntersectY;
}


export const handleNotColliding = (id, props) => {
}

// if (xDist < sW / 2 && yDist < sH / 2) {
//   e.target.x(sX + this.originCenter(sW / 2, id) - this.originCenter(this.realWidth(obj) / 2, obj.id));
//   e.target.y(sY + this.originCenter(sH / 2, id) - this.originCenter(this.realHeight(obj) / 2, obj.id));
//   console.log("COLLISION");
//   handleCollisions(obj.id, id, true, this.props);
// } else {
//   handleNotColliding(obj.id, this.props);
// }
