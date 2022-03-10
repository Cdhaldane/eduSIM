import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Group } from 'react-konva';

const needForceStyle = (el) => {
  const pos = window.getComputedStyle(el).position;
  const ok = pos === 'absolute' || pos === 'relative';
  return !ok;
};

const __rest = (this && this.__rest) || function (s, e) {
  let t = {};
  for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (let i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};

const KonvaHtml = ({
  children,
  divProps,
  transform,
  transformFunc,
  refName,
  defaultProps,
  visible,
  objectSnapping,
  editMode
}) => {

  const groupRef = useRef(null);
  const container = useRef();
  const shouldTransform = transform !== null && transform !== void 0 ? transform : true;
  const [rectWidth, setRectWidth] = useState(0);
  const [rectHeight, setRectHeight] = useState(0);

  const handleTransform = () => {
    const div = container.current;
    if (!div) {
      return;
    }
    if (shouldTransform && groupRef.current) {
      const tr = groupRef.current.getAbsoluteTransform();
      let attrs = tr.decompose();
      if (transformFunc) {
        attrs = transformFunc(attrs);
      }
      div.style.position = 'absolute';
      div.style.zIndex = '0';
      div.style.top = '0px';
      div.style.left = '0px';
      div.style.transform = `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`;
      div.style.transformOrigin = 'top left';
      div.style.pointerEvents = editMode ? "none" : "auto";
    } else {
      div.style.position = '';
      div.style.zIndex = '';
      div.style.top = '';
      div.style.left = '';
      div.style.transform = ``;
      div.style.transformOrigin = '';
      div.style.pointerEvents = '';
    }
    const _a = divProps || {}, { style } = _a, restProps = __rest(_a, ["style"]);
    Object.assign(div.style, style);
    Object.assign(div, restProps);
  };

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    let stage = null;
    if (defaultProps.overlay) {
      stage = "overlayGameContainer";
    } else if (defaultProps.infolevel) {
      stage = editMode ? "editPersonalContainer" : "personalGameContainer";
    } else {
      stage = editMode ? "editMainContainer" : "groupGameContainer";
    }
    stage = document.getElementById(stage);
    if (!stage) return;
    const parent = stage.querySelectorAll(".konvajs-content")[0];
    if (!parent) {
      return;
    }
    let div = document.createElement('div');
    container.current = div;
    parent.appendChild(div);
    if (shouldTransform && needForceStyle(parent)) {
      parent.style.position = 'relative';
    }
    group.on('absoluteTransformChange', handleTransform);
    handleTransform();
    return () => {
      var _a;
      group.off('absoluteTransformChange', handleTransform);
      ReactDOM.unmountComponentAtNode(div);
      (_a = div.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(div);
    };
  }, [shouldTransform]);

  useLayoutEffect(() => {
    handleTransform();
  }, [divProps]);

  useLayoutEffect(() => {
    if (container.current) {
      setRectWidth(container.current.clientWidth);
      setRectHeight(container.current.clientHeight);
      ReactDOM.render(children, container.current);
    }
  });

  useEffect(() => {
    const div = container.current;
    if (!div) {
      return;
    }
    // Set object visiblity
    div.style.opacity = visible ? "1" : "0";
  }, [visible]);

  return (
    <Group
      ref={groupRef}
      id={refName}
      name={"customObj"}
      draggable={refName.includes("richText") ? false : true}
      onTransformEnd={defaultProps.onTransformEnd}
      onDragMove={(e) => {
        objectSnapping(groupRef.current, e);
      }}
      onDragEnd={defaultProps.onDragEnd}
      customProps={defaultProps.custom}
      x={defaultProps.x}
      y={defaultProps.y}
      visible={visible}
      rotation={defaultProps.rotation}
      scaleX={defaultProps.scaleX}
      scaleY={defaultProps.scaleY}
      offsetX={0}
      offsetY={0}
      skewX={0}
      skewY={0}
      infolevel={defaultProps.infolevel}
      overlay={defaultProps.overlay}
    >
      {/*<Rect
        id={"customRect"}
        name={"refName"}
        //ref={"customRect"}
        draggable={false}
        visible={true}
        opacity={1}
        fill={"green"}
        width={rectWidth}
        height={rectHeight}
        x={0}
        y={0}
      /*currentId={this.state.customRect[0].currentId}
      width={this.state.customRect[0].width}
      height={this.state.customRect[0].height}
      x={this.state.customRect[0].x}
      y={this.state.customRect[0].y}
      onClick={() => this.onObjectClick(this.state.customRect[0])}
      onTransformStart={this.onObjectTransformStart}
      onTransformEnd={() => this.onObjectTransformEnd(this.state.customRect[0])}
      onDragMove={(e) => this.onObjectDragMove(this.state.customRect[0], e)}
      onDragEnd={(e) => this.handleDragEnd(e, this.getObjType(this.state.customRect[0].id), this.state.customRect[0].ref)}
      onContextMenu={this.onObjectContextMenu}
      />*/}
    </Group>
  );
};

export default KonvaHtml;
