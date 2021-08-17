import React, { useState  } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import Tabs from "../components/Tabs/Tabs"
import CreateCsv from "../components/CreateCsv/CreateCsv"
import {Link } from "react-router-dom";
import Modal from "react-modal";



function Join(props) {
  console.log(props)
  const [isOpen, setIsOpen] = useState(false)
  const [showNote, setShowNote] = useState(false)
  localStorage.setItem('gameid', props.location.gameinstance);

  function toggleModal(e) {
    e.preventDefault();
    setShowNote(!showNote);
  }

  return (
    <div className="dashboard">
          <h2 id="jointitle">Team Leadership Simulation 1</h2>
        <button onClick={() => setShowNote(!showNote)} className="studentbutton">Add Student/Participant List +</button>
          <img id="joinimg" src="temp1.png" />
          <Link to={{
              pathname:"/gamepage",
              img: props.location.img,
              title: props.location.title,
              gameinstance: props.location.gameinstance,
              adminid: props.location.adminid
            }}>
          <button class="playbtn"><i class="fa fa-play"></i></button>
          </Link>
          <button class="pausebtn"><i class="fa fa-pause"></i></button>
          <button class="refreshbtn"><i class="fa fa-retweet"></i></button>
            <hr />
            <Modal
              isOpen={showNote}
              onRequestClose={toggleModal}
              contentLabel="My dialog"
              className="createmodaltab"
              overlayClassName="myoverlaytab"
              closeTimeoutMS={500}
              >
              <CreateCsv isOpen={showNote} />
            </Modal>

            <Tabs
              gameid={props.location.gameinstance}
            />
    </div>
  );
}

export default withAuth0(Join);
