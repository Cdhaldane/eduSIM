import React, { useState, useEffect, useRef } from 'react';
import ConfirmationModal from "../Modal/ConfirmationModal";
import { ChromePicker } from 'react-color';
import { CSSTransition } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";

import "./Dropdown.css";

const DropdownTimelineBar = (props) => {

  const UNTITLED_PAGE = "Untitled Page";
  const MAX_PAGE_NUM = 10;

  const [pages, setPages] = useState(props.pages);
  const [numOfPages, setNumOfPages] = useState(props.numOfPages);
  const [pageColorSettings, setPageColorSettings] = useState("foreground");
  const dropdown = useRef();
  const { t } = useTranslation();

  const [modifyIndex, setModifyIndex] = useState(-1);
  const [modifyPageName, setModifyPageName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [deletionIndex, setDeletionIndex] = useState(-1);
  const [currentSettingsIndex, setCurrentSettingsIndex] = useState(null);
  const [menuHeight, setMenuHeight] = useState(0);

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }

  const handleClickOutside = e => {
    if (dropdown.current &&
      e.target.id !== "confirmModalConfirmButton" &&
      !dropdown.current.contains(e.target) &&
      !confirmationVisibleRef.current) {
      props.close();
    }
  }

  useEffect(() => {
    setMenuHeight(document.getElementById("existingPagesSection").clientHeight);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    props.handlePageNum(numOfPages);
  }, [numOfPages]);

  useEffect(() => {
    props.handlePageTitle(pages);
    updatePageListHeight();
  }, [pages]);

  const pageNameChanged = (name, index) => {
    const newArr = pages.slice();
    newArr[index].name = name;
    setPages(newArr);
    setModifyIndex(-1);
  }

  const handleModifyPage = (index) => {
    setTimeout(() => {
      setModifyIndex(index);
      setModifyPageName(pages[index].name);
    }, 0);
  }

  const calcHeight = (el) => {
    let height = el.offsetHeight;
    if (el.className === "page-settings-css-anim-enter") {
      height = 450;
    }
    setMenuHeight(height);
  }

  const updatePageListHeight = () => {
    setTimeout(() => {
      if (document.getElementById("existingPagesSection")) {
        setMenuHeight(document.getElementById("existingPagesSection").clientHeight);
      }
    }, 0);
  }

  const editBtns = (page, index) => (
    <div className="icons-right">
      {/* EDIT PAGE TITLE */}
      <span className="icon-button" onClick={() => handleModifyPage(index)}>
        <i className="icons fa fa-pencil" />
      </span>

      {/* PAGE SETTINGS */}
      <span className="icon-button" onClick={() => setTimeout(() => setCurrentSettingsIndex(index), 0)}>
        <i className="icons fa fa-cog" />
      </span>

      {/* COPY PAGE */}
      <span
        className={`icon-button ${pages.length >= MAX_PAGE_NUM ? "disabled" : ""}`}
        onClick={async () => {
          if (pages.length < MAX_PAGE_NUM) {
            // Copy the page and contents
            setPages([...pages, {
              ...pages[index],
              name: pages[index].name + " Copy",
            }]);
            setNumOfPages(numOfPages + 1);
            props.handleCopyPage(index);
          }
        }}
      >
        <i className={`icons fa fa-copy`} />
      </span>

      {/* MOVE PAGE UP */}
      <span
        className={`icon-button ${index === 0 ? "disabled" : ""}`}
        style={{
          float: "left",
          width: "25px",
          height: "30px",
          display: "block",
          marginLeft: "0px"
        }}
        onClick={() => {
          if (index !== 0) {
            const newPages = [...pages];
            const prevPage = pages[index - 1];
            const thisPage = pages[index];
            newPages[index - 1] = thisPage;
            newPages[index] = prevPage;
            setTimeout(() => {
              setPages(newPages);
              setModifyPageName(page.name);

              props.changeObjectPage(index - 1, MAX_PAGE_NUM + 1);
              props.changeObjectPage(index, index - 1);
              props.changeObjectPage(MAX_PAGE_NUM + 1, index);

              props.refreshCanvas();
            }, 0);
          }
        }}>
        <i className={`fas fa-angle-up`} />
      </span>

      {/* MOVE PAGE DOWN */}
      <span
        className={`icon-button ${index === pages.length - 1 ? "disabled" : ""}`}
        style={{
          float: "right",
          width: "25px",
          height: "30px",
          display: "block",
          marginLeft: "5px"
        }}
        onClick={() => {
          if (index !== pages.length - 1) {
            const newPages = [...pages];
            const nextPage = pages[index + 1];
            const thisPage = pages[index];
            newPages[index + 1] = thisPage;
            newPages[index] = nextPage;
            setTimeout(() => {
              setPages(newPages);
              setModifyPageName(page.name);

              props.changeObjectPage(index + 1, MAX_PAGE_NUM + 1);
              props.changeObjectPage(index, index + 1);
              props.changeObjectPage(MAX_PAGE_NUM + 1, index);

              props.refreshCanvas();
            }, 0);
          }
        }}>
        <i className={`fas fa-angle-down`} />
      </span>
    </div>
  );

  const getColor = () => {
    if (pages[currentSettingsIndex]) {
      if (pageColorSettings === "foreground") {
        return pages[currentSettingsIndex].primaryColor || "#FFF";
      } else if (pageColorSettings === "group") {
        return pages[currentSettingsIndex].groupColor || "#FFF";
      } else if (pageColorSettings === "personal") {
        return pages[currentSettingsIndex].personalColor || "#FFF";
      } else if (pageColorSettings === "overlay") {
        return pages[currentSettingsIndex].overlayColor || "#FFF";
      }
    } else {
      return "#FFF";
    }
  }

  return (
    <div
      className="dropdown menu-primary timelineDropdown"
      style={{
        height: "auto",
        width: currentSettingsIndex === null ? "500px" : "350px"
      }}
      ref={dropdown}
    >
      <div
        className="menu"
        style={{
          height: menuHeight + "px",
          transition: "var(--speed) ease"
        }}
      >
        {/* PAGE LIST */}
        <CSSTransition
          id={"existingPagesSection"}
          in={currentSettingsIndex === null}
          timeout={500}
          classNames="pages-css-anim"
          onEnter={calcHeight}
          unmountOnExit>
          <div style={{ width: "500px" }}>
            <h1>{t("edit.editPages")}</h1>
            <div>
              {props.pages.map((page, index) => {
                return (
                  <React.Fragment key={index}>
                    {modifyIndex === index ? (
                      <div
                        className="menu-item"
                        key={index}
                      >
                        <span className="icon-button" onClick={() => pageNameChanged(modifyPageName, index)}>
                          <i className="icons fas fa-check" />
                        </span>
                        <input
                          id="roleNameAdd"
                          className="add-dropdown-item-input"
                          type="text"
                          placeholder={t("edit.pageNamePlaceholder")}
                          onChange={(e) => setModifyPageName(e.target.value)}
                          value={modifyPageName}
                        />
                        {editBtns(page, index)}
                      </div>
                    ) : (
                      <div
                        className="menu-item"
                        onClick={(e) => null}
                        key={index}
                        disabled={false}
                      >
                        <span className="icon-button" onClick={() => {
                          setDeletionIndex(index);
                          setConfirmationVisible(true);
                        }} >
                          <i className="icons fa fa-trash" />
                        </span>

                        {`${page.name}`}
                        {editBtns(page, index)}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* ADD A NEW PAGE */}
            <div className="menu-item" disabled={pages.length >= MAX_PAGE_NUM}>
              <span className="icon-button" onClick={() => {
                setPages([...pages, {
                  name: newPageName ? newPageName : UNTITLED_PAGE,
                  overlays: [],
                  overlayOpenOption: "pageEnter",
                  primaryColor: "#8f001a",
                  groupColor: "#FFF",
                  personalColor: "#FFF",
                  overlayColor: "#FFF"
                }]);
                setNewPageName("");
                setNumOfPages(numOfPages + 1);
              }}>
                <i className="icons fas fa-plus" />
              </span>
              <input
                className="add-dropdown-item-input"
                type="text"
                placeholder={t("edit.newPagePlaceholder")}
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
              />
            </div>
          </div>
        </CSSTransition>

        {/* Page Settings */}
        <CSSTransition
          in={currentSettingsIndex !== null}
          timeout={500}
          classNames="page-settings-css-anim"
          onEnter={calcHeight}
          unmountOnExit>
          <div>
            <>
              <div className="menu-item">
                <span className="icon-button" onClick={() => setTimeout(() => setCurrentSettingsIndex(null), 0)}>
                  <i className="icons fa fa-arrow-left" />
                </span>
                <h1
                  style={{
                    padding: "0px",
                    width: "250px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}>
                  {t("edit.editPageX", { name: pages[currentSettingsIndex] ? pages[currentSettingsIndex].name : t("edit.pageNamePlaceholder") })}
                </h1>
              </div>
              <div id={"pageSettingsDropdown"}>
                <div>
                  <div className="pageSettingsLabels">{t("edit.addOverlay")}</div>
                  <div
                    style={{ display: "inline-block" }}
                    onClick={() => {
                      const newArr = pages.slice();
                      newArr[currentSettingsIndex].overlays = [...newArr[currentSettingsIndex].overlays, {
                        id: uuidv4(),
                        overlayOpenOption: "doNotAutoOpen",
                        hideBtn: false,
                        layers: []
                      }];
                      setPages(newArr);
                    }}
                  >
                    <span className="icon-button">
                      <i className="icons fa fa-plus" />
                    </span>
                  </div>
                </div>
                <div>
                  <div className={"pageSettingsColorButtons"}>
                    <div className="pageSettingsLabels">{t("edit.pageColors")}</div>
                    <div>
                      <button
                        className={`${pageColorSettings === "foreground" ? "editInputOptionSelected" : ""}`}
                        onClick={() => setPageColorSettings("foreground")}
                      >
                        {t("edit.foreground")}
                      </button>
                    </div>
                    <button
                      className={`${pageColorSettings === "group" ? "editInputOptionSelected" : ""}`}
                      onClick={() => setPageColorSettings("group")}
                    >
                      {t("edit.group")}
                    </button>
                    <button
                      className={`${pageColorSettings === "personal" ? "editInputOptionSelected" : ""}`}
                      onClick={() => setPageColorSettings("personal")}
                    >
                      {t("edit.personal")}
                    </button>
                    <button
                      className={`${pageColorSettings === "overlay" ? "editInputOptionSelected" : ""}`}
                      onClick={() => setPageColorSettings("overlay")}
                    >
                      {t("edit.overlay")}
                    </button>
                  </div>
                  <ChromePicker
                    color={getColor()}
                    disableAlpha={true}
                    onChange={(color) => {
                      const newArr = pages.slice();
                      if (pageColorSettings === "foreground") {
                        newArr[currentSettingsIndex].primaryColor = color.hex;
                      } else if (pageColorSettings === "group") {
                        newArr[currentSettingsIndex].groupColor = color.hex;
                      } else if (pageColorSettings === "personal") {
                        newArr[currentSettingsIndex].personalColor = color.hex;
                      } else if (pageColorSettings === "overlay") {
                        newArr[currentSettingsIndex].overlayColor = color.hex;
                      }
                      setPages(newArr);
                    }}
                  />
                </div>
              </div>
            </>
          </div>
        </CSSTransition>
      </div>

      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={() => {
          const newPages = [...pages];
          newPages.splice(deletionIndex, 1);
          setPages(newPages);
          setNumOfPages(numOfPages - 1);
          props.changeObjectPage(deletionIndex, -1);
          for (let i = deletionIndex + 1; i < pages.length; i++) {
            props.changeObjectPage(i, i - 1);
          }
          props.refreshCanvas();
        }}
        confirmMessage={t("edit.deletePage")}
        message={t("edit.confirmDeletePage", { name: pages[deletionIndex] ? pages[deletionIndex].name : "" })}
      />
    </div>
  );
}

export default DropdownTimelineBar;
