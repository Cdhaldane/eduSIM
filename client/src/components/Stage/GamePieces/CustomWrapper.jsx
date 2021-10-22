import React, { forwardRef, useEffect, useRef } from 'react';
import KonvaHtml from "../KonvaHtml";

const CustomWrapper = forwardRef((props, ref) => {

  const obj = useRef(null);

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

  return (
    <KonvaHtml
      refName={ref._stringRef}
      defaultProps={props.defaultProps}
    >
      <div
        onClick={() => props.updateKonva(ref._stringRef, true)}
        onContextMenu={() => props.updateKonva(ref._stringRef, true)}
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