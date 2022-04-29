import React, { forwardRef, useEffect, useState } from "react";
import AutoUpdate from "../../../AutoUpdate";
import CustomWrapper from "../CustomWrapper";
import styled from 'styled-components';
import moment from "moment";

const TimerContainer = styled.div`
  width: 200px;
  background-color: gray;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--primary);
  ${p => p.invisible && "display: none;"}
  & > p {
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-family: monospace;
    font-weight: bold;
    background-color: rgba(0,0,0,0.8);
    color: white;
  }
  & > div {
    display: flex;
    height: 40%;
  }
  & > div > button {
    flex: 1;
    border-radius: 0;
    background: none;
    border: none;
    color: white;
    font-family: inherit;
    cursor: pointer;
  }
  & > div > button:hover {
    background: rgba(255,255,255,0.08);
  }
  & > div > div {
    width: 1px;
    height: 40px;
    align-self: center;
    background-color: white;
    opacity: 0.4;
  }
`;

const Timer = forwardRef((props, ref) => {
  console.log(props)
  const limit = props.timeLimit;

  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {

    if (props.infolevel || props.overlay) {
      if (props.status[props.defaultProps.userId] === undefined) return;
      setRunning(props.status[props.defaultProps.userId].running);
      setStartTime(props.status[props.defaultProps.userId].startTime);
      setElapsedTime(props.status[props.defaultProps.userId].elapsedTime);
    } else {
      if (props.status === undefined || Object.keys(props.status).length === 0) return;
      setRunning(props.status.running);
      setStartTime(props.status.startTime);
      setElapsedTime(props.status.elapsedTime);

    }
  }, [props.status]);



  // Formats the status data according to if it is for personal/overlay or group area
  const formatData = (val) => {
    if (props.infolevel || props.overlay) {
      return {
        ...props.status,
        [props.defaultProps.userId]: {
          ...props.status[props.defaultProps.userId],
          ...val
        }
      }
    } else {
      return {
        ...props.status,
        ...val
      }
    }
  }



  const toggleRun = () => {
    if (!running) {
      props.updateStatus(formatData({
        running: true,
        startTime: moment().valueOf(),
        elapsedTime: elapsedTime
      }));
    } else {
      props.updateStatus(formatData({
        running: false,
        elapsedTime: moment().diff(moment(startTime - elapsedTime))
      }))
    }
  };

  const onReset = () => {
    props.updateStatus(formatData({
      running: false,
      startTime: null,
      elapsedTime: 0
    }));
  };

  const runningValue = () => {
    if (limit) {
      if (moment().diff(moment(startTime - elapsedTime)).valueOf() > 1000 * limit) {
        return (moment().diff(moment(startTime - elapsedTime)).valueOf() / 500) % 2 < 1 ? '00:00.00' : '';
      }
      return moment(1000 * limit - moment().diff(moment(startTime - elapsedTime))).format('mm:ss.SS');
    }
    return moment(moment().diff(moment(startTime - elapsedTime))).format('mm:ss.SS');
  }

  const elapsedValue = () => {
    if (limit) {
      if (elapsedTime > 1000 * limit) {
        return "00:00.00";
      }
      return moment(1000 * limit - elapsedTime).format('mm:ss.SS');
    }
    return moment(elapsedTime).format('mm:ss.SS');
  }

  const isDone = () => {
    return (elapsedTime > 0 || running) && (elapsedTime > 1000 * limit || moment().diff(moment(startTime - elapsedTime)).valueOf() > 1000 * limit);
  }

  const updateValue = (value) => {
    if (props.sync && props.updateVariable) {
      props.updateVariable(props.varName, value)
    } else {
    if (props.varName) {
      let vars = {};
      if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
      sessionStorage.setItem('gameVars', JSON.stringify({
        ...vars,
        [props.varName]: value
      }));
      sessionStorage.setItem('lastSetVar', props.varName);
      if (props.refresh) props.refresh();
    }
  }
  }

  useEffect(() => {
    if (props.varEnable && sessionStorage.lastSetVar === props.varEnable && !running) {
      toggleRun();
    }
  }, [sessionStorage.lastSetVar]);

  return (
    <CustomWrapper {...props} ref={ref}>
      <TimerContainer invisible={props.invisible}>
        {props.varName && (
          <AutoUpdate
            value={isDone}
            intervalTime={100}
            noDisplay
            enabled
            onChange={updateValue}
          />
        )}
        <p>
          {running ? (
            <AutoUpdate
              value={runningValue}
              intervalTime={20}
              enabled
            />
          ) : (
            elapsedValue()
          )}
        </p>
        {props.controls && (
          <div>
            <button onClick={toggleRun}>{running ? 'Pause' : 'Start'}</button>
            <div />
            <button onClick={onReset}>Reset</button>
          </div>
        )}
      </TimerContainer>
    </CustomWrapper>
  );
});

export default Timer;
