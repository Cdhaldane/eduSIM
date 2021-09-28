import Konva from "konva"
import React, { useState, forwardRef } from 'react';
import { Image } from "react-konva";

const URLvideo = forwardRef((props, ref) => {

  const [isPlaying, setIsPlaying] = useState(true);
  const [fillPatternImage, setFillPatternImage] = useState(null);

  if (props.fillPatternImage) {
    const bimage = new window.Image();
    bimage.onload = () => {
      setFillPatternImage(bimage);
    }
    bimage.src = 'sound.png';
  }

  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    element.src = props.src;
    return element;
  }, [props.src]);


  React.useEffect(() => {
    const onload = function () {
      //
    };

    videoElement.addEventListener("loadedmetadata", onload);

    return () => {
      videoElement.removeEventListener("loadedmetadata", onload);
    };
  }, [videoElement]);

  React.useEffect(() => {
    videoElement.play();
    const layer = props.layer.getStage();

    const anim = new Konva.Animation(() => { }, layer);
    anim.start();

    return () => anim.stop();
  }, [videoElement, props.layer]);

  function playAudio() {
    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    } else {
      videoElement.play();
      setIsPlaying(true);
    }
  }
  
  return (
    <>
      <Image
        visible={props.visible}
        fillPatternImage={fillPatternImage}
        fillPatternScaleY={0.4}
        fillPatternScaleX={0.4}
        draggable
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        image={videoElement}
        ref={ref}
        id={props.id}
        name="shape"
        opacity={props.opacity}
        onClick={playAudio}
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

export default URLvideo;
