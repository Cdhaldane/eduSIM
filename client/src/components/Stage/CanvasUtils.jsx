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



