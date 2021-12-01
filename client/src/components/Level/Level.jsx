import React, { useEffect, useState, useRef } from "react";
import { times } from "lodash";
import { Link } from "react-router-dom";
import Pencil from "../Pencils/Pencil";
import Modal from "react-modal";
import AutoUpdate from "../AutoUpdate";
import moment from "moment";

import "./Level.css";

const Level = (props) => {

  const [count, setCount] = useState(1);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const infoPopup = new useRef();
  const infoBtn = new useRef();

  let items = [];

  const handleClickOutside = e => {
    if (infoPopup.current && infoBtn.current && !(
      infoPopup.current.contains(e.target) ||
      infoBtn.current.contains(e.target))) {
      setShowInfoPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLevel = (e) => {
    if (props.gamepage) {
      if (e > count && props.disableNext) return;
      if (e > count + 1) return;
      if (!props.freeAdvance) return;
      props.level(e);
    } else {
      props.level(e);
      setCount(e);
    }
  }

  useEffect(() => {
    if (props.levelVal) {
      setCount(props.levelVal);
    }
  }, [props.levelVal]);

  const createSelectItems = () => {
    // Replace empty names with Untitled#
    let pages = [...props.pages];
    let untitledNum = 1;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].name === "") {
        pages[i].name = "Untitled " + untitledNum;
        untitledNum++;
      }
    }
    for (let i = 0; i < props.numOfPages; i++) {
      if (pages[i]) {
        items.push(
          <option key={i} value={i + 1}>
            {pages[i].name}
          </option>
        );
      }
    }
    return items;
  }

  const handleChange = (event) => {
    setCount(parseInt(event.target.value));
    handleLevel(parseInt(event.target.value));
  }

  const saveOnClose = () => {
    props.clearCanvasData();
    props.saveGame();
    props.removeJSGIFS();
  }

  return (
    <div id="levelContainer">
      <div className={`level ${props.gamepage ? 'level-gamepage' : ''}`}>
        {!props.gamepage && (
          <>
            <div style={{width: "180px"}}>
              <h1 id="editModeTitle">
                Edit Mode
              </h1>
              <button id="levelInfoButton" onClick={() => setShowInfoPopup(true)} ref={infoBtn}>
                <i className="fa fa-info" />
              </button>
            </div>

            <Modal
              isOpen={showInfoPopup}
              onRequestClose={() => setShowInfoPopup(false)}
              className="createmodalarea"
              overlayClassName="myoverlay"
              closeTimeoutMS={250}
              ariaHideApp={false}
            >
              <div className="area">
                <form className="form-input" ref={infoPopup} style={{ padding: "20px" }}>
                  <div className="levelInstructionsDiv">
                    <h2>Instructions</h2>
                    <table>
                      <tbody className="levelInstructionsTable">
                        <tr>
                          <td style={{
                            width: "50%",
                            paddingRight: "30px"
                          }}>
                            <h3>Overview</h3>
                            <p style={{
                              textAlign: "left",
                              paddingTop: "7px"
                            }}>
                              Edit Mode allows you to create and edit simulations.
                              Simulations have two main components: the group area (with the grid background), and the personal area (located at the bottom of the screen).
                              To toggle opening/closing the personal area use the red arrow button at the top right of the personal area.
                              The group area will be shared by all the users in a simulation while the personal area contents are determined by the user's role and are only visible to the user.
                              To create/edit roles use the role picker located in the top left of the personal area.
                            </p>
                          </td>
                          <td style={{ width: "50%" }}>
                            <h3>Shortcuts</h3>
                            <ul>
                              <li>
                                Right click on canvas
                                <i className="fa fa-angle-right" />
                                Add Menu
                              </li>
                              <li>
                                Right click on object
                                <i className="fa fa-angle-right" />
                                Object Menu
                              </li>
                              <li>
                                Ctrl + Drag
                                <i className="fa fa-angle-right" />
                                Move around canvas
                              </li>
                              <li>
                                Shift + R
                                <i className="fa fa-angle-right" />
                                Recenter Contents
                              </li>
                              <li>
                                Delete
                                <i className="fa fa-angle-right" />
                                Delete selected object
                              </li>
                              <li>
                                Ctrl + X
                                <i className="fa fa-angle-right" />
                                Cut selected object
                              </li>
                              <li>
                                Ctrl + C
                                <i className="fa fa-angle-right" />
                                Copy selected object
                              </li>
                              <li>
                                Ctrl + V
                                <i className="fa fa-angle-right" />
                                Paste selected object
                              </li>
                              <li>
                                Ctrl + Z
                                <i className="fa fa-angle-right" />
                                Undo action
                              </li>
                              <li>
                                Ctrl + Shift + Z
                                <i className="fa fa-angle-right" />
                                Redo action
                              </li>
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </form>
              </div>
            </Modal>
          </>
        )}
        <div className="level-nav">
          {!props.gamepage && (
            <select className="level-select" onChange={handleChange} value={count}>
              {createSelectItems()}
            </select>
          )}

          <div className={`level-bar ${!props.gamepage ? 'level-bar-edit' : ''}`} style={{minWidth: (props.number)*66+'px'}}>
            <div className="level-bar-underlay"></div>
            <div className="level-bar-progress-edge"></div>
            <div className={`level-bar-progress ${props.number == count-(props.gamepage ? 1 : 0) ? 'level-bar-full' : ''}`} style={{
              width: `calc(${(100*(count-1)/(props.number-(props.gamepage ? 0 : 1)))}% - ${(24*(count-1)/(props.number-(props.gamepage ? 0 : 1)))}px)`
            }}></div>
		        <i className={`fas fa-caret-right ${props.number == count-(props.gamepage ? 1 : 0) ? 'level-bar-full' : ''}`}></i>
		        <div className="level-bar-segments">
              {times(props.number+(props.gamepage ? 1 : 0), (num) => ( // dynamically scaling level bar
                <div key={num} className="level-bar-segment">
                  <div className={`
                    level-bar-dot 
                    ${count-1 >= num ? 'level-bar-dot-fill' : ''}
                    ${(count-1 > num && props.freeAdvance) || (count-1 != num && !props.gamepage) ? 'level-bar-dot-clickable' : ''}
                    ${count == num && props.freeAdvance && !props.disableNext ? 'level-bar-dot-clickable level-bar-dot-glow' : ''}
                  `} onClick={() => handleLevel(num+1)}>
                    {props.number > num ? (
                      <i class={`fas fa-arrow-alt-circle-right ${count-1 > num ? 'arrow-left' : ''}`}></i>
                    ) : <i class="fas fa-check-circle"></i>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {props.countdown && (
            <div className="level-bar-time">
              <AutoUpdate
                value={() => moment.duration(props.countdown()).hours()+":"+moment(props.countdown()).format("mm:ss")}
                intervalTime={20}
                enabled
              />
            </div>
          )}

          {props.handlePageNum && (
            <Pencil
              id="Timeline"
              psize="3"
              type="info"
              pages={props.pages}
              handleCopyPage={props.handleCopyPage}
              handlePageTitle={props.handlePageTitle}
              handlePageNum={props.handlePageNum}
              numOfPages={props.numOfPages}
            />
          )}
        </div>

        {!props.gamepage && (
          <Link onClick={saveOnClose} to="/dashboard" className="level-close">
            <i className="fas fa-times fa-3x"></i>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Level;
