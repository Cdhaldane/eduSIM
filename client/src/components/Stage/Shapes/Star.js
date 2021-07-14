import React, { useState, useEffect  } from 'react';
import { Star, Transformer } from "react-konva";
import ContextMenu from "../../ContextMenu/ContextMenu";
import Portal from "./Portal"

let history = [
  {
    x: 20,
    y: 20
  }
];
let historyStep = 0;

const Stars = ({ shapeProps, isSelected, onSelect, onChange, forward}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  const [copy, setCopy] = useState();
  const [selectedContextMenu, setSelectedContextMenu] = useState(null);
  const [ position, setPosition ] = useState(history[0])
  const [y, setY] = useState(window.scrollY);

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

 const handleUndo = () => {
    if (historyStep === 0) {
      return;
    }
    historyStep -= 1;
    const previous = history[historyStep];
    onChange({
      ...shapeProps,
      x: previous.x,
      y: previous.y,
    });
    setSelectedContextMenu(null);
  };

  const handleRedo = () => {
      if (historyStep === history.length - 1) {
        return;
      }
      historyStep += 1;
      const next = history[historyStep];
      onChange({
        ...shapeProps,
        x: next.x,
        y: next.y,
      });
      setSelectedContextMenu(null);
    };

    const handleDelete = (e) => {
        historyStep += 1;
        onChange({
          ...shapeProps,
          visible: false
        });

        setSelectedContextMenu(null);
      };

      const handleCopy= (e) => {
        console.log(shapeRef)
          historyStep += 1;
          setCopy(shapeRef);
            setSelectedContextMenu(null);
        };

      const handlePaste= (e) => {
          setSelectedContextMenu(null);
        };

      const handleCut= (e) => {
          setSelectedContextMenu(null);
        };

      const handleBack= (e) => {

         const id = e.target.name();
         const items = this.state.items.slice();
         const item = items.find(i => i.id === id);
         const index = items.indexOf(item);
         // remove from the list:
         items.splice(index, 1);
         // add to the top
         items.push(item);
         this.setState({
           items
         });
           setSelectedContextMenu(null);
        };


        const handleClose= (e) => {
            setSelectedContextMenu(null);
        }

      function handleColorF(e){
          onChange({
            ...shapeProps,
            fill: e.hex
          });
      }

      function handleColorS(e){
          onChange({
            ...shapeProps,
            stroke: e.hex
          });
      }

      function handleWidth(e){
        onChange({
          ...shapeProps,
          strokeWidth: e/8
        });
      }

      function handleOpacity(e){
        onChange({
          ...shapeProps,
          opacity: e
        });
      }

  const handleDragEnd = (e) => {
    history = history.slice(0, historyStep + 1);
    const pos = {
      x: e.target.x(),
      y: e.target.y()
    };
    history = history.concat([pos]);
    historyStep += 1;
    e.target.moveToTop();
  };

  const handleForward= (e) => {
    const window = e.currentTarget;
    console.log(e.originalEvent.wheelDelta)
    if (e.deltaY < 0){
      e.target.moveToTop();
    }
    else if (e.deltaY > 0)
    {
      e.target.moveToBottom();
    }

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
      <Star
        onContextMenu={handleContextMenu}
        onClick={onSelect}
        onWheel={handleForward}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={handleDragEnd}
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
               undo={handleUndo}
               redo={handleRedo}
               delete={handleDelete}
               copy={handleCopy}
               paste={handlePaste}
               back={handleBack}
               forward={handleForward}
               choosecolors={handleColorS}
               choosecolorf={handleColorF}
               close={handleClose}
               handleWidth={handleWidth}
               handleOpacity={handleOpacity}
             />

           </Portal>
         )}
    </React.Fragment>
  );
};
export default Stars;
