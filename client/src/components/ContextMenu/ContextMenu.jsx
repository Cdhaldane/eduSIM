import React, {useState} from "react";
import "./ContextMenu.css";
import Dropdownedit from "../DropDown/Dropdownedit";


function ContextMenu(props){
  console.log(props)
  const [drop, setDrop] = useState(false);

  function handleColorF(e){
    props.choosecolorf(e);
  }

  function handleColorS(e){
    props.choosecolors(e);
  }

  function handleEdit(e) {
    setDrop(!drop);
  }

  function handleWidth(e){
    props.handleWidth(e);
  }

  function handleOpacity(e){
    props.handleOpacity(e);
  }




  return (

    <div
      className="cmenu"
      style={{
        position: "absolute",
        left: props.position.x+100,
        top: props.position.y-20,
      }}
    >
      <ul>
        <li onClick={props.cut}>Cut</li>
        <li onClick={props.copy}>Copy</li>
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
