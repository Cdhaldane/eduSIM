import React, { useRef, useLayoutEffect, createElement, forwardRef } from 'react';
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
  groupProps,
  divProps,
  transform,
  transformFunc,
  refName,
  defaultProps
}) => {

  const groupRef = useRef(null);
  const container = useRef();
  const shouldTransform = transform !== null && transform !== void 0 ? transform : true;

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
    } else {
      div.style.position = '';
      div.style.zIndex = '';
      div.style.top = '';
      div.style.left = '';
      div.style.transform = ``;
      div.style.transformOrigin = '';
    }
    const _a = divProps || {}, { style } = _a, restProps = __rest(_a, ["style"]);
    Object.assign(div.style, style);
    Object.assign(div, restProps);
  };

  useLayoutEffect(() => {
    var _a;
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const parent = (_a = group.getStage()) === null || _a === void 0 ? void 0 : _a.container();
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
      ReactDOM.render(children, container.current);
    }
  });

  return createElement(Group, Object.assign({
    ref: groupRef,
    id: refName,
    draggable: true,
    onTransformEnd: defaultProps.onTransformEnd,
    onDragEnd: defaultProps.onDragEnd
  }, groupProps));
};

export default KonvaHtml;
