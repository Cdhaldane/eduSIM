import React, { useEffect, useState, useRef } from "react";
import { times } from "lodash";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Pencil from "../Pencils/Pencil";
import Modal from "react-modal";
import AutoUpdate from "../AutoUpdate";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useAlertContext } from "../Alerts/AlertContext";

import "./Level.css";
import "../Stage/Info.css";
import { set } from "immutable";

const Level = (props) => {
  const { t } = useTranslation();
  const { roomid } = useParams();
  const [count, setCount] = useState(1);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [mode, setMode] = useState(false);
  const infoPopup = new useRef();
  const infoBtn = new useRef();
  const alertContext = useAlertContext();
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

  function compare(a, b) {
    // Move objects with obj.true to the front of the array
    if (a.optional && !b.optional) {
      return 1;
    } else if (a.optional && b.optional) {
      return -1;
    } else {
      return 0;
    }
  }
  
  // Sort the array
 
  useEffect(() => {
    if (props.levelVal > props.number) {
      props.end()
    } else {
      setCount(props.levelVal)
    }
  }, [props.levelVal])

  const handleLevel = (e) => {
    let closeOverlay = null;
    if (props?.page?.overlays) {
      for (let i = 0; i < props.page.overlays.length; i++) {
        if (props.page.overlays[i].overlayOpenOption === "pageExit") {
          closeOverlay = props.page.overlays[i];
          break;
        }
      }
    }
    if (e > count &&
      props.page &&
      closeOverlay) {
      props.handlePageOpenOverlay(closeOverlay.id);
      return;
    }
    if (props.gamepage) {
      if (props.disableNext) {
        alertContext.showAlert("Must complete a task to advance!", "info");
        return
      };
      if (e > count + 1) {
        return;
      }
      if (!props.freeAdvance) {
        return;
      }
      if (e > props.number) {
        props.end()
        return
      }
      props.socket.emit("goToPage", {
        level: e
      });
    } else {
      props.handleLevel(e)
      setCount(e)
    }
  }

  useEffect(() => {
    if (props.gamepage) {
      props.socket.on("userLevelUpdate", (data) => {
        setCount(data.level)
      })
    }
  }, [])

  useEffect(() => {
    let varName = "Page"
    let vars = {};
    if (!!sessionStorage.gameVars) vars = JSON.parse(sessionStorage.gameVars);
    sessionStorage.setItem('gameVars', JSON.stringify({
      ...vars,
      [varName]: count
    }));
    sessionStorage.setItem('lastSetVar', varName);
  }, [count]);

  const saveOnClose = () => {
    document.querySelector(':root').style.setProperty('--primary', "#8f001a");
    props.clearCanvasData();
    props.saveGame();
    props.removeJSGIFS();
  }

  const setPlayMode = () => {
    setMode(!mode)
    props.loadObjects("group", "play", false)
  }



  return (
    <div id="levelContainer">
      <div className={`level ${props.gamepage ? 'level-gamepage' : ''}`}>

        {!props.gamepage && (
          <>
            <div className="editModeTitleContainer" onClick={() => setPlayMode()} ref={infoBtn}>
              <h1 id="editModeTitle">
                {t("edit.editMode")}
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
                    <h2>{t("edit.instructions")}</h2>
                    <table>
                      <tbody className="levelInstructionsTable">
                        <tr>
                          <td style={{
                            width: "50%",
                            paddingRight: "30px"
                          }}>
                            <h3>{t("edit.overview")}</h3>
                            <p style={{
                              textAlign: "left",
                              paddingTop: "7px"
                            }}>
                              {t("edit.overviewExplanation")}
                            </p>
                          </td>
                          <td style={{ width: "50%" }}>
                            <h3>{t("edit.shortcuts")}</h3>
                            <ul>
                              {[
                                "addMenu",
                                "objectMenu",
                                "moveAroundCanvas",
                                "recenterContents",
                                "deleteObject",
                                "cutObject",
                                "copyObject",
                                "pasteObject",
                                "undo", "redo"
                              ].map((key, i) => (
                                <li key={i}>
                                  {t(`edit.shortcut.${key}SC`)}
                                  <i className="fa fa-angle-right" />
                                  {t(`edit.shortcut.${key}`)}
                                </li>
                              ))}
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
          <div className={`level-bar ${!props.gamepage ? 'level-bar-edit' : ''}`} style={{ minWidth: (props.number) * 45 + 'px' }}>
            <div className="level-bar-underlay"></div>
            <div className="level-bar-progress-edge"></div>
            <div className={`level-bar-progress ${props.number == count - (props.gamepage ? 1 : 0) ? 'level-bar-full' : ''}`} style={{
              width: `calc(${(100 * (count - 1) / (props.number - (props.gamepage ? 0 : 1)))}% - ${(24 * (count - 1) / (props.number - (props.gamepage ? 0 : 1)))}px)`
            }}></div>
            <i className={`fas fa-caret-right ${props.number == count - (props.gamepage ? 1 : 0) ? 'level-bar-full' : ''}`}></i>
            <div className="level-bar-segments">
              {times(props.number + (props.gamepage ? 1 : 0), (num) => ( // dynamically scaling level bar
                <div key={num} className="level-bar-segment">
                  <div className={`
                    level-bar-dot
                    ${count - 1 >= num ? 'level-bar-dot-fill' : ''}
                    ${(count - 1 > num && props.freeAdvance) || (count - 1 != num && !props.gamepage) ? 'level-bar-dot-clickable' : ''}
                    ${count == num && props.freeAdvance && !props.disableNext ? 'level-bar-dot-clickable level-bar-dot-glow' : ''}
                  `} onClick={() => {
                      if (props.freeAdvance || !props.gamepage) {
                        handleLevel(num + 1)
                      }
                    }
                    }>
                    {props.number > num ? (
                      <i className={`fas fa-arrow-alt-circle-right ${count - 1 > num ? 'arrow-left' : ''}`}></i>
                    ) : <i className="lni lni-checkmark-circle"></i>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {props.countdown && (
            <div className="level-bar-time">
              <AutoUpdate
                value={() => moment.duration(props.countdown()).hours() + ":" + moment(props.countdown()).format("mm:ss")}
                intervalTime={20}
                enabled
              />
            </div>
          )}


        </div>
        {props.handlePageNum && (
          <div className="pencil-container">
            <Pencil
              positionRect={props.positionRect}
              id="Timeline"
              psize="3"
              type="info"
              getobjState={props.getObjState}
              updateObjState={props.updateObjState}
              pages={props.pages}
              refreshCanvas={props.refreshCanvas}
              getObjState={props.getObjState}
              changeObjectPage={props.changeObjectPage}
              handleCopyPage={props.handleCopyPage}
              handlePageTitle={props.handlePageTitle}
              handlePageNum={props.handlePageNum}
              numOfPages={props.numOfPages}
            />
          </div>
        )}
        {!props.gamepage && (
          <Link onClick={saveOnClose} to="/dashboard" className="level-close">
            <i className="lni lni-exit"></i>
            <h1>{t("edit.exit")}</h1>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Level;
