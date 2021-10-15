import React, { forwardRef, useEffect, useRef } from 'react';
import './Poll.css';
import Draggable from 'react-draggable';
import "survey-react/survey.css";
import * as Survey from "survey-react";
import KonvaHtml from "../../KonvaHtml"

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

  const handleLoad = () => {
    const customObjs = document.getElementsByClassName("customObj");
    let thisObj = null;
    for (let i =0; i < customObjs.length; i++) {
      if (customObjs[i].dataset.name === ref._stringRef) {
        thisObj = customObjs[i];
        break;
      }
    }
    console.log(thisObj.parentElement);
    thisObj.parentElement.oncontextmenu = (e) => {
      e.preventDefault();
    }
  }

  useEffect(() => {
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  return (
    <KonvaHtml>
      <Draggable>
        <div className={"customObj"} data-name={ref._stringRef} ref={ref}>
          <div className="poll">
            <Survey.Survey
              json={surveyJson}
            />
          </div>
        </div>
      </Draggable>
    </KonvaHtml>
  )
});

export default Poll;