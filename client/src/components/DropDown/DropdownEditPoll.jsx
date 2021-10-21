import React, { useState, useEffect } from 'react';

import 'rc-slider/assets/index.css';
import "./DropdownEditObject.css";

const DropdownEditPoll = (props) => {

  const [questions, setQuestions] = useState(props.pollJson.questions);

  useEffect(() => {
    const inputs = Array.prototype.slice.call(document.getElementsByClassName("pollEditQuestionInput"));
    const inputFocused = inputs.some((input) => input === document.activeElement)
    if (questions) {
      const theInput = document.activeElement;
      createJson();
      if (inputFocused) {
        setTimeout(() => theInput.focus(), 0);
      }
    }
  }, [questions]);

  const createJson = () => {
    const jsonQs = questions.map((q, index) => {
      return {
        id: q.id,
        name: "Question #" + (index + 1),
        type: q.type,
        inputType: q.inputType,
        title: q.title,
        isRequired: q.isRequired,
        choices: q.choices,
        hasNone: false
      }
    })
    const json = {
      questions: jsonQs
    };
    props.setJson(json);
  }

  const setQuestionParam = (type, index, val) => {
    const newQs = [...questions];
    newQs[index][type] = val;
    setQuestions(newQs);
  }

  const renderQuestions = () => {
    return questions.map((q, index) => {
      return (
        <tr key={index}>
          <td>
            <input
              className="pollEditQuestionInput"
              type="text"
              placeholder="Question here"
              value={q.title}
              onChange={(e) => {
                setQuestionParam("title", index, e.target.value);
              }} />
          </td>
          <td>
            <select value={q.inputType || q.type} onChange={(e) => {
              switch (e.target.value) {
                case "text":
                case "date":
                case "color":
                  setQuestionParam("type", index, "text");
                  setQuestionParam("inputType", index, e.target.value);
                  break;
                case "dropdown":
                case "radiogroup":
                case "checkbox":
                  setQuestionParam("hasNone", index, true);
                  setQuestionParam("choices", index, [
                    "Click the cog to edit choices...",
                    "Click the cog to edit choices..."
                  ]);
                  setQuestionParam("colCount", index, 1);
                default:
                  setQuestionParam("type", index, e.target.value);
                  setQuestionParam("inputType", index, null);
                  break;
              }
            }}>
              <option value="text">
                Text
              </option>
              <option value="dropdown">
                Dropdown
              </option>
              <option value="radiogroup">
                Radio Group
              </option>
              <option value="checkbox">
                Checkboxes
              </option>
              <option value="boolean">
                Boolean
              </option>
              <option value="date">
                Date
              </option>
              <option value="color">
                Color
              </option>
            </select>
          </td>
          <td className="pollsEditorRequiredCheck">
            <input type="checkbox" checked={q.isRequired} onChange={(e) => {
              setQuestionParam("isRequired", index, e.target.checked);
            }} />
          </td>
          <td
            className="editPollEditBtns"
            onClick={() => {
              createJson();
            }}
          >
            <i className="fas fa-cog" />
          </td>
          <td
            className={"editPollEditBtns"}
            onClick={() => {
              if (questions.length > 1) {
                setTimeout(() => setQuestions(questions.filter((question) => question.id !== q.id)), 0);
              }
            }}>
            <i
              className={`fas fa-trash-alt ${questions.length === 1 ? "disabled" : ""}`}
            />
          </td>
        </tr >
      );
    });
  }

  const addQuestion = () => {
    const newQ = {
      // Makes each question unique
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      title: "",
      type: "text",
      isRequired: false,
      options: null,
      correctAnswer: null,
      hasNone: null,
      choices: null
    };
    setQuestions([...questions, newQ]);
  }

  return (
    <>
      <h1 style={{ paddingBottom: "0.5rem" }}>{props.title}</h1>
      <table className="editPollQuestionBox">
        <tbody>
          <tr>
            <th>
              Question
            </th>
            <th>
              Type
            </th>
            <th className="editPollStar">
              *
            </th>
          </tr>
          {renderQuestions()}
        </tbody>
      </table>
      <button
        onClick={addQuestion}
        className="editPollAddQuestionBtn"
      >
        <i className="fas fa-plus-square" />
        Add Question
      </button>
    </>
  );

}

export default DropdownEditPoll;
