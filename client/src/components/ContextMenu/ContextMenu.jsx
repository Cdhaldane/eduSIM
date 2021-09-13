import React, { useState } from "react";
import Dropdownedit from "../DropDown/Dropdownedit";
import "./ContextMenu.css"

function ContextMenu(props) {
  console.log(props);

  const [drop, setDrop] = useState(false);
  const [clickedOutside, setClickedOutside] = React.useState(false);
  const myRef = React.useRef();

  const handleClickOutside = e => {
    if (!myRef.current.contains(e.target)) {
      setClickedOutside(true);
    }
  };

  const handleClickInside = () => setClickedOutside(false);

  // https://stackoverflow.com/a/50558760 For tommorrow!
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  function handleColorF(e) {
    props.choosecolorf(e);
  }

  function handleColorS(e) {
    props.choosecolors(e);
  }

  function handleEdit(e) {
    setDrop(!drop);
  }

  function handleWidth(e) {
    props.handleWidth(e);
  }

  function handleOpacity(e) {
    props.handleOpacity(e);
  }

  return (
    <div
      ref={myRef} 
      onClick={handleClickInside}
      className="cmenu"
      style={{
        position: "absolute",
        left: props.position.x + 100,
        top: props.position.y - 20,
      }}
    >
      <ul>
        <li onClick={props.cut}>Cut1</li>
        <li onClick={props.copy}>Copy2</li>
        <li onClick={props.paste}>Paste</li>
        <li onClick={props.delete}>Delete</li>
        <li onClick={handleEdit}>Edit shape</li>
        <hr />
        <li onClick={props.close}>Close</li>
      </ul>

      {drop && <div className="drop">
        <Dropdownedit
          title="Edit Shape"
          choosecolorf={handleColorF}
          choosecolors={handleColorS}
          handleWidth={handleWidth}
          handleOpacity={handleOpacity}
        />
      </div>}
    </div>
  );
};

export default ContextMenu;
