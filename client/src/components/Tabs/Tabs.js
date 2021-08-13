import React from "react";
import { useState, Fragment } from "react";
import "./Tabs.css";
import Button from "../Buttons/Button"
import Table from "../Table/Table"
import Modal from "../Modal/Modal"
import CreateEmail from "../CreateEmail/CreateEmail";
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function Tabs() {
  const [toggleState, setToggleState] = useState(1);
  const [radio, setRadio] = useState("Teacher")
  const [isOpen, setIsOpen] = useState(false)
  const [newGroup, setNewGroup] = useState("")

  const [tabs, setTabs] = useState([])

  const data = [{name: 'Page A', uv: 400, pv: 2400, amt: 2400},{name: 'Page B', uv: 500, pv: 2400, amt: 2400}];

  const toggleTab = (index) => {
    setToggleState(index);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setTabs([...tabs, newGroup])
  }
  const handleChange = (e) => {
    e.preventDefault();
    setNewGroup([e.target.value])
  }

  return (
    <div class="tabs">

      <ul class="selected-tab">
        <li onClick={() => toggleTab(1)} class={toggleState === 1 ? "selected" : ""}>Overview</li>
        {tabs.map((i) => (
          <li onClick={() => toggleTab(i)} class={toggleState === 2 ? "selected" : ""}>{i}</li>
        ))}
       <li onClick={() => toggleTab(0)} class={toggleState === 4 ? "selected" : ""}>Add group</li>
     </ul>


       <div className="content-tabs">
            <div
              className={toggleState === 1 ? "content  active-content" : "content"}
            >
              <h3>Settings:</h3>
              <button onClick={() => setIsOpen(!isOpen)} className="studentbuttonemail">Email Student/Participant</button>
              { isOpen && <div>
                <img className="bimgjoin" src= "black.jpg" onClick={() => setIsOpen(!isOpen)} />
              <CreateEmail  />
              </div>}
              <div class="simadv">
                <h3>Simulation advancement</h3>
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
              <h3>Student/participant list:</h3>


              {/* <Button onClick={()=>setIsOpen(true)} class="button">Add</Button>
              <Modal open={isOpen} onClose={()=>setIsOpen(false)}>
              </Modal> */}
              <Table addstudent={true}/>
            </div>
          {tabs.map((i) => (
            <div
              className={toggleState === i ? "content  active-content" : "content"}
            >
              <h2>{i}</h2>
              <hr />
            <div className="groupcontainer">
            <h3>Chat: </h3>

          <h3>Performance:</h3>
        <div id="chart">
          <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </div>
          <h3>Students / participants in room:</h3>
        <Table addstudent={true}/>

      </div>
            </div>
        ))}

            <div
              className={toggleState === 0 ? "content  active-content" : "content"}
            >
              <h2>Add Group!</h2>
              <hr />
              <p>
                Group name
              <input onChange={handleChange} type="text" class="textbox" placeholder="Group Name" id="code" />
              </p>
              <button className="addgroup" onClick={handleSubmit}>Add</button>

            </div>
          </div>
</div>

  );
}

export default Tabs;
