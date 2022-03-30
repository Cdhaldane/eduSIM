import Konva from "konva"
import React, { useState, forwardRef, useEffect, useRef, useContext } from 'react';
import CustomWrapper from "./GamePieces/CustomWrapper";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import { SettingsContext } from "../../App";


const URLVideo = forwardRef((props, ref) => {
  console.log(props)

  const [playing, setPlaying] = useState(false)

  const handlePlay = () => {
    setPlaying(!playing)
    console.log(playing)
  }

  return (
    <CustomWrapper {...props} ref={ref}>
        <div className="video-container">
          {props?.type === "audio" ? (
            <ReactAudioPlayer
               src={props.src}
               controls={true}
               preload="none"
            />
          ) : (
            <ReactPlayer url={props.src}
              playing={playing}
              controls={props.editMode ?  false : true}
            />
          )}
        </div>
    </CustomWrapper>
  );
});

export default URLVideo;
