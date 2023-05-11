import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ConfirmationModal from "../../../Modal/ConfirmationModal";
import MultiLevel from "../../../Dropdown/Multilevel";

import "../../Sidebar.css";
import Trash from "../../../../../public/icons/trash-can-alt-2.svg";
import Plus from "../../../../../public/icons/circle-plus.svg";
import Line from "../../../../../public/icons/minus.svg";

const InteractionList = ({ interactions, onDelete, handleSelect }) => {
  return (
    interactions.map((interaction, index) => (
      <div key={index} className="condition-inputs">
        <i onClick={() => onDelete(index)}><Trash className="icon var-trash" /></i>
        <div className="ints-container">
          <div className={"if"}>
            <h1>When</h1><h2>{interaction[0]}</h2><h1>Is Clicked</h1>
          </div>
          <div className={"then"}>
            {interaction[6] === 'var' ? (
              <>
                <h1>Set</h1><h2>{interaction[1]}</h2><h3>{interaction[2]}</h3><h2>{interaction[3]}</h2>
                <h3>{interaction[4]}</h3><h2>{interaction[5]}</h2>
              </>
            ) : (
              <>
                <h1>Increment</h1><h2>{interaction[1]}</h2><h1>By</h1><h3>{interaction[3]}</h3>
              </>
            )}
          </div>
        </div>
      </div>
    ))
  );
};

const InteractionForm = ({ interaction, handleInteraction, handleSelect, handleTypeChange, addInteraction, cancelAdd, shapes, gameVars }) => {
  const { varName, start, showAddition, box } = interaction;

  const [isVCheck, setIsVCheck] = useState(false);
  const [isCheck, setIsCheck] = useState(false);

  return (
    <div className="variable-adding ints-fix">
      <div className="ints-area">
        <div className="ints-name">
          <h1>Input to Set</h1>
          <select value={varName} onChange={(e) => handleInteraction(0, e)}>
            {shapes.map((data) => (
              <option key={data.ref} value={data.ref}>{data.ref}</option>
            ))}
          </select>
        </div>
        <div className='ints-checks'>
          <input type="checkbox" name="checkbox" value="incr" onChange={() => setIsCheck(!isCheck)} checked={isCheck} />
          <h1>Incremental</h1>
          <input type="checkbox" name="checkbox" value="var" onChange={() => setIsVCheck(!isVCheck)} checked={isVCheck} />
          <h1>Variable</h1>
        </div>
        {isVCheck && (
          <SetInteraction
            interaction={interaction}
            handleInteraction={handleInteraction}
            handleSelect={handleSelect}
            box={box}
            showAddition={showAddition}
            gameVars={gameVars}
          />
        )}
        {isCheck && (
          <IncrementInteraction
            interaction={interaction}
            handleInteraction={handleInteraction}
            handleSelect={handleSelect}
            box={box}
            gameVars={gameVars}
          />
        )}
      </div>
      <div className="con-hold">
        <button className="con-add-b" onClick={addInteraction}>Add</button>
        <button className="con-can-b" onClick={cancelAdd}>Cancel</button>
      </div>
    </div>
  );
};

