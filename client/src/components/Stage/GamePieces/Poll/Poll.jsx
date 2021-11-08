import React, { forwardRef, useEffect, useState } from 'react';
import * as Survey from "survey-react";
import CustomWrapper from "../CustomWrapper";

import './Poll.css';
import "survey-react/survey.css";

const Poll = forwardRef((props, ref) => {

  const [survey, setSurvey] = useState(new Survey.Model(props.defaultProps.custom.pollJson));

  useEffect(() => {
    setSurvey(new Survey.Model(props.defaultProps.custom.pollJson));
  }, [props.defaultProps.custom.pollJson]);

  useEffect(() => {
    // Synchronize the poll answers, page, and completion for all users
    // by reading from the saved synched status variable
    if (props.status.data) {
      for (const q in props.status.data) {
        const answer = props.status.data[q];
        survey.setValue(q, answer);
      }
    }

    if (props.status.page) {
      if (props.status.page === "next") {
        survey.nextPage();
      } else {
        survey.prevPage();
      }
      props.updateStatus({
        ...props.status,
        page: null,
      });
    }

    if (props.status.isComplete) {
      survey.doComplete();
    }
  }, [props.status]);

  const onValueChanged = (survey) => {
    props.updateStatus({
      ...props.status,
      data: survey.data
    });
  }

  const onCurrentPageChanged = (survey, options) => {
    let pageStatus = null;
    if (options.isNextPage) {
      pageStatus = "next";
    } else if (options.isPrevPage) {
      pageStatus = "prev";
    }
    props.updateStatus({
      ...props.status,
      page: pageStatus,
    });
  }

  const onComplete = (survey) => {
    if (!props.status.isComplete) {
      props.updateStatus({
        ...props.status,
        isComplete: true
      });
    }

    // Save survey results
    /*props.updateStatus({
      data: survey.data
    });*/
    //props.defaultProps.onComplete(survey.data);
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      <div className="poll">
        <Survey.Survey
          model={survey}
          onValueChanged={onValueChanged}
          onCurrentPageChanged={onCurrentPageChanged}
          onComplete={onComplete}
        />
      </div>
    </CustomWrapper>
  );
});

export default Poll;