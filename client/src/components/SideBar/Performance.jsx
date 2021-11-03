import React, { useState, forwardRef } from "react";

import "./Performance.css";

const Performance = forwardRef((props, ref) => {

  const [customObjs, setCustomObjs] = useState(props.customObjs);

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
                            <h4>
                              {poll.customName}
                            </h4>
                            {poll.json.pages.map((page, pageI) => (
                              <React.Fragment key={pageI}>
                                <h3>
                                  Page #{pageI + 1}
                                </h3>
                                {page.questions.map((q, qI) => (
                                  <div>
                                    <div className="performanceQNames">
                                      {q.title}
                                    </div>
                                    <div className="performanceQOptions">
                                      Test
                                    </div>
                                  </div>
                                ))}
                              </React.Fragment>
                            ))}
                          </tr>
                        );
                      });
                    default:
                      break;
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
});
export default Performance;
