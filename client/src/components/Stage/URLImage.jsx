import React, { useState, useEffect, forwardRef } from "react";
import { Image } from "react-konva";
import Loading from "../Loading/Loading";
import SuperGif from "libgif";
import { set } from "draft-js/lib/EditorState";


const URLImage = forwardRef((props, ref) => {
  const [image, setImage] = useState(null);
  const [gifSrc, setGifSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const getMeta = (url, callback) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      callback();
    }
  }

  const loadImage = () => {
  if (props.src.includes(".gif")) {
    getMeta(props.src, () => {
      const gif = document.createElement("img");
      gif.onload = () => {
        const gifObj = new SuperGif({ gif: gif });
        gifObj.load(() => setGifSrc(gifObj.get_canvas()));
      }
      gif.src = props.src;
      document.body.appendChild(gif);
    });
  } else {
    const newImg = new window.Image();
    newImg.onload = () => setImage(newImg);
    newImg.src = props.src;
  }
}

  useEffect(() => {
    setImage(loadImage());
    const actualLayer = props.canvas.refs[`${props.stage}AreaLayer.objects`];
    console.log(actualLayer)
    if(!props.editMode){
    const layer = actualLayer.getStage();
    const anim = new Konva.Animation(() => { }, layer);
    console.log(props)
    //create time out for 5 seconds then set loading false.   
    anim.start();
    return () => {
      anim.stop();
    };
  }
    
  }, [ref]);

  return (
    <Image
      draggable={props.draggable}
      visible={props.visible}
      x={props.x}
      y={props.y}
      scaleY={props.scaleY}
      scaleX={props.scaleX}
      width={props.width || 100}
      height={props.height || 100}
      image={gifSrc || image}
      ref={ref}
      id={props.id}
      name="shape"
      opacity={props.opacity}
      onClick={props.onClick}
      onTransformStart={props.onTransformStart}
      onTransform={props.onTransform}
      onTransformEnd={props.onTransformEnd}
      onDragMove={props.onDragMove}
      onDragEnd={props.onDragEnd}
      onContextMenu={props.onContextMenu}
      rotation={props.rotation}
      stroke={props.stroke}
      strokeWidth={props.strokeWidth}
    />
  );
});

export default URLImage;