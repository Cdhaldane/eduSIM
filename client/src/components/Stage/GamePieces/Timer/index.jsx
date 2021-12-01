import React, { forwardRef } from "react";
import AutoUpdate from "../../../AutoUpdate";
import CustomWrapper from "../CustomWrapper";
import moment from "moment";

const Timer = forwardRef((props, ref) => {

  const limit = 10;
  
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

  console.log(startTime, elapsedTime, running, props.status);

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

  return (
    <CustomWrapper {...props} ref={ref}>
      <div>
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
