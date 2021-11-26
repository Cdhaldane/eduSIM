import React, { useState, useEffect, useRef } from 'react';
import ConfirmationModal from "../Modal/ConfirmationModal";

import "./Dropdown.css";

const DropdownTimelineBar = (props) => {

  const UNTITLED_PAGE = "Untitled Page";
  const MAX_PAGE_NUM = 6;

  const [pages, setPages] = useState(props.pages);
  const [numOfPages, setNumOfPages] = useState(props.numOfPages);
  const dropdown = useRef();

  const [modifyIndex, setModifyIndex] = useState(-1);
  const [modifyPageName, setModifyPageName] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [deletionIndex, setDeletionIndex] = useState(-1);

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);
  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }

  const handleClickOutside = e => {
    if (dropdown.current &&
      !dropdown.current.contains(e.target) &&
      !confirmationVisibleRef.current) {
      props.close();
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    props.handlePageNum(numOfPages);
  }, [numOfPages]);

  useEffect(() => {
    props.handlePageTitle(pages);
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

  return (
    <div className="dropdown menu-primary timelineDropdown" style={{ height: "auto" }} ref={dropdown}>
      <div className="menu">
        <h1>Edit Timeline Bar</h1>

        {/* Existing pages */}
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
                      placeholder="New Page Name"
                      onChange={(e) => setModifyPageName(e.target.value)}
                      value={modifyPageName} />
                    <div>
                      <button style={{
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
                              setModifyIndex(index - 1);
                              setModifyPageName(page.name);

                              props.changeObjectPage(index - 1, MAX_PAGE_NUM + 1);
                              props.changeObjectPage(index, index - 1);
                              props.changeObjectPage(MAX_PAGE_NUM + 1, index);

                              props.refreshCanvas();
                            }, 0);
                          }
                        }}>
                        <i className={`fas fa-caret-up ${index === 0 ? "disabled" : ""}`} />
                      </button>
                      <button style={{
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
                              setModifyIndex(index + 1);
                              setModifyPageName(page.name);

                              props.changeObjectPage(index + 1, MAX_PAGE_NUM + 1);
                              props.changeObjectPage(index, index + 1);
                              props.changeObjectPage(MAX_PAGE_NUM + 1, index);

                              props.refreshCanvas();
                            }, 0);
                          }
                        }}>
                        <i className={`fas fa-caret-down ${index === pages.length - 1 ? "disabled" : ""}`} />
                      </button>
                    </div>
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
                    <div className="icons-right">
                      <span className="icon-button" onClick={() => handleModifyPage(index)}>
                        <i className="icons fa fa-pencil" />
                      </span>
                      <span
                        className={`icon-button ${pages.length >= MAX_PAGE_NUM ? "disabled" : ""}`}
                        onClick={async () => {
                          if (pages.length < MAX_PAGE_NUM) {
                            // Copy the page and contents
                            setPages([...pages, {
                              name: pages[index].name + " Copy",
                              hasOverlay: pages[index].hasOverlay
                            }]);
                            setNumOfPages(numOfPages + 1);
                            props.handleCopyPage(index);
                          }
                        }}
                      >
                        <i className={`icons fa fa-copy`} />
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Add a new page input */}
        <div className="menu-item" disabled={pages.length >= MAX_PAGE_NUM}>
          <span className="icon-button" onClick={() => {
            setPages([...pages, {
              name: newPageName ? newPageName : UNTITLED_PAGE,
              hasOverlay: false
            }]);
            setNewPageName("");
            setNumOfPages(numOfPages + 1);
          }}>
            <i className="icons fas fa-plus" />
          </span>
          <input
            className="add-dropdown-item-input"
            type="text"
            placeholder="New Page Name"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
          />
        </div>
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
        confirmMessage={"Yes - Delete Page"}
        message={`Are you sure you want to delete page ${pages[deletionIndex] ?
          pages[deletionIndex].name : ""}? This action cannot be undone.`}
      />
    </div>
  );
}

export default DropdownTimelineBar;
