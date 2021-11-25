import Konva from "konva"
import React, { useState, forwardRef, useEffect, useRef } from 'react';
import { Image, Text } from "react-konva";

const URLVideo = forwardRef((props, ref) => {
  const [isPlaying, setIsPlaying] = useState(props.temporary);
  const [fillPatternImage, setFillPatternImage] = useState(null);
  const [playPauseScale, setPlayPauseScale] = useState(0);
  const playPause = useRef();
  const [gifSrc, setGifSrc] = useState(null);

  if (props.fillPatternImage) {
    const bimage = new window.Image();
    bimage.onload = () => {
      setFillPatternImage(bimage);
    }
    bimage.src = 'sound.png';
  }

  useEffect(() => {
    if (props.type === "video") {
      setPlayPauseScale(30);
    } else if (props.type === "audio") {
      setPlayPauseScale(15);
    }
  }, []);

  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    element.src = props.src;
    element.loop = true;
    element.autoplay = true;
    return element;
  }, [props.src]);


  useEffect(() => {
    const onload = () => {
      //
    };

    videoElement.addEventListener("loadedmetadata", onload);

    return () => {
      videoElement.pause();
      videoElement.removeEventListener("loadedmetadata", onload);
    };
  }, [videoElement]);

  const getMeta = (url, callback) => {
    const img = new window.Image();
    img.src = url;
    img.onload = function () {
      callback(this.width, this.height);
    }
  }

  useEffect(() => {
    if (props.src.includes(".gif")) {
      getMeta(props.src, () => {
        const gif = document.createElement("img");
        gif.src = props.src;
        const gifObj = new SuperGif({
          gif: gif
        });
        gifObj.load();
        setGifSrc(gifObj.get_canvas());
      });
    }
    
    videoElement.play();
    const layer = props.layer.getStage();

    const anim = new Konva.Animation(() => { }, layer);
    anim.start();

    return () => {
      anim.stop();
    };
  }, [videoElement, props.layer]);

  const togglePlay = () => {
    if (!props.temporary && !props.src.includes(".gif")) {
      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        videoElement.play();
        setIsPlaying(true);
      }
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
        scaleY={props.scaleY}
        scaleX={props.scaleX}
        width={props.width}
        height={props.height}
        image={gifSrc || videoElement}
        ref={ref}
        id={props.id}
        name="shape"
        opacity={props.opacity}
        onClick={togglePlay}
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
      {!props.temporary && !props.src.includes(".gif") && (
        <Text
          ref={playPause}
          fontSize={props.scaleX ?
            Math.min(props.scaleX * playPauseScale, props.scaleY * playPauseScale) :
            playPauseScale}
          fontFamily={"Montserrat"}
          text={isPlaying ? "Playing... ▶" : "Paused... ⏸"}
          fill={"black"}
          x={props.x}
          y={playPause.current ? props.y - playPause.current.height() - 5 : props.y}
          width={props.scaleX ? props.width * props.scaleX : props.width}
          rotation={props.rotation}
          opacity={0.5}
        />
      )}
    </>
  );
});

export default URLVideo;
