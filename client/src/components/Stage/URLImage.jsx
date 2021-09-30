import React, { useState, useEffect, forwardRef } from "react";
import { Image } from "react-konva";

const URLImage = forwardRef((props, ref) => {

  const [image, setImage] = useState(null);

  const loadImage = () => {
    const image = new window.Image();
    image.src = props.src;
    setImage(image);
  }

  useEffect(() => {
    loadImage();
  }, []);

  return (
    <Image
      draggable
      visible={props.visible}
      x={props.x}
      y={props.y}
      scaleY={props.scaleY}
      scaleX={props.scaleX}
      width={props.width}
      height={props.height}
      image={image}
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