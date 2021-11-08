import React, { forwardRef, useEffect } from 'react';
import * as Survey from "survey-react";
import CustomWrapper from "../CustomWrapper";

import './Poll.css';
import "survey-react/survey.css";

const Poll = forwardRef((props, ref) => {

  const onComplete = (survey, options) => {
    // Save survey results
    /*props.updateStatus({
      data: survey.data
    });*/
    //props.defaultProps.onComplete(survey.data);
  }

  useEffect(() => {
    console.log(props.status);
    for (q in props.status) {
      console.log(q);
    }
  }, [props.status]);

  const onValueChanged = (survey) => {
    props.updateStatus({
      data: survey.data
    });
    //console.log(survey.data);
    //survey.setValue("Page 1 Question 1", "OOGA");
    // props.updateStatus({
    //   data: survey.data
    // });
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      <div className="poll">
        <Survey.Survey
          onValueChanged={onValueChanged}
          onComplete={onComplete}
          json={props.defaultProps.custom.pollJson}
        />
      </div>
    </CustomWrapper>
  );
});

export default Poll;