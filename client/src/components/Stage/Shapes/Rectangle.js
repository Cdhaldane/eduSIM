import React, { useState, useEffect  } from 'react';
import { Rect, Transformer } from "react-konva";
import ContextMenu from "../../ContextMenu/ContextMenu";
import Portal from "./Portal"

let history = [
  {
    x: 20,
    y: 20
  }
];
let historyStep = 0;

const Rectangle = (props) => {
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

 // const handleUndo = () => {
 //    if (historyStep === 0) {
 //      return;
 //    }
 //    historyStep -= 1;
 //    const previous = history[historyStep];
 //    onChange({
 //      ...shapeProps,
 //      x: previous.x,
 //      y: previous.y,
 //    });
 //    setSelectedContextMenu(null);
 //  };
 //
 //  const handleRedo = () => {
 //      if (historyStep === history.length - 1) {
 //        return;
 //      }
 //      historyStep += 1;
 //      const next = history[historyStep];
 //      onChange({
 //        ...shapeProps,
 //        x: next.x,
 //        y: next.y,
 //      });
 //      setSelectedContextMenu(null);
 //    };
 //
 //    const handleDelete = (e) => {
 //        historyStep += 1;
 //        onChange({
 //          ...shapeProps,
 //          visible: false
 //        });
 //
 //        setSelectedContextMenu(null);
 //      };
 //
 //      const handleCopy= (e) => {
 //        console.log(shapeRef)
 //          historyStep += 1;
 //          setCopy(shapeRef);
 //            setSelectedContextMenu(null);
 //        };
 //
 //      const handlePaste= (e) => {
 //
 //        };
 //
 //      const handleCut= (e) => {
 //          setSelectedContextMenu(null);
 //        };
 //
 //      const handleBack= (e) => {
 //
 //         const id = e.target.name();
 //         const items = this.state.items.slice();
 //         const item = items.find(i => i.id === id);
 //         const index = items.indexOf(item);
 //         // remove from the list:
 //         items.splice(index, 1);
 //         // add to the top
 //         items.push(item);
 //         this.setState({
 //           items
 //         });
 //           setSelectedContextMenu(null);
 //        };
 //
 //
 //        const handleClose= (e) => {
 //            setSelectedContextMenu(null);
 //        }
 //
 //      function handleColorF(e){
 //          onChange({
 //            ...shapeProps,
 //            fill: e.hex
 //          });
 //      }
 //
 //      function handleColorS(e){
 //          onChange({
 //            ...shapeProps,
 //            stroke: e.hex
 //          });
 //      }
 //
 //      function handleWidth(e){
 //        onChange({
 //          ...shapeProps,
 //          strokeWidth: e/8
 //        });
 //      }
 //
 //      function handleOpacity(e){
 //        onChange({
 //          ...shapeProps,
 //          opacity: e
 //        });
 //      }
 //
 //  const handleDragEnd = (e) => {
 //    history = history.slice(0, historyStep + 1);
 //    const pos = {
 //      x: e.target.x(),
 //      y: e.target.y()
 //    };
 //    history = history.concat([pos]);
 //    historyStep += 1;
 //    e.target.moveToTop();
 //  };
 //
 //  const handleForward= (e) => {
 //    const window = e.currentTarget;
 //    console.log(e.originalEvent.wheelDelta)
 //    if (e.deltaY < 0){
 //      e.target.moveToTop();
 //    }
 //    else if (e.deltaY > 0)
 //    {
 //      e.target.moveToBottom();
 //    }
 //    };


  return (
    <React.Fragment>
      <Rect
        onContextMenu={handleContextMenu}
        onClick={props.onClick}
        onTransformStart={props.onTransformStart}
        onTransform={props.onTransform}
        onTransformEnd={props.onTransformEnd}
        rotation={props.rotation}
        ref={props.ref}
        fill={props.fill}
        opacity={props.opacity}
        name={props.name}
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        strokeScaleEnabled={false}
        draggable
        onDragMove={props.onDragMove}
        onDragEnd={props.onDragEnd}
      />


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
