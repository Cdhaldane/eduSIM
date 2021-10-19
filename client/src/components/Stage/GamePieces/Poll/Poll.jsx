import React, { forwardRef } from 'react';
import './Poll.css';
import "survey-react/survey.css";
import * as Survey from "survey-react";
import CustomWrapper from "../CustomWrapper";

const surveyJson = {
  questions: [
    {
      name: "name",
      type: "text",
      title: "Please enter your name:",
      placeHolder: "Jon Snow",
      isRequired: true,
      autoComplete: "name"
    }, {
      name: "birthdate",
      type: "text",
      inputType: "date",
      title: "Your birthdate:",
      isRequired: true,
      autoComplete: "bdate"
    }, {
      name: "color",
      type: "text",
      inputType: "color",
      title: "Your favorite color:"
    }, {
      name: "email",
      type: "text",
      inputType: "email",
      title: "Your e-mail:",
      placeHolder: "jon.snow@nightwatch.org",
      isRequired: true,
      autoComplete: "email",
      validators: [
        {
          type: "email"
        }
      ]
    }
  ]
};

const Poll = forwardRef((props, ref) => {
  return (
    <CustomWrapper {...props} ref={ref}>
      <div className="poll">
        <Survey.Survey
          json={surveyJson}
        />
      </div>
    </CustomWrapper>
  );
});

export default Poll;