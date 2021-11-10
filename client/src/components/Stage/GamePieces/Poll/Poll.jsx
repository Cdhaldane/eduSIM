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
    let data = null;
    let page = null;
    let isComplete = null;
    if (!props.infolevel) {
      if (props.status === undefined) return;
      data = props.status.data;
      page = props.status.page;
      isComplete = props.status.isComplete;
    } else {
      if (props.status[props.defaultProps.userId] === undefined) return;
      data = props.status[props.defaultProps.userId].data;
      page = props.status[props.defaultProps.userId].page;
      isComplete = props.status[props.defaultProps.userId].isComplete;
    }

    // Synchronize the poll answers, page, and completion for all users
    // by reading from the saved synched status variable
    if (data) {
      for (const q in data) {
        const answer = data[q];
        survey.setValue(q, answer);
      }
    }

    if (page) {
      if (page === "next") {
        survey.nextPage();
      } else {
        survey.prevPage();
      }
      props.updateStatus({
        ...props.status,
        page: null,
      });
    }

    if (isComplete) {
      survey.doComplete();
    }
  }, [props.status]);

  const onValueChanged = (survey) => {
    props.updateStatus(formatData("data", survey.data));
  }

  const onCurrentPageChanged = (survey, options) => {
    let pageStatus = null;
    if (options.isNextPage) {
      pageStatus = "next";
    } else if (options.isPrevPage) {
      pageStatus = "prev";
    }
    props.updateStatus(formatData("page", pageStatus));
  }

  const onComplete = (survey) => {
    if (!props.status.isComplete) {
      props.updateStatus(formatData("isComplete", true));
    }
  }

  // Formats the status data according to if it is for personal or group area
  const formatData = (type, val) => {
    if (props.infolevel) {
      return {
        ...props.status,
        [props.defaultProps.userId]: {
          ...props.status[props.defaultProps.userId],
          [type]: val
        }
      }
    } else {
      return {
        ...props.status,
        [type]: val
      }
    }
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