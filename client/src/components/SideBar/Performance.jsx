import React, { useState, forwardRef } from "react";
import Switch from "react-switch";

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

  return (
    <div className="area">
      <form className="form-input performanceForm" ref={ref}>
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
                                                  <tr>
                                                    <td>
                                                      <label>
                                                        <input
                                                          checked={q.performanceOption === "allAnswers"}
                                                          onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                          type="radio"
                                                          name={`poll${i}P${pageI}Q${qI}`}
                                                          value="allAnswers"
                                                        />
                                                        List All User Answers
                                                      </label>
                                                    </td>
                                                    <td>
                                                      <label>
                                                        <input
                                                          checked={q.performanceOption === "mostCommon"}
                                                          onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                          type="radio"
                                                          name={`poll${i}P${pageI}Q${qI}`}
                                                          value="mostCommon"
                                                        />
                                                        Show Most Common Answer
                                                      </label>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td>
                                                      <label>
                                                        <input
                                                          checked={q.performanceOption === "usersOwn"}
                                                          onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                          type="radio"
                                                          name={`poll${i}P${pageI}Q${qI}`}
                                                          value="usersOwn"
                                                        />
                                                        Show Only User's Own Answer
                                                      </label>
                                                    </td>
                                                    <td>
                                                      <label>
                                                        <input
                                                          checked={q.performanceOption === "doNotShow"}
                                                          onChange={(e) => pollQOptionChanged(e, i, pageI, qI)}
                                                          type="radio"
                                                          name={`poll${i}P${pageI}Q${qI}`}
                                                          value="doNotShow"
                                                        />
                                                        Do Not Show This Question
                                                      </label>
                                                    </td>
                                                  </tr>
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
        </div>
      </form>
    </div>
  );
});

export default Performance;
