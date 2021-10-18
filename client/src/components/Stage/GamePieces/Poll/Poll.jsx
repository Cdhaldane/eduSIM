import React, { forwardRef, useEffect, useRef, useState } from 'react';
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

  const obj = useRef(null);

  const getObj = () => {
    return obj.current.parentElement;
  }

  const handleLoad = () => {
    const thisObj = getObj();
    thisObj.parentElement.style.pointerEvents = "none";
  }

  let scrollTimeout = null;
  const noDragTimeout = () => {
    noDrag({ctrlKey: true});

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      activateDrag({key: "Control"})
    }, 100);
  }

  const noDrag = (e) => {
    if (e.ctrlKey) {
      obj.current.classList.remove("customPointerEventsOn");
    }
  }

  const activateDrag = (e) => {
    if (e.key === "Control") {
      obj.current.classList.add("customPointerEventsOn");
    }
  }

  useEffect(() => {
    window.addEventListener("wheel", noDragTimeout);
    window.addEventListener("keydown", noDrag);
    window.addEventListener("keyup", activateDrag);

    return () => {
      window.removeEventListener("wheel", noDragTimeout);
      window.removeEventListener("keydown", noDrag);
      window.removeEventListener("keyup", activateDrag);
    }
  }, []);

  useEffect(() => {
    if (obj.current) {
      handleLoad();
    }
  }, [obj.current]);

  useEffect(() => {
    if (obj.current) {
      const thisObj = getObj();
      thisObj.parentElement.style.zIndex = "0";
    }
  });

  return (
    <KonvaHtml>
      <Draggable>
        <div className={"customObj"} data-name={ref._stringRef} ref={ref}>
          <div className="customPointerEventsOn poll" ref={obj}>
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