import React, { useState, useEffect, useRef, useCallback } from "react";
import debounce from 'lodash.debounce';
import DropdownEditObject from "../Dropdown/DropdownEditObject";
import { useTranslation } from "react-i18next";

import "./ContextMenu.css"

const ContextMenu = (props) => {

  const [drop, setDrop] = useState(false);
  const [conditions, setConditions] = useState(props.getObjState()?.conditions || {});
  const [conditionsVisible, setConditionsVisible] = useState(false);
  const [editModalLeft, setEditModalLeft] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const menu = useRef();
  const { t } = useTranslation();

  const setContextMenuTitle = () => {
    let set = false;
    [
      "text",
      "poll",
      "connect4",
      "tic",
      "html",
      "input",
      "timer",
    ].forEach((key) => {
      if (props.selectedShapeName.startsWith(key)) {
        set = true;
        setEditTitle(key);
      }
    })
    if (!set) setEditTitle("shape");
  }

  const handleClickOutside = e => {
    if (menu.current && !menu.current.contains(e.target)) {
      props.close();
    }
  };

  const calcOutOfBounds = (x, y) => {
    const dropHeight = menu.current ? menu.current.clientHeight : 235;
    const dropWidth = menu.current ? menu.current.clientWidth : 155;
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
    if (screenW - (x + dropWidth + editModalWidth) < 0 && menu.current) {
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

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('contextmenu', handleRightClick);

    setEditModalLeft(calcOutOfBounds(props.position.x, props.position.y).left);
    setContextMenuTitle();

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('contextmenu', handleRightClick);
    }
  }, []);

  const handleRightClick = (e) => {
    setDrop(false);

    const offset = calcOutOfBounds(e.clientX, e.clientY);
    setOffsetX(-offset.x);
    setOffsetY(-offset.y);
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

  return (
    <div
      ref={menu}
      className="cmenu"
      style={{
        width: "155px",
        left: props.position.x + offsetX,
        top: props.position.y + offsetY
      }}
    >
      <ul>

        <li onClick={props.delete}>{t("common.delete")}</li>
        {!props.addGroup && !props.unGroup && (
          <li onClick={handleConditionsVisible}>{t("edit.changeConditions")}</li>
        )}
        {!props.addGroup && !props.unGroup && (
          <li onClick={handleEdit}>{t(`edit.${editTitle}Edit`)}</li>
        )}
        {props.addGroup && (
          <li onClick={handleGrouping}>{t("edit.groupObjects")}</li>
        )}
        {props.unGroup && (
          <li onClick={handleUngrouping}>{t("edit.ungroupObjects")}</li>
        )}
        <div className="layerLbl">
          {t("edit.layer")}
        </div>
        <div className="layerBtns">
          <li
            onClick={() => props.layerUp(props.selectedShapeName)}
            className={`${props.getObjState()?.onTop !== undefined ?
              (props.getObjState().onTop ? "disabled" : "") :
              (props.layers[props.layers.length - 1] === props.selectedShapeName ? "disabled" : "")}`}
          >
            <i className="fas fa-arrow-up" />
          </li>
        </div>
        <div className="layerBtns">
          <li
            onClick={() => props.layerDown(props.selectedShapeName)}
            className={`${props.getObjState()?.onTop !== undefined ?
            (!props.getObjState().onTop ? "disabled" : "") :
            (props.layers[0 + props.customCount()] === props.selectedShapeName ? "disabled" : "")}`}
          >
            <i className="fas fa-arrow-down" />
          </li>
        </div>
      </ul>

      {drop && (
        <div className="drop">
          <DropdownEditObject
            setPollData={props.setPollData}
            top={menu.current.offsetTop}
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
          />
        </div>
      )}
      {conditionsVisible && (
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
      )}
    </div>
  );
};

export default ContextMenu;
