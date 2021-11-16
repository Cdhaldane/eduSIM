import React, { useState, forwardRef } from "react";
import Switch from "react-switch";
import { PieChart, Pie, Legend, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import "./Performance.css";

const Performance = forwardRef((props, ref) => {

  const pollQOptionChanged = (e, pollI, pageI, qI) => {
    const val = e.target.value;
    const id = props.customObjs.polls[pollI].id;

    // Set the performance option on the question
    const newQ = { ...props.customObjs.polls[pollI].json.pages[pageI].questions[qI] };
    newQ.performanceOption = val;
    const newPollJson = { ...props.customObjs.polls[pollI].json };
    newPollJson.pages[pageI].questions[qI] = newQ;

    props.setData.setPollData("json", newPollJson, id);
  }

  const PIE_CHART_COLORS = ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b", "#7dce82", "#3cdbd3"];

  const pollAnswerHTML = (answer, question) => {
    if (answer === true) {
      return "Yes";
    } else if (answer === false) {
      return "No";
    } else if (question.inputType && question.inputType === "color") {
      return (
        <div style={{
          display: "inline-block",
          height: "25px",
          width: "25px",
          borderRadius: "50%",
          transform: "translateY(4px)",
          border: "1px solid black",
          backgroundColor: answer
        }} />
      );
    } else {
      return answer;
    }
  }

  const pollAllDataAnswer = (allData, question) => {
    // The performance option is either allResponses or commonResponse
    // so get all responses from users
    let answer = "";
    const responses = [];
    for (const userId in allData) {
      const personalResponse = allData[userId].data ? allData[userId].data[question.name] : undefined;
      responses.push(personalResponse);
    }
    const responseSet = new Set(responses);
    responseSet.delete(undefined);
    const responsesNoDupes = [...responseSet];
    if (!responsesNoDupes.length) {
      answer = "No Responses";
    } else if (question.performanceOption === "allResponses" || props.adminMode) {
      // Convert all data to Pie Chart format
      const pieChartData = [];
      for (let i = 0; i < responsesNoDupes.length; i++) {
        pieChartData.push({
          name: responsesNoDupes[i],
          value: responses.filter((response) => response === responsesNoDupes[i]).length
        });
      }
      answer = (
        <div className="performancePieChartContainer">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                isAnimationActive={false}
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={65}
                fill="#8f001a"
                label={(entry) => {
                  if (question.inputType && question.inputType === "color") {
                    return (
                      <>
                        <circle cx={entry.x} cy={entry.y} r="15" stroke="black" stroke-width="1" fill={entry.name} />
                      </>
                    );
                  }
                  if (entry.name === true) {
                    return "Yes";
                  } else if (entry.name === false) {
                    return "No";
                  } else {
                    return entry.name;
                  }
                }}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (question.performanceOption === "commonResponse") {
      // Get most common response from data
      const numOfResponses = [];
      for (let i = 0; i < responsesNoDupes.length; i++) {
        numOfResponses.push(responses.filter((response) => response === responsesNoDupes[i]).length);
      }
      const maxResponseI = numOfResponses.indexOf(Math.max(...numOfResponses));
      answer = pollAnswerHTML(responsesNoDupes[maxResponseI], question);
    }

    return answer;
  }

  return (
    <>
      <div className={`area ${props.adminMode ? "forceDivNormal" : ""}`}>
        <form className={`form-input performanceForm 
        ${props.adminMode ? "forceDivNormal noForm" : ""}`} ref={ref}>
          {props.setData && (
            <div className="performanceContainer">
              <h2 className="performanceTitle">Performance Report Settings</h2>
              <div className="performanceTableContainer">
                <table className="performanceTable">
                  <tbody>
                    {Object.keys(props.customObjs).map((key) => {
                      switch (key) {
                        case "polls":
                          return props.customObjs[key].map((poll, i) => {
                            return (
                              <tr key={i} className="performancePollRow">
                                <td>
                                  <Switch
                                    onColor="#1b65f3"
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                    className="react-switch"
                                    height={25}
                                    width={45}
                                    handleDiameter={23}
                                    onChange={(val) => {
                                      props.setData.setPollData("performanceEnabled", val, poll.id);
                                    }}
                                    checked={poll.performanceEnabled}
                                  />
                                  <span>
                                    {`Poll ${i + 1} - ${poll.customName ? poll.customName : "Untitled"}`}
                                  </span>
                                  {poll.performanceEnabled && (
                                    <>
                                      {poll.json.pages.map((page, pageI) => (
                                        <React.Fragment key={pageI}>
                                          {page.questions.map((q, qI) => {
                                            return (
                                              <div key={qI}>
                                                <div className="performanceQNames">
                                                  {q.title}
                                                </div>
                                                <div className="performanceQOptions">
                                                  <table>
                                                    <tbody>
                                                      {(poll.infolevel || poll.overlay) && (
                                                        <>
                                                          <tr>
                                                            <td>
                                                              <label>
                                                                <input
                                                                  checked={q.performanceOption === "personalResponse"}
                                                                  onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                                  type="radio"
                                                                  name={`poll${i}P${pageI}Q${qI}`}
                                                                  value="personalResponse"
                                                                />
                                                                Show Only User's Own Answer
                                                              </label>
                                                            </td>
                                                            <td>
                                                              <label>
                                                                <input
                                                                  checked={q.performanceOption === "commonResponse"}
                                                                  onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                                  type="radio"
                                                                  name={`poll${i}P${pageI}Q${qI}`}
                                                                  value="commonResponse"
                                                                />
                                                                Show Most Common Answer
                                                              </label>
                                                            </td>
                                                          </tr>
                                                          <tr>
                                                            <td>
                                                              <label>
                                                                <input
                                                                  checked={q.performanceOption === "allResponses"}
                                                                  onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                                  type="radio"
                                                                  name={`poll${i}P${pageI}Q${qI}`}
                                                                  value="allResponses"
                                                                />
                                                                Show All User Answers
                                                              </label>
                                                            </td>
                                                            <td>
                                                              <label>
                                                                <input
                                                                  checked={q.performanceOption === "noShow"}
                                                                  onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                                  type="radio"
                                                                  name={`poll${i}P${pageI}Q${qI}`}
                                                                  value="noShow"
                                                                />
                                                                Do Not Show This Question
                                                              </label>
                                                            </td>
                                                          </tr>
                                                        </>
                                                      )}
                                                      {!(poll.infolevel || poll.overlay) && (
                                                        <>
                                                          <tr>
                                                            <td>
                                                              <label>
                                                                <input
                                                                  checked={q.performanceOption === "groupResponse"}
                                                                  onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                                  type="radio"
                                                                  name={`poll${i}P${pageI}Q${qI}`}
                                                                  value="groupResponse"
                                                                />
                                                                Show Group Answer
                                                              </label>
                                                            </td>
                                                            <td>
                                                              <label>
                                                                <input
                                                                  checked={q.performanceOption === "noShow"}
                                                                  onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                                  type="radio"
                                                                  name={`poll${i}P${pageI}Q${qI}`}
                                                                  value="noShow"
                                                                />
                                                                Do Not Show This Question
                                                              </label>
                                                            </td>
                                                          </tr>
                                                        </>
                                                      )}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </React.Fragment>
                                      ))}
                                    </>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        default:
                          break;
                      }
                    })}
                  </tbody>
                </table>
                {!Object.keys(props.customObjs).some(key => props.customObjs[key].length) && (
                  <div className="performanceNoObjects">
                    <div><b>There are currently no interactive objects.</b></div>
                    <p>
                      If you add interactive objects to the group area or personal area, settings for their
                      performance report will show up here.
                    </p>
                    <p>
                      The performance report is used to show players feedback about
                      what they have done during the simulation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {!props.setData && (
            <div className={`performancePollResult ${props.adminMode ? "noGradientBefore" : ""}`}>
              <h2 style={{ display: props.adminMode ? "none" : "block" }}>Performance Report</h2>
              <div>
                {props.status && props.customObjs && (
                  <>
                    {props.customObjs.polls.map((poll, pollI) => {
                      if (props.status[poll.id] && poll.performanceEnabled) {
                        let pollData = "";
                        if (props.adminMode) {
                          pollData = props.status[poll.id];
                        } else {
                          pollData = (poll.infolevel || poll.overlay) ?
                            (props.status[poll.id][props.userId] ? props.status[poll.id][props.userId].data : null) :
                            props.status[poll.id].data;
                        }
                        if (pollData) {
                          let questions = [];
                          for (let i = 0; i < poll.json.pages.length; i++) {
                            questions.push(poll.json.pages[i].questions);
                          }
                          questions = questions.flat();
                          return (
                            <React.Fragment key={pollI}>
                              <div className="h2">{`Poll: ${poll.customName ? poll.customName : "Untitled"}`}</div>
                              {questions.map((question, questionI) => {
                                let answer = "";
                                if (props.adminMode) {
                                  answer = pollAllDataAnswer(props.status[poll.id], question);
                                } else if (pollData[question.name] || pollData[question.name] === false) {
                                  if (question.performanceOption === "noShow") {
                                    answer = "";
                                  } else if (
                                    question.performanceOption === "groupResponse" ||
                                    question.performanceOption === "personalResponse"
                                  ) {
                                    answer = pollAnswerHTML(pollData[question.name], question);
                                  } else {
                                    answer = pollAllDataAnswer(props.status[poll.id], question);
                                  }
                                } else {
                                  answer = "No Response Yet";
                                }
                                return (
                                  <React.Fragment key={questionI}>
                                    {question.performanceOption !== "noShow" && (
                                      <>
                                        <div className="newQ"><span>Q: </span>{question.title}</div>
                                        <div><span>A: </span>
                                          {answer === "No Response Yet" && (
                                            <i>
                                              {answer}
                                            </i>
                                          )}
                                          {answer !== "No Response Yet" && (
                                            <>
                                              {answer}
                                            </>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </React.Fragment>
                          )
                        }
                      }
                    })}
                  </>
                )}

                {!props.status && (
                  <>
                    {props.adminMode && (
                      <>
                        <p><b>
                          There is currently no data to display.
                        </b></p>
                        <p>
                          Data will appear here once students have started to interact with the simulation.
                        </p>
                      </>
                    )}
                    {!props.adminMode && (
                      <>
                        <p><b>
                          There is currently no data to display.
                        </b></p>
                        <p>
                          Interact with parts of the simulation to see your progress here.
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
});

export default Performance;
