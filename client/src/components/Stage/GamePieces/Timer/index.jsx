import React, { forwardRef, useEffect } from "react";
import AutoUpdate from "../../../AutoUpdate";
import CustomWrapper from "../CustomWrapper";
import moment from "moment";

const Timer = forwardRef((props, ref) => {

  const limit = props.timeLimit;
  
  const { 
    running = false,
    startTime,
    elapsedTime = 0
  } = props.status;

  const toggleRun = () => {
    if (!running) {
      props.updateStatus({ 
        running: true,
        startTime: moment().valueOf(),
        elapsedTime: elapsedTime
      });
    } else {
      props.updateStatus({
        running: false,
        elapsedTime: moment().diff(moment(startTime - elapsedTime))
      })
    }
  };

  const onReset = () => {
    props.updateStatus({ 
      running: false,
      startTime: null,
      elapsedTime: 0
    });
  };

  const runningValue = () => {
    if (limit) {
      if (moment().diff(moment(startTime - elapsedTime)).valueOf() > 1000*limit) {
        return "haha done";
      }
      return moment(1000*limit - moment().diff(moment(startTime - elapsedTime))).format('mm:ss.SS');
    }
    return moment(moment().diff(moment(startTime - elapsedTime))).format('mm:ss.SS');
  }

  const elapsedValue = () => {
    if (limit) {
      if (elapsedTime > 1000*limit) {
        return "haha done";
      }
      return moment(1000*limit - elapsedTime).format('mm:ss.SS');
    }
    return moment(elapsedTime).format('mm:ss.SS');
  }

  const isDone = () => {
    return (elapsedTime > 0 || running) && (elapsedTime > 1000*limit || moment().diff(moment(startTime - elapsedTime)).valueOf() > 1000*limit);
  }

  const updateValue = (value) => {
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

  useEffect(() => {
    if (props.varEnable && sessionStorage.lastSetVar === props.varEnable && !running) {
      toggleRun();
    }
  }, [sessionStorage.lastSetVar]);

  return (
    <CustomWrapper {...props} ref={ref}>
      <div>
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
            <div>{elapsedValue()}</div>
          )}
        </p>
        <button onClick={toggleRun}>start/stop</button>
        <button onClick={onReset}>reset</button>
      </div>
    </CustomWrapper>
  );
});

export default Timer;
