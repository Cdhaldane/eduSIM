import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';

import 'rc-slider/assets/index.css';
import "./DropdownEditObject.css";

const DropdownEditPoll = (props) => {

  const [activeMenu, setActiveMenu] = useState('main');
  const [pages, setPages] = useState(props.shape.attrs.customProps.pollJson.pages);
  const [currentQuestion, setCurrentQuestion] = useState({
    pIndex: 0,
    qIndex: 0
  });
  const [correctAnswers, setCorrectAnswers] = useState([]);

  useEffect(() => {
    const inputs = Array.prototype.slice.call(document.getElementsByClassName("pollEditQuestionInput"));
    const inputFocused = inputs.some((input) => input === document.activeElement)
    if (pages) {
      const theInput = document.activeElement;
      createJson();
      if (inputFocused) {
        setTimeout(() => theInput.focus(), 0);
      }
    }
  }, [pages]);

  const createJson = () => {
    const pagesJson = pages.map((p) => {
      const questions = p.questions;
      const qJson = questions.map((q, index) => {
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
      });
      return {
        questions: qJson
      };
    });
    const json = {
      "showProgressBar": pages.length === 1 ? null : "bottom",
      "pages": pagesJson
    };
    props.setJson(json, props.shape.attrs.id);
  }

  const setQuestionParam = (type, pIndex, qIndex, val) => {
    let pageQs = [...pages[pIndex].questions];
    const newQ = pageQs[qIndex];
    newQ[type] = val;
    pageQs[qIndex] = newQ;
    pageQs = {
      questions: pageQs
    };
    const newPages = [...pages];
    newPages[pIndex] = pageQs;
    setPages(newPages);
  }

  const renderQuestions = () => {
    return pages.map((p, pIndex) => {
      const questions = p.questions;
      const pageQuestions = questions.map((q, index) => {
        return (
          <tr key={index}>
            <td>
              <input
                className="pollEditQuestionInput"
                type="text"
                placeholder="Question here"
                value={q.title}
                onChange={(e) => {
                  setQuestionParam("title", pIndex, index, e.target.value);
                }} />
            </td>
            <td>
              <select value={q.inputType || q.type} onChange={(e) => {
                switch (e.target.value) {
                  case "text":
                  case "date":
                  case "color":
                    setQuestionParam("type", pIndex, index, "text");
                    setQuestionParam("inputType", pIndex, index, e.target.value);
                    setQuestionParam("choices", pIndex, index, null);
                    break;
                  case "dropdown":
                  case "radiogroup":
                  case "checkbox":
                    setQuestionParam("hasNone", pIndex, index, true);
                    setQuestionParam("choices", pIndex, index, [
                      "Click the cog to edit choices...",
                      "Click the cog to edit choices..."
                    ]);
                    setQuestionParam("colCount", pIndex, index, 1);
                  default:
                    setQuestionParam("type", pIndex, index, e.target.value);
                    setQuestionParam("inputType", pIndex, index, null);
                    break;
                }

                if (e.target.value === "boolean") {
                  setQuestionParam("choices", pIndex, index, null);
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
              <input
                type="checkbox"
                checked={q.isRequired}
                value={q.isRequired}
                onChange={(e) => {
                  setQuestionParam("isRequired", pIndex, index, e.target.checked);
                }} />
            </td>
            <td
              className={`editPollEditBtns`}
              onClick={() => {
                if (!(pIndex === 0 && index === 0)) {
                  if (index !== 0) {
                    // It is not the first question on the page (move it up one)
                    const pageQs = pages[pIndex].questions;
                    const prevQ = pageQs[index - 1];
                    pageQs[index - 1] = q;
                    pageQs[index] = prevQ;
                    const newPages = [...pages];
                    newPages[pIndex] = {
                      questions: pageQs
                    };
                    setPages(newPages);
                  } else {
                    // It is the first question on the page (move to end of previous page)
                    const prevPage = {
                      questions: [...pages[pIndex - 1].questions, q]
                    };
                    const thisPage = {
                      questions: [...p.questions].slice(1)
                    };
                    let newPages = [...pages];
                    newPages[pIndex - 1] = prevPage;
                    if (thisPage.questions.length) {
                      newPages[pIndex] = thisPage;
                    } else {
                      newPages[pIndex] = null;
                      newPages = newPages.filter(e => e);
                    }
                    setTimeout(() => setPages(newPages), 0);
                  }
                }
              }}
            >
              <i
                className={`fas fa-caret-up ${pIndex === 0 && index === 0 ? "disabled" : ""}`}
              />
            </td>
            <td
              className={`editPollEditBtns`}
              onClick={() => {
                if (!(pIndex === (pages.length - 1) && index === (p.questions.length - 1))) {
                  if (index !== (p.questions.length - 1)) {
                    // It is not the last question on the page (move it down one)
                    const pageQs = pages[pIndex].questions;
                    const nextQ = pageQs[index + 1];
                    pageQs[index + 1] = q;
                    pageQs[index] = nextQ;
                    const newPages = [...pages];
                    newPages[pIndex] = {
                      questions: pageQs
                    };
                    setPages(newPages);
                  } else {
                    // It is the last question on the page (move to start of next page)
                    const nextPage = {
                      questions: [q, ...pages[pIndex + 1].questions]
                    };
                    const thisPage = {
                      questions: [...p.questions].slice(0, -1)
                    };
                    let newPages = [...pages];
                    newPages[pIndex + 1] = nextPage;
                    if (thisPage.questions.length) {
                      newPages[pIndex] = thisPage;
                    } else {
                      newPages[pIndex] = null;
                      newPages = newPages.filter(e => e);
                    }
                    setTimeout(() => setPages(newPages), 0);
                  }
                }
              }}
            >
              <i
                className={`fas fa-caret-down 
                ${pIndex === (pages.length - 1) && index === (p.questions.length - 1) ? "disabled" : ""}`}
              />
            </td>
            <td
              className="editPollEditBtns"
              onClick={() => {
                if ((q.inputType || q.type) !== "color") {
                  setActiveMenu("settings");
                  setCurrentQuestion({
                    pIndex: pIndex,
                    qIndex: index
                  });
                }
              }}
            >
              <i className={`fas fa-cog ${(q.inputType || q.type) === "color" ? "disabled" : ""}`} />
            </td>
            <td
              className={`editPollEditBtns`}
              onClick={() => {
                if (pages.map((p) => {
                  return p.questions;
                }).flat().length > 1) {
                  if (p.questions.length === 1) {
                    // Delete page (since it is the last question on the page)
                    const newPages = [...pages.slice(0, pIndex), ...pages.slice(pIndex + 1)];
                    setTimeout(() => setPages(newPages), 0);
                  } else {
                    // Delete question from page
                    const newPage = {
                      questions: [...p.questions.slice(0, index), ...p.questions.slice(index + 1)]
                    };
                    const newPages = [...pages];
                    newPages[pIndex] = newPage;
                    setTimeout(() => setPages(newPages), 0);
                  }
                }
              }}>
              <i
                className={`fas fa-trash-alt ${pages.map((p) => {
                  return p.questions;
                }).flat().length === 1 ? "disabled" : ""}`}
              />
            </td>
          </tr >
        );
      });
      return (
        <React.Fragment key={pIndex}>
          {pIndex > 0 && (
            <tr>
              <td>
                <i className="fas fa-scroll editPollNewPageIcon" />
                New Page
              </td>
              <td></td>
              <td></td>
              <td
                className={`editPollEditBtns`}
                onClick={() => {
                  // Move question above down to next page
                  const prevQs = pages[pIndex - 1].questions;
                  const q = prevQs[prevQs.length - 1];
                  const nextPage = {
                    questions: [q, ...pages[pIndex].questions]
                  };
                  const thisPage = {
                    questions: [...prevQs].slice(0, -1)
                  };
                  let newPages = [...pages];
                  newPages[pIndex] = nextPage;
                  if (thisPage.questions.length) {
                    newPages[pIndex - 1] = thisPage;
                  } else {
                    newPages[pIndex - 1] = null;
                    newPages = newPages.filter(e => e);
                  }
                  setTimeout(() => setPages(newPages), 0);
                }}
              >
                <i
                  className={`fas fa-caret-up`}
                />
              </td>
              <td
                className={`editPollEditBtns`}
                onClick={() => {
                  // Move question below page above to previous page
                  const p = pages[pIndex - 1].questions;
                  const q = pages[pIndex].questions[0];
                  const prevPage = {
                    questions: [...p, q]
                  };
                  const thisPage = {
                    questions: [...pages[pIndex].questions].slice(1)
                  };
                  let newPages = [...pages];
                  newPages[pIndex - 1] = prevPage;
                  if (thisPage.questions.length) {
                    newPages[pIndex] = thisPage;
                  } else {
                    newPages[pIndex] = null;
                    newPages = newPages.filter(e => e);
                  }
                  setTimeout(() => setPages(newPages), 0);
                }}
              >
                <i
                  className={`fas fa-caret-down`}
                />
              </td>
              <td
                className="editPollEditBtns"
              >
                <i className={`fas fa-cog disabled`} />
              </td>
              <td
                className={"editPollEditBtns"}
                onClick={() => {
                  // Merge this page with the previous
                  const thisPage = pages[pIndex].questions;
                  const prevPage = pages[pIndex - 1].questions;
                  const newPrev = {
                    questions: [...prevPage, ...thisPage]
                  };
                  let newPages = [...pages];
                  newPages[pIndex - 1] = newPrev;
                  newPages = [...newPages.slice(0, pIndex), ...newPages.slice(pIndex + 1)];
                  setTimeout(() => setPages(newPages), 0);
                }}>
                <i
                  className={`fas fa-trash-alt`}
                />
              </td>
            </tr>
          )}
          {pageQuestions}
        </React.Fragment>
      );
    });
  }

  const optionsForQuestion = () => {
    const options = pages[currentQuestion.pIndex].questions[currentQuestion.qIndex].choices;
    if (options) {
      return options.map((o, index) => {
        return (
          <tr key={index}>
            <td>
              <input
                className="pollEditQuestionInput"
                type="text"
                placeholder="Option text here"
                value={o}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setQuestionParam("choices", currentQuestion.pIndex, currentQuestion.qIndex, newOptions);
                }}
              />
            </td>
            <td
              className={"editPollEditBtns"}
              onClick={() => {
                if (options.length > 1) {
                  const newOptions = [...options.slice(0, index), ...options.slice(index + 1)];
                  setTimeout(() =>
                    setQuestionParam("choices", currentQuestion.pIndex, currentQuestion.qIndex, newOptions),
                    0);
                }
              }}>
              <i
                className={`fas fa-trash-alt ${options.length === 1 ? "disabled" : ""}`}
              />
            </td>
          </tr>
        );
      });
    }
  }

  const defaultQ = () => {
    return {
      // Makes each question unique
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      title: "",
      type: "text",
      isRequired: false,
      options: null,
      correctAnswer: null,
      hasNone: null,
      choices: null
    }
  }

  const getSelectedQType = () => {
    const q = pages[currentQuestion.pIndex].questions[currentQuestion.qIndex];
    return q.inputType || q.type;
  }

  const setDropdownAnswerOptions = () => {
    if (getSelectedQType() === "boolean") {
      return (
        <>
          <option value="none">Select an Answer</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </>
      );
    } else {
      const choices = pages[currentQuestion.pIndex].questions[currentQuestion.qIndex].choices;
      return (
        <>
          <option value="none">Select an Answer</option>
          {choices.map((c, i) => {
            return (
              <option key={i} value={c}>{c}</option>
            );
          })}
        </>
      );
    }
  }

  const setNewAnswers = (e) => {
    // For text -> save the answer string (e.g: "Mount Everest")
    // For dropdown, radiogroup, checkboxes -> save answer index (e.g: 3)
    // For boolean -> save "Yes" or "No" string
    // For date -> save date as string with YYYY-MM-DD format
    console.log(e.target.value);
  }

  const addQuestion = () => {
    let lastPageQuestions = pages[pages.length - 1].questions;
    lastPageQuestions.push(defaultQ());
    lastPageQuestions = {
      questions: lastPageQuestions
    }
    const newPages = [...pages.slice(0, pages.length - 1), lastPageQuestions];
    setPages(newPages);
  }

  const addPage = () => {
    const newPages = [...pages, {
      questions: [
        defaultQ()
      ]
    }];
    setPages(newPages);
  }

  return (
    <div className="editPollContainer">
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        unmountOnExit
        classNames="editPollPrimary"
      >
        <div>
          <h1 style={{ paddingBottom: "0.5rem" }}>{props.title}</h1>
          <table className="editPollQuestionBox">
            <thead className="editPollTableHead">
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
                <th>
                </th>
                <th>
                </th>
              </tr>
            </thead>
            <tbody className="editPollQuestionsArea">
              {renderQuestions()}
            </tbody>
          </table>
          <button
            onClick={addQuestion}
            className="editPollAddQuestionBtn"
          >
            <i className="fas fa-question-circle" />
            Add Question
          </button>

          <button
            onClick={addPage}
            className="editPollAddQuestionBtn"
            style={{ marginLeft: "10px" }}
          >
            <i className="fas fa-scroll" />
            Add New Page
          </button>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'settings'}
        timeout={500}
        unmountOnExit
        classNames="editPollSecondary"
      >
        <div>
          <button
            onClick={() => {
              setActiveMenu("main");
            }}
            className="editPollBackButton"
          >
            <i className="fas fa-arrow-left" />
          </button>
          <h1 style={{
            display: "inline"
          }}
          >
            Edit Question: "{
              pages[currentQuestion.pIndex].questions[currentQuestion.qIndex].title ||
              pages[currentQuestion.pIndex].questions[currentQuestion.qIndex].name
            }"
          </h1>
          <table
            style={{
              marginTop: "10px",
              display: "table"
            }}
            className="editPollQuestionBox"
          >
            <tbody className="editPollQuestionsArea">
              {optionsForQuestion()}
            </tbody>
          </table>
          {pages[currentQuestion.pIndex].questions[currentQuestion.qIndex].choices && (
            <>
              <button
                onClick={() => {
                  const options = pages[currentQuestion.pIndex].questions[currentQuestion.qIndex].choices;
                  const newOptions = [...options, ""];
                  setTimeout(
                    setQuestionParam("choices", currentQuestion.pIndex, currentQuestion.qIndex, newOptions),
                    0);
                }}
                className="editPollAddQuestionBtn"
              >
                <i className="fas fa-list" />
                Add Option
              </button>
              <hr />
            </>
          )}
          <div
            style={{
              width: "100%",
              textAlign: "center"
            }}
          >
            Correct Answer (Leave blank if not applicable):
            {["text"].includes(getSelectedQType()) && (
              <input
                className="editPollAnswerBox"
                type="text"
                placeholder="Answer Value Here"
                value={""}
                onChange={(e) => {
                  //
                }}
              />
            )}

            {["dropdown", "checkbox", "boolean", "radiogroup"].includes(getSelectedQType()) && (
              <select className="editPollAnswerBox" onChange={setNewAnswers}>
                {setDropdownAnswerOptions()}
              </select>
            )}

            {["date"].includes(getSelectedQType()) && (
              <input
                className="editPollAnswerBox"
                type="date"
                value=""
                min=""
                max=""
                onChange={setNewAnswers}
              />
            )}
          </div>
        </div>
      </CSSTransition>
    </div>
  );

}

export default DropdownEditPoll;
