import React from "react";
import { useState, Fragment } from "react";
import "./Tabs.css";
import Button from "../Buttons/Button"
import Table from "../Table/Table"
import Modal from "../Modal/Modal"
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core'
function Tabs() {
  const [toggleState, setToggleState] = useState(1);
  const [radio, setRadio] = useState("Teacher")
  const [isOpen, setIsOpen] = useState(false)

  const toggleTab = (index) => {
    setToggleState(index);
  };

  return (
    <div className="container">
      <div className="bloc-tabs">
        <button
          className={toggleState === 1 ? "tabs active-tabs" : "tabs"}
          onClick={() => toggleTab(1)}
        >
         Overview
        </button>
        <button
          className={toggleState === 2 ? "tabs active-tabs" : "tabs"}
          onClick={() => toggleTab(2)}
        >
          Group 1
        </button>
        <button
          className={toggleState === 3 ? "tabs active-tabs" : "tabs"}
          onClick={() => toggleTab(3)}
        >
          Group 2
        </button>
      </div>

      <div className="content-tabs">
        <div
          className={toggleState === 1 ? "content  active-content" : "content"}
        >
          <h3>Settings</h3>
          <div>

            Simulation advancement
        <div>
        <input type="radio" checked={radio=="Teacher"} value="Teacher" onChange={(e)=>{setRadio(e.target.value)}} /> Teacher/Facilitator
        </div>
        <div>
        <input type="radio" checked={radio=="Student"} value="Student" onChange={(e)=>{setRadio(e.target.value)}}/> Student/Participants
        </div>
        <div>
        <input type="radio" checked={radio=="Timed"} value="Timed"  onChange={(e)=>{setRadio(e.target.value)}}/> Timed
      </div>

          </div>
          <h3>Student/participant list</h3>
          {/* <Button onClick={()=>setIsOpen(true)} class="button">Add</Button>
          <Modal open={isOpen} onClose={()=>setIsOpen(false)}>
          </Modal> */}
          <Table />
        </div>

        <div
          className={toggleState === 2 ? "content  active-content" : "content"}
        >
          <h2>Content 2</h2>
          <hr />
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente
            voluptatum qui adipisci.
          </p>
        </div>

        <div
          className={toggleState === 3 ? "content  active-content" : "content"}
        >
          <h2>Content 3</h2>
          <hr />
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos sed
            nostrum rerum laudantium totam unde adipisci incidunt modi alias!
            Accusamus in quia odit aspernatur provident et ad vel distinctio
            recusandae totam quidem repudiandae omnis veritatis nostrum
            laboriosam architecto optio rem, dignissimos voluptatum beatae
            aperiam voluptatem atque. Beatae rerum dolores sunt.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Tabs;
