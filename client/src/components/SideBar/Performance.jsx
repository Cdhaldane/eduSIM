import React, { useState, forwardRef } from "react";
import Switch from "react-switch";

import "./Performance.css";

const Performance = forwardRef((props, ref) => {

  const [customObjs, setCustomObjs] = useState(props.customObjs);
  const [pollChecks, setPollChecks] = useState(props.customObjs.polls ? Array(props.customObjs.polls.length).fill(false) : []);

  const savePerformanceInfo = () => {
    const json = {
      polls: null
    }

    // Save poll info
    for (let i = 0; i < customObjs.polls.length; i++) {
      const poll = customObjs.polls[i].json;
    }
  }

  return (
    <div className="area">
      <form className="form-input performanceForm" ref={ref}>
        <div className="performanceContainer">
          <h2 className="performanceTitle">Performance Report Settings</h2>
          <div className="performanceTableContainer">
            <table className="performanceTable">
              <tbody>
                {Object.keys(customObjs).map((key) => {
                  switch (key) {
                    case "polls":
                      return customObjs[key].map((poll, i) => {
                        return (
                          <tr key={i} className="performancePollRow">
                            <td>
                              <Switch
                                height={30}
                                width={50}
                                onChange={(val) => {
                                  const newChecks = [...pollChecks];
                                  newChecks[i] = val;
                                  setPollChecks(newChecks);
                                }}
                                checked={pollChecks[i]}
                                className="react-switch"
                              />
                              <span>
                                {`Poll ${i + 1} - ${poll.customName ? poll.customName : "Untitled"}`}
                              </span>
                              {pollChecks[i] && (
                                <>
                                  {poll.json.pages.map((page, pageI) => (
                                    <React.Fragment key={pageI}>
                                      <h3>
                                        Page #{pageI + 1}
                                      </h3>
                                      {page.questions.map((q, qI) => (
                                        <div key={qI}>
                                          <div className="performanceQNames">
                                            {q.title}
                                          </div>
                                          <div className="performanceQOptions">
                                            <div>
                                              <input defaultChecked type="radio" name={`poll${i}Q${qI}`} value="allAnswers" />
                                              <label>List All User Answers</label>
                                            </div>
                                            <div>
                                              <input type="radio" name={`poll${i}Q${qI}`} value="mostCommon" />
                                              <label>Show Most Common Answer</label>
                                            </div>
                                            <div>
                                              <input type="radio" name={`poll${i}Q${qI}`} value="usersOwn" />
                                              <label>Show Only User's Own Answer</label>
                                            </div>
                                            <div>
                                              <input type="radio" name={`poll${i}Q${qI}`} value="doNotShow" />
                                              <label>Do Not Show This Question</label>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
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
            {!Object.keys(customObjs).some(key => customObjs[key].length) && (
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
