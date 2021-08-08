import React, { useState  } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import Tabs from "../components/Tabs/Tabs"
import CreateCsv from "../components/CreateCsv/CreateCsv"

function Join(props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="dashboard">
          <h2 id="jointitle">Team Leadership Simulation 1</h2>
          <button onClick={() => setIsOpen(!isOpen)} className="studentbutton">Add Student/Participant List +</button>
          <img id="joinimg" src="temp1.png" />
          <button class="playbtn"><i class="fa fa-play"></i></button>
          <button class="pausebtn"><i class="fa fa-pause"></i></button>
          <button class="refreshbtn"><i class="fa fa-retweet"></i></button>
            <hr />
            { isOpen && <div>
              <img className="bimgjoin" src= "black.jpg" onClick={() => setIsOpen(!isOpen)} />
              <CreateCsv  />
            </div>}

            <Tabs />
    </div>
  );
}

export default withAuth0(Join);
