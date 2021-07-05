import React, { useState, useEffect  } from 'react';
import { Rect, Transformer } from "react-konva";
import ContextMenu from "../../ContextMenu/ContextMenu";
import Portal from "./Portal"
const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  const [selectedContextMenu, setSelectedContextMenu] = useState(null);

  const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });

  const updateMousePosition = ev => {
    setMousePosition({ x: ev.clientX, y: ev.clientY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
};

const mousePosition = useMousePosition()

  const handleOptionSelected = option => {
    setSelectedContextMenu(null);

  };
  const handleContextMenu = e =>{
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***


   setSelectedContextMenu({
     type: "START",
     position: mousePosition
   });
 };

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.setNode(shapeRef.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  return (
    <React.Fragment>
      <Rect
        onContextMenu={handleContextMenu}
        onClick={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={e => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={e => {
          // transformer is changing scale
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
      {selectedContextMenu && (
           <Portal>
             <ContextMenu
               {...selectedContextMenu}
               onOptionSelected={handleOptionSelected}
             />
           </Portal>
         )}
    </React.Fragment>
  );
};
export default Rectangle;
