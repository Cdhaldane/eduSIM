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

  const COLORS = ["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b", "#7dce82", "#3cdbd3"];

  const data = [
    { name: 'Answer 1', value: 5 },
    { name: 'Answer 2', value: 3 },
    { name: 'Answer 3', value: 2 },
    { name: 'Answer 4', value: 1 },
    { name: 'Answer 5', value: 1 },
    { name: 'Answer 6', value: 4 },
  ];

  //console.log(props.status);
  //console.log(props.customObjs);

  return (
    <div className="area">
      <form className="form-input performanceForm" ref={ref}>
        <div className="performanceContainer">
          <h2 className="performanceTitle">Performance Report Settings</h2>
          {props.setData && (
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
                                  height={30}
                                  width={50}
                                  onChange={(val) => {
                                    props.setData.setPollData("performanceEnabled", val, poll.id);
                                  }}
                                  checked={poll.performanceEnabled}
                                  className="react-switch"
                                />
                                <span>
                                  {`Poll ${i + 1} - ${poll.customName ? poll.customName : "Untitled"}`}
                                </span>
                                {poll.performanceEnabled && (
                                  <>
                                    {poll.json.pages.map((page, pageI) => (
                                      <React.Fragment key={pageI}>
                                        <h3>
                                          Page #{pageI + 1}
                                        </h3>
                                        {page.questions.map((q, qI) => {
                                          return (
                                            <div key={qI}>
                                              <div className="performanceQNames">
                                                {q.title}
                                              </div>
                                              <div className="performanceQOptions">
                                                <table>
                                                  <tbody>
                                                    {poll.infolevel && (
                                                      <>
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
                                                    {!poll.infolevel && (
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
                  <div>There are currently no interactive objects.</div>
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
          )}
        </div>
        {!props.setData && (
          <div className="performancePollResult">
            {props.status && (
              <>
                {props.customObjs.polls.map((poll, pollI) => {
                  if (props.status[poll.id] && props.status[poll.id].data && poll.performanceEnabled) {
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
                          if (props.status[poll.id].data[question.name]) {
                            answer = props.status[poll.id].data[question.name];
                          } else {
                            answer = "No Response Yet";
                          }
                          return (
                            <React.Fragment key={questionI}>
                              <div className="newQ"><span>Question: </span>{question.title}</div>
                              <div><span>Answer: </span>
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
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    )
                  }
                })}
              </>
            )}

            {!props.status && (
              <>
                <p><b>
                  There is currently no data to display.
                </b></p>
                <p>
                  Interact with parts of the simulation to see your progress here.
                </p>
              </>
            )}

            <div className="performancePieChartContainer">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart width={400} height={400}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={false}
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8f001a"
                    label={(entry) => entry.name}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </form>
    </div>
  );
});

export default Performance;
