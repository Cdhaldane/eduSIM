import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import "survey-react/survey.css";
import KonvaHtml from "../KonvaHtml";

const CustomWrapper = forwardRef((props, ref) => {

  const obj = useRef(null);
  const [draggable, setDraggable] = useState(true);

  const getObj = () => {
    return obj.current.parentElement;
  }

  const handleLoad = () => {
    const thisObj = getObj();
    thisObj.parentElement.style.pointerEvents = "none";
  }

  let scrollTimeout = null;
  const noDragTimeout = () => {
    noDrag({ ctrlKey: true });

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      activateDrag({ key: "Control" })
    }, 100);
  }

  const noDrag = (e) => {
    if (e.ctrlKey) {
      obj.current.classList.remove("customPointerEventsOn");
    }
  }

  const activateDrag = (e) => {
    if (e.key === "Control") {
      obj.current.classList.add("customPointerEventsOn");
    }
  }

  useEffect(() => {
    window.addEventListener("wheel", noDragTimeout);
    window.addEventListener("keydown", noDrag);
    window.addEventListener("keyup", activateDrag);

    return () => {
      window.removeEventListener("wheel", noDragTimeout);
      window.removeEventListener("keydown", noDrag);
      window.removeEventListener("keyup", activateDrag);
    }
  }, []);

  useEffect(() => {
    if (obj.current) {
      handleLoad();
    }
  }, [obj.current]);

  const deltaTransformPoint = (matrix, point) => {
    const dx = point.x * matrix.a + point.y * matrix.c + 0;
    const dy = point.x * matrix.b + point.y * matrix.d + 0;
    return {
      x: dx,
      y: dy
    };
  }

  const decomposeMatrix = (matrix) => {
    // @See https://gist.github.com/2052247

    // Calculate delta transform point
    const px = deltaTransformPoint(matrix, { x: 0, y: 1 });
    const py = deltaTransformPoint(matrix, { x: 1, y: 0 });

    // Calculate skew
    const skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    const skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

    return {
      translateX: matrix.e,
      translateY: matrix.f,
      scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
      scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
      skewX: skewX,
      skewY: skewY,
      rotation: skewX // Rotation is the same as skew x
    };
  }

  const toRadians = (angle) => {
    return angle * (Math.PI / 180);
  }

  const calcRotation = (e) => {
    const style = window.getComputedStyle(getObj().parentElement);
    const matrix = new DOMMatrix(style.transform);
    const rot = -toRadians(decomposeMatrix(matrix).rotation);
    const x = e.x;
    const y = e.y;
    const realX = x * Math.cos(rot);
    const realY = y * Math.sin(rot);
    let parentTransform = getObj().parentElement.style.transform;
    parentTransform = parentTransform.slice(parentTransform.indexOf("rot"), parentTransform.length);
    const newTransform = `translate(${realX}px, ${realY}px) ${parentTransform}`;
    setTimeout(() => {
    }, 1000);
  }

  return (
    <KonvaHtml refName={ref._stringRef}>
      <Draggable>
        <div className={"customObj"} data-name={ref._stringRef} ref={ref}>
          <div
            className="customPointerEventsOn"
            ref={obj}
            onClick={props.onClick}
            onContextMenu={props.onContextMenu}
            onMouseUp={props.onMouseUp}
            onMouseDown={props.onMouseDown}
            onMouseMove={props.onMouseMove}
          >
            {props.children}
          </div>
        </div>
      </Draggable>
    </KonvaHtml>
  )
});

export default CustomWrapper;