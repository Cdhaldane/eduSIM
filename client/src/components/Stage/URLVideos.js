import Konva from "konva"
import { Container, Row, Col } from "react-bootstrap";
import "./Stage.css"
import React, { useState, useEffect, Component, useMemo } from 'react';
import {Image, Rect} from "react-konva";
import useImage from "use-image";



function URLvideo(props) {
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [size, setSize] = React.useState({ width: 50, height: 50 });
  const [isPlaying, setIsPlaying] = useState(true)
  const [fillPatternImage, setFillPatternImage] = useState(null)

  if (props.fillPatternImage) {
  const bimage = new window.Image();
      bimage.onload = () => {
        setFillPatternImage(bimage)
      }
      bimage.src = 'sound.png';
  }

  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    element.src = props.src;
    console.log(element);
    return element;
  }, [props.src]);

  function componentDidMount() {
    this.loadImage();
  }
  function componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage();
    }
  }
  function componentWillUnmount() {
    this.image.removeEventListener('load', this.handleLoad);
  }
  function loadImage() {
    // save to "this" to remove "load" handler on unmount
    const element = document.createElement("video");
    element.src = this.props.src;
    this.video = element
    this.video.addEventListener('load', this.handleLoad);
    this.image = new window.Image();
    this.image.src = this.props.src;
    this.image.addEventListener('load', this.handleLoad);
    console.log(this.image)
  }
  function handleLoad() {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    setImage(this.image)
    setVideo(this.video)
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  };
  React.useEffect(() => {
    const onload = function () {
      setSize({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
    };
    videoElement.addEventListener("loadedmetadata", onload);
    return () => {
      videoElement.removeEventListener("loadedmetadata", onload);
    };
  }, [videoElement]);

  React.useEffect(() => {
    videoElement.play();
    const layer = props.layer.getStage();

    const anim = new Konva.Animation(() => {}, layer);
    anim.start();

    return () => anim.stop();
  }, [videoElement]);

  function playAudio() {
    if(isPlaying){
    videoElement.pause();
    setIsPlaying(false)
  } else {
    videoElement.play();
    setIsPlaying(true)
  }

  }
return (
  <>

  <Image
    fillPatternImage={fillPatternImage}
    fillPatternScaleY={0.4}
    fillPatternScaleX={0.4}
    draggable
    x={props.x}
    y={props.y}
    width={props.width}
    height={props.height}
    image={videoElement}
    ref={props.ref}
    name={props.name}
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
<Rect
   x={props.x}
   y={props.y}
   width={100}
   height={100}
   draggable
   fill="red"
   ref={props.ref}
   name={props.name}
   shadowBlur={10}
   onDragMove={props.onDragMove}
   onDragEnd={props.onDragEnd}
   />

       </>
);
}

export default URLvideo;
