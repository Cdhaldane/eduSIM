import React, { useState, useEffect, useRef, useCallback } from "react";
import debounce from 'lodash.debounce';
import DropdownEditObject from "../Dropdown/DropdownEditObject";
import DeckCreator from "./DeckCreator";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";


import "./ContextMenu.css"

import Up from "../../../public/icons/chevron-up.svg"
import Down from "../../../public/icons/chevron-down.svg"
import { set } from "immutable";


const ContextMenu = (props) => {
  const [drop, setDrop] = useState(false);
  const [conditions, setConditions] = useState({});
  const [conditionsVisible, setConditionsVisible] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [editModalLeft, setEditModalLeft] = useState(false);
  const [updater, setUpdater] = useState(false);
  const [layerDisabled, setLayerDisabled] = useState('');
  const [editTitle, setEditTitle] = useState("");


  const menuRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    setLayerDisabled(props.contextDisabled);
    setConditions(props.getObjState()?.conditions || {});
  },[props.pages, props.getObjState(), props.contextDisabled])

  const setContextMenuTitle = () => {
    const editTitleOptions = ["text", "poll", "connect4", "tic", "html", "input", "timer"];
    const selectedShapeName = props.selectedShapeName;
    const title = editTitleOptions.find(key => selectedShapeName.startsWith(key)) || "shape";
    setEditTitle(title);
  }

  const handleClickOutside = e => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      props.close();
    }
  };

  const calcOutOfBounds = (x, y) => {
    const dropHeight = menuRef.current ? menuRef.current.clientHeight : 235;
    const dropWidth = menuRef.current ? menuRef.current.clientWidth : 155;
    const editModalWidth = 400;
    const paddingPx = 7;
    const screenH = window.innerHeight - paddingPx;
    const screenW = window.innerWidth - paddingPx;

    let transformX = (x + dropWidth) - screenW;
    if (transformX < 0) {
      transformX = 0;
    }
    let transformY = (y + dropHeight) - screenH;
    if (transformY < 0) {
      transformY = 0;
    }
    let left = false;
    if (screenW - (x + dropWidth + editModalWidth) < 0 && menuRef.current) {
      left = true;
    }

    return {
      x: transformX,
      y: transformY,
      left: left
    }
  }
  const [offsetX, setOffsetX] = useState(-calcOutOfBounds(props.position.x, props.position.y).x);
  const [offsetY, setOffsetY] = useState(-calcOutOfBounds(props.position.x, props.position.y).y);

  const handleRightClick = (e) => {
    setDrop(false);
    const offset = calcOutOfBounds(e.clientX, e.clientY);
    setOffsetX(-offset.x);
    setOffsetY(-offset.y);
    setUpdater(true)
    setEditModalLeft(offset.left);
  }

  const handleEdit = () => {
    setDrop(!drop);
    if (conditionsVisible) {
      props.updateObjState({
        conditions
      });
    }
    setConditionsVisible(false);
  }

  const handleConditionsVisible = () => {
    setDrop(false);
    if (conditionsVisible) {
      props.updateObjState({
        conditions
      });
    }
    setConditionsVisible(!conditionsVisible);
  }

  const handleGrouping = () => {
    props.handleGrouping();
    props.close();
  }

  const handleUngrouping = () => {
    props.handleUngrouping();
    props.close();
  }

  const debounceObjState = useCallback(
    debounce(state => props.updateObjState(state), 100),
    [], // will be created only once initially
  );

  const handleUpdateConditions = (key, value) => {
    setConditions(old => ({
      ...old,
      [key]: value ? value : undefined
    }))
    debounceObjState({
      conditions: {
        ...conditions,
        [key]: value ? value : undefined
      }
    });
  }
  const handleDeck = () => {
    setShowDeck(true)
    setOffsetX(1000)
  }

  useEffect(() => {
    if (!showDeck) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('contextmenu', handleRightClick);
      const offset = calcOutOfBounds(props.position.x, props.position.y);
      setOffsetX(-offset.x);
      setOffsetY(-offset.y);
      setEditModalLeft(calcOutOfBounds(props.position.x, props.position.y).left);
      if (props.selectedShapeName) {
        setContextMenuTitle();
      }
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('contextmenu', handleRightClick);
      }
    }
  }, [props.selectedShapeName, showDeck]);

  const onSave = (cards) => {
    props.updateObjState({
      deck: cards
    });
    setShowDeck(false);
  }

  const handleLock = () => {
    props.lock();
  }

  const handleLayer = (layer) => {
      props.layerTo(props.selectedShapeName, layer)
  }

  const handleUtil = (util) => {
    if (util == "cut")
      props.cut()
    else if (util == "copy")
      props.copy()
    else if (util == "delete")
      props.delete()
  }

  return (
    <>
      <div
        ref={menuRef}
        key={props.position.x}
        className={`cmenu `}
        style={{
          width: "170px",
          left: props.position.x + offsetX,
          top: props.position.y + offsetY
        }}
      >
        <ul>
          <li onClick={() => handleUtil('cut')}>{t("common.cut")}</li>
          <li onClick={() => handleUtil('copy')}>{t("common.copy")}</li>
          <li onClick={() => handleUtil('delete')}>{t("common.delete")}</li>
          <li onClick={handleLock}>{props.getObjState()?.lock ? "Unlock" : "Lock"}</li>
          {!props.addGroup && !props.unGroup && (
            <li onClick={handleConditionsVisible}>{t("edit.changeConditions")}</li>
          )}
          {!props.addGroup && !props.unGroup &&
            !props.selectedShapeName.includes("richText") && (
              <li onClick={handleEdit}>{"Edit " + props.getObjState()?.name}</li>
            )}
          {props.addGroup && (
            <li onClick={handleGrouping}>{t("edit.groupObjects")}</li>
          )}
          {props.unGroup && (
            <li onClick={handleUngrouping}>{t("edit.ungroupObjects")}</li>
          )}
          {props.selectedShapeName.includes("decks") && (
            <li onClick={handleDeck}>Edit Deck</li>
          )}

          <div className="layerBtns">
            {t("edit.layer")}
            <li
              onClick={() => handleLayer("up")}
              className={layerDisabled === 'up' ? 'disabled' : ''}
            >
              <i><Up className="icon alert-icon" /></i>
            </li>
            <li
              onClick={() => handleLayer("down")}
              className={layerDisabled === 'down' ? 'disabled' : ''}
            >
              <i><Down className="icon alert-icon" /></i>
            </li>
          </div>
        </ul>

        {
          drop && (
            <div className="drop">
              <DropdownEditObject
                setCustomObjData={props.setCustomObjData}
                top={menuRef.current.offsetTop}
                title={editTitle}
                handleFillColor={props.handleFillColor}
                handleStrokeColor={props.handleStrokeColor}
                handleWidth={props.handleWidth}
                handleOpacity={props.handleOpacity}
                handleSize={props.handleSize}
                handleFont={props.handleFont}
                font={props.selectedFont}
                left={editModalLeft}
                close={props.close}
                selectedShapeName={props.selectedShapeName}
                getObj={props.getObj}
                getObjState={props.getObjState}
                updateObjState={props.updateObjState}
                variables={props.variables}
              />
            </div>
          )
        }
        {
          conditionsVisible && (
            <div className="drop">
              <div
                className="dropdownedit conditionsedit fixed-anim"
                style={{
                  ...(editModalLeft ? { right: "110px" } : { left: "160px" }),
                }}
              >
                <p>{t("edit.onlyDisplayThisIf")}</p>
                <input
                  type="text"
                  placeholder={t("edit.variableName")}
                  value={conditions?.varName || ""}
                  onChange={(e) => handleUpdateConditions("varName", e.target.value)}
                />
                <select
                  name="inputtype"
                  value={conditions?.condition}
                  onChange={(e) => handleUpdateConditions("condition", e.target.value)}
                >
                  {[
                    "positive",
                    "negative",
                    "isgreater",
                    "isless",
                    "isequal",
                    "between",
                    "onchange"
                  ].map(val => (
                    <option value={val} key={val}>{t(`edit.cond.${val}`)}</option>
                  ))}
                </select>
                {conditions?.condition?.startsWith('is') && (
                  <input
                    type="text"
                    placeholder={t("edit.valueToCheckAgainst")}
                    value={conditions?.trueValue || ""}
                    onChange={(e) => handleUpdateConditions("trueValue", e.target.value)}
                  />
                )}
                {conditions?.condition == 'between' && (
                  <div className="conditionsbetween">
                    <input
                      type="text"
                      placeholder={t("edit.minimum")}
                      value={conditions?.trueValue || ""}
                      onChange={(e) => handleUpdateConditions("trueValue", e.target.value)}
                    />
                    <p>{t("common.and")}</p>
                    <input
                      type="text"
                      placeholder={t("edit.maximum")}
                      value={conditions?.trueValueAlt || ""}
                      onChange={(e) => handleUpdateConditions("trueValueAlt", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div >

      <Modal
        isOpen={showDeck}
        onRequestClose={() => setShowDeck(false)}
        className="deckModal"
        overlayClassName="myoverlay"
        ariaHideApp={false}
        closeTimeoutMS={250}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <DeckCreator onSave={onSave} getObj={props.getObjState()} />
        </div>
      </Modal>
    </>
  );
};

export default ContextMenu;
