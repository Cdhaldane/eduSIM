import React, { forwardRef } from 'react';
import * as Survey from "survey-react";
import CustomWrapper from "../CustomWrapper";

import './Poll.css';
import "survey-react/survey.css";

const Poll = forwardRef((props, ref) => {
  return (
    <CustomWrapper {...props} ref={ref}>
      <div className="poll">
        <Survey.Survey
          json={props.defaultProps.custom.pollJson}
        />
      </div>
    </CustomWrapper>
  );
});

export default Poll;