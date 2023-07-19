import Konva from "konva"
import React, { useState, forwardRef, useEffect, useRef, useContext } from 'react';
import CustomWrapper from "./GamePieces/CustomWrapper";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import { SettingsContext } from "../../App";
import Loading from "../Loading/Loading";


const URLVideo = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  return (
    <CustomWrapper {...props} ref={ref}>
      <div className="video-container">
        {loading && <Loading />}
        {props?.type === "audio" ? (
          <ReactAudioPlayer
            className="audio-player"
            src={props.src}
            volume={props.volume}
            loop={props.loop}
            autoPlay={props.autoStart && !props.editMode ? true : false}
            controls={!props.editMode && props.autoStart ? false : true}
            preload="none"
          />
        ) : (
          <>
            <ReactPlayer
              url={props.src}
              volume={props.volume}
              loop={props.loop}
              playing={props.autoStart && !props.editMode ? true : false}
              controls={props.editMode || props.autoStart ? false : true}
              onReady={() => setLoading(false)}
            />
          </>
        )}
      </div>
    </CustomWrapper>
  );
});

export default URLVideo;
