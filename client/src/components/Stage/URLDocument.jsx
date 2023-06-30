import React, { useState, useEffect, forwardRef } from "react";
import { Image, Rect } from "react-konva";
import useImage from 'use-image';


const URLDocument = forwardRef((props, ref) => {
  const [gifSrc, setGifSrc] = useState(null);

  const URLImage = ({ src, ...props }) => {
    
    return <Image image={image} {...props} />;
  };

  const [image] = useImage('https://res.cloudinary.com/uottawaedusim/image/upload/v1688111161/doc_wclapg.png');

  return (
    <>
    <Image
      draggable={props.draggable}
      visible={props.visible}
      x={props.x}
      y={props.y}
      scaleY={props.scaleY}
      scaleX={props.scaleX}
      width={props.width || 100}
      height={props.height || 100}
      ref={ref}
      id={props.id}
      image={image}
      name="shape"
      opacity={props.opacity}
      onClick={props.onClick}
      onDblClick={props.onDblClick}
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
  </>
  );
});

export default URLDocument;