import React, { useState, forwardRef } from "react";

import "./Performance.css";

const Performance = forwardRef((props, ref) => {

  const [customObjs, setCustomObjs] = useState(props.customObjs);

  console.log(customObjs);

  console.log(Object.keys(customObjs).some(key => customObjs[key].length));

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
                              <span>
                                {`Poll ${i + 1} - ${poll.customName ? poll.customName : "Untitled"}`}
                              </span>
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
                                        Test
                                      </div>
                                    </div>
                                  ))}
                                </React.Fragment>
                              ))}
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
