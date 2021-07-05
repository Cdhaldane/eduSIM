import React, { useState, useEffect  } from 'react';
import { Stage, Layer, Rect, Transformer, Circle, Star } from 'react-konva';
import ContextMenu from "../../ContextMenu/ContextMenu";
import Portal from "./Portal"


const Stars = ({ shapeProps, isSelected, onSelect, onChange }) => {
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
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();

    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Star
        onContextMenu={handleContextMenu}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
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

export default Stars;
