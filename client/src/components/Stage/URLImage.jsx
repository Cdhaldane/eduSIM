import React, { useState, useEffect, forwardRef } from "react";
import { Image } from "react-konva";

const URLImage = forwardRef((props, ref) => {

  const [image, setImage] = useState(null);
  const [gifSrc, setGifSrc] = useState(null);

  const getMeta = (url, callback) => {
    const img = new window.Image();
    img.src = url;
    img.onload = function () {
      callback(this.width, this.height);
    }
  }

  const loadImage = () => {
    if (image) {
      image.src = props.src;
      return image;
    } else {
      if (props.src.includes(".gif")) {
        getMeta(props.src, () => {
          const gif = document.createElement("img");
          gif.src = props.src;
          document.body.appendChild(gif);
          const gifObj = new SuperGif({
            gif: gif
          });
          gifObj.load();
          setGifSrc(gifObj.get_canvas());
        });
      } else {
        const newImg = new window.Image();
        newImg.src = props.src;
        return newImg;
      }
    }
  }

  useEffect(() => {
    setImage(loadImage());

    const layer = props.layer.getStage();
    const anim = new Konva.Animation(() => { }, layer);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [ref]);

  return (
    <Image
      draggable={props.draggable}
      visible={props.visible}
      x={props.x}
      y={props.y}
      scaleY={props.scaleY}
      scaleX={props.scaleX}
      width={props.width}
      height={props.height}
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