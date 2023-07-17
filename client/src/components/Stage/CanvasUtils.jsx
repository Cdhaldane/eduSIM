import React, { useEffect } from 'react';

const CanvasUtils = (props) => {

  //
  //        CONDITION UTILS 
  //


  useEffect(() => {
    let saved = props.savedObjects;
    let state = props.state;
    let allShapes = []

    saved.map((object) => {
        state[object].map((shape) => {
            allShapes.push(shape)
        })
    })
  }, [props])

  return <></>;
};

export default CanvasUtils;

export const handleArrowKeys = (keyCode, canvas) => {
  let selected = canvas.state.selectedShapeName;
  let saved = canvas.props.savedObjects;
  let allShapes = []
  let type = ''
  saved.map((object) => {
      canvas.state[object].map((shape) => {
          allShapes.push(shape)
      })
  });
  const moveMargin = 5; // define the margin for moving the shape
  allShapes.map((shape) => {
    if (shape.name === selected) {
      selected = shape;
      type = shape.type;
    }
  })
  switch (keyCode) {
    case 37: // arrow left
      selected.x -= moveMargin;
      break;
    case 38: // arrow up
      selected.y -= moveMargin;
      break;
    case 39: // arrow right
      selected.x += moveMargin;
      break;
    case 40: // arrow down
      selected.y += moveMargin;
      break;
    default:
      console.log('Invalid key code');
      break;
  }
  let newState = canvas.state;
  newState[type].map((shape) => {
    if (shape.name === selected.name) {
      shape = selected;
    }
  }
  );
  canvas.setState(newState);
};