const SetInteraction = ({ interaction, handleInteraction, handleSelect, box, showAddition }) => {
  return (
    <div className={'ints-con'}>
      <h2 className="smaller-text">SET</h2>
      <div className="box int-special">
        <MultiLevel value={gameVars} handleChange={handleSelect} x={1} />
      </div>
      <h2 className="smaller-text">TO</h2>
      <div className="ints-boxes">
        <input type="text" data={interaction[2]} onChange={(e) => handleInteraction(2, e)} />
        <h2 className="smaller-text">IF</h2>
        <select value={interaction[3]} onChange={(e) => handleInteraction(3, e)}>
          {shapes.map((shape) => (
            <option key={shape} value={shape}>{shape}</option>
          ))}
        </select>
        <h2 className="smaller-text">IS</h2>
        <select value={interaction[4]} onChange={(e) => handleInteraction(4, e)}>
          {multiLevelOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <h2 className="smaller-text">EQUAL TO</h2>
        <input type="text" value={interaction[5]} onChange={(e) => handleInteraction(5, e)} />
      </div>
      {showAddition && (
        <div className="ints-add" onClick={() => handleInteraction(6, 'var')}>
          <h1>+</h1>
        </div>
      )}
    </div>
  );
};

const IncrementInteraction = ({ interaction, handleInteraction, handleSelect, box, gameVars }) => {
  return (
    <div className={'ints-con'}>
      <h2 className="smaller-text">INCREMENT</h2>
      <div className="box int-special">
        <MultiLevel data={gameVars} handleChange={handleSelect} x={1} />
      </div>
      <h2 className="smaller-text">BY</h2>
      <input type="text" value={interaction[3]} onChange={(e) => handleInteraction(3, e)} />
    </div>
  );
};

const initialInteractionState = (props) => {
  const start = props.gameVars[0] ? (Object.keys(props.gameVars[0])).toString() : '';
  return [props.shapes[0]?.varName, start, '=', start, '', '', ''];
}



const Interaction = (props) => {
  const { t } = useTranslation();
  const [showConAdd, setShowConAdd] = useState(false);
  const [interaction, setInteraction] = useState(initialInteractionState(props));
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationVisibleRef = useRef(confirmationVisible);

  const setConfirmationModal = (data) => {
    setConfirmationVisible(data);
    setTimeout(() => { confirmationVisibleRef.current = data }, 250);
  }

  useEffect(() => {
    if (!localStorage.interactions) {
      localStorage.setItem('interactions', JSON.stringify([]));
    }
  }, [])

  const handleSelect = (value, x) => {
    console.log(value, x)
    interaction[x]= value.label
  }

  const handleTypeChange = useCallback((newType, i) => {
    setInteraction(prevState => {
      const newInteraction = [...prevState];
      newInteraction[i] = newType;
      return newInteraction;
    });
  }, []);

  const deleteCon = (i) => {
    let interactions = getInteractions();
    interactions.splice(i, 1);
    saveInteractions(interactions);
  }

  const addCon = () => {
    let interactions = getInteractions();
    interactions.push(interaction);
    saveInteractions(interactions);
    setShowConAdd(!showConAdd)
    setInteraction(initialInteractionState(props));
  }

  const getInteractions = () => {
    if (props.current === 'session') {
      return JSON.parse(localStorage.getItem('sessionInts')) || [];
    }
    else if (props.current === 'global') {
      return JSON.parse(localStorage.getItem('interactions')) || [];
    }
  }

  const saveInteractions = (interactions) => {
    if (props.current === 'session') {
      localStorage.setItem('sessionInts', JSON.stringify(interactions));
    }
    else if (props.current === 'global') {
      localStorage.setItem('interactions', JSON.stringify(interactions));
      props.setInts(interactions);
    }
  }



  return (
    <>
      {!showConAdd && (
        <InteractionList interactions={getInteractions()} setConfirmationModal={setConfirmationModal} setDeleteIndex={setDeleteIndex} />
      )}
      <div className="variable-add tester" onClick={() => setShowConAdd(true)} hidden={showConAdd}>
        <Plus className="icon plus" />
        ADD NEW INTERACTION
      </div>

      {showConAdd && (
        <InteractionForm interaction={interaction} handleTypeChange={handleTypeChange} handleSelect={handleSelect} setInteraction={setInteraction} addCon={addCon} setShowConAdd={setShowConAdd} gameVars={props.gameVars} shapes={props.shapes} />
      )}
      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={() => deleteCon(deleteIndex)}
        confirmMessage={"Yes"}
        message={"Are you sure you want to delete this interaction? This action cannot be undone."}
      />
    </>
  );
}

export default Interaction;
