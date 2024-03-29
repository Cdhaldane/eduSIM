import React, { forwardRef, useEffect, useState } from 'react';
import * as Survey from "survey-react";
import CustomWrapper from "../CustomWrapper";

import './Poll.css';
import "survey-react/survey.css";

const Poll = forwardRef((props, ref) => {
  const [survey, setSurvey] = useState(new Survey.Model(props.defaultProps.custom.pollJson));
  const [completed, setCompleted] = useState();
  const customName = props.defaultProps.custom.customName;
  const [score, setScore] = useState([]);

  survey.mode = props.editMode ? 'display' : "";

  useEffect(() => {
    setSurvey(new Survey.Model(props.defaultProps.custom.pollJson));
  }, [props.defaultProps.custom.pollJson]);

  useEffect(() => {
    let data = null;
    let page = null;
    let isComplete = null;
    if (props.infolevel || props.overlay) {
      if (props.status[props.defaultProps.userId] === undefined) return;
      data = props.status[props.defaultProps.userId].data;
      page = props.status[props.defaultProps.userId].page;
      isComplete = props.status[props.defaultProps.userId].isComplete;
    } else {
      if (props.status === undefined) return;
      data = props.status.data;
      page = props.status.page;
      isComplete = props.status.isComplete;
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
    const pages = props.defaultProps.custom.pollJson.pages;
    let questions = [];
    for (let i = 0; i < pages.length; i++) {
      questions.push(pages[i].questions);
    }
    questions = questions.flat();

    // Check if values are the correct answer and set variable
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const correctVar = customName + `_q${i + 1}_correct`;
      let answer = survey.data[question.name];
      if (answer === undefined || answer === null) {
        setVar(correctVar, false);
        continue;
      }
      if (typeof answer === "boolean") {
        answer = answer ? "yes" : "no";
      }
      if (question.type === "text") {
        answer = answer.toLowerCase();
      }

      //             (new Set([...(new Set(answer))].filter(x => (new Set(correctAnswer)).has(x)))).size > 0) &&
      const correctAnswer = question.correctAnswer;
      if (correctAnswer !== null) {
        if (
          (correctAnswer === answer) ||
          (question.type === "text" && Array.isArray(correctAnswer) && correctAnswer.map(ans => ans.toLowerCase()).includes(answer)) ||
          (question.type === "checkbox" && Array.isArray(answer) && Array.isArray(correctAnswer) && 
          answer.length === correctAnswer.length &&
          answer.sort().every((ans, i) => {
            return ans === correctAnswer.sort()[i];
          }))
        ) {
          setVar(correctVar, true);
        } else {
          setVar(correctVar, false);
        }
        setScore([...score, [question.id, correctAnswer, answer]]);

      }
    }

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

  const setVar = (varName, value) => {
    let vars = {};
    if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
    sessionStorage.setItem('gameVars', JSON.stringify({
      ...vars,
      [varName]: value
    }));
    sessionStorage.setItem('lastSetVar', varName);
  }

  const onComplete = (survey) => {
    if (!props.status.isComplete) {
      setCompleted(true);
      props.updateStatus(formatData("isComplete", true));

      // Set the completion variable
      setVar(customName + "_completed", true);
      props.updateVariable(props.defaultProps.custom.varName, calculateTruePercentage(score))
      setVar(customName + "_score", calculateTruePercentage(score))
    }
   
  }
  const calculateTruePercentage = (arr) => {
    if (arr.length === 0) {
      return 0; // If the array is empty, return 0%
    }
    let out = [];
    const unique = getUniqueArray(arr);
    unique.map((item, index) => {
        if(item[1] === item[2]){
          out.push(true)
        } else {
          out.push(false)
        }  
    })
    var trueCount = out.filter(function(value) {
      return value === true;
    }).length;
    var truePercentage = (trueCount / unique.length) * 100;
  
    return truePercentage;
  }
  const getUniqueArray = (arr) => {
    const uniqueMap = new Map();
    
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = arr[i][0];
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, arr[i]);
      }
    }
  
    return Array.from(uniqueMap.values());
  }

  // Formats the status data according to if it is for personal/overlay or group area
  const formatData = (type, val) => {
    if (props.infolevel || props.overlay) {
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
          onComplete={(survey) => {
            if (!completed) {
              onComplete(survey);
            }
          }}
        />
      </div>
    </CustomWrapper>
  );
});

export default Poll;
