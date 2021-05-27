import React from "react";
import Note from "../components/Note";
import Level from "../components/Level";
import Info from "../components/InformationPopup";

function GamePage(props){
    return (
      <div className="gamepage">
        <Level />
        <Info />
      </div>
    );
}

export default GamePage;
