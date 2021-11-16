import React, { forwardRef, useEffect, useRef, useState } from 'react';
import KonvaHtml from "../KonvaHtml";

const CustomWrapper = forwardRef((props, ref) => {

  const obj = useRef(null);

  // if rendering outside a konva canvas:
  // use the transform properties and apply them directly to style
  if (props.static) {
    return (
      <div
        ref={obj}
        style={{
          position: 'absolute',
          top: props.y+'px',
          left: props.x+'px',
          transform: `
            ${props.rotation ? `rotateZ(${props.rotation}deg) ` : ''}
            ${props.scaleX ? `scaleX(${props.scaleX}) ` : ''}
            ${props.scaleY ? `scaleY(${props.scaleY}) ` : ''}
          `,
          transformOrigin: 'top left',
          ...(!props.visible ? {display: 'none'} : {})
        }}
      >
        {props.children}
      </div>
    );
  }

  const getObj = () => {
    return obj.current.parentElement;
  }

  const handleLoad = () => {
    const thisObj = getObj();
    if (props.defaultProps.editMode) {
      thisObj.parentElement.style.pointerEvents = "none";
    }
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
    if (e.ctrlKey && obj.current) {
      obj.current.classList.remove("customPointerEventsOn");
    }
  }

  const activateDrag = (e) => {
    if (e.key === "Control" && obj.current) {
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

  return (
    <KonvaHtml
      refName={ref._stringRef}
      defaultProps={props.defaultProps}
      visible={props.visible}
    >
      <div
        onClick={() => props.updateKonva ? props.updateKonva(ref._stringRef, true) : null}
        onContextMenu={() => props.updateKonva ? props.updateKonva(ref._stringRef, true) : null}
        className={"customObj"}
        data-name={ref._stringRef}
        ref={ref}
      >
        <div
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
    </KonvaHtml>
  )
});

export default CustomWrapper;