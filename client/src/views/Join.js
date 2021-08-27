import React, { useState  } from "react";
import { withAuth0 } from "@auth0/auth0-react";
import Tabs from "../components/Tabs/Tabs"
import CreateCsv from "../components/CreateCsv/CreateCsv"
import {Link } from "react-router-dom";
import Modal from "react-modal";
import {Image} from "cloudinary-react";



function Join(props) {
  console.log(props.location.gameinstance)
  const [isOpen, setIsOpen] = useState(false)
  const [showNote, setShowNote] = useState(false)


  if(props.location.gameinstance !== undefined){
    localStorage.setItem('gameid', props.location.gameinstance);
  }
  if(props.location.title !== undefined){
    localStorage.setItem('title', props.location.title);
  }
  if(props.location.img !== undefined){
    localStorage.setItem('img', props.location.img);
  }


  function toggleModal(e) {
    e.preventDefault();
    setShowNote(!showNote);
  }

  return (
    <div className="dashboard">
          <h2 id="jointitle">{localStorage.title}</h2>
        <button onClick={() => setShowNote(!showNote)} className="studentbutton">Add Student/Participant List +</button>
      <div class="joinimg">
      <Image id="joinimg" cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/" + localStorage.img}  alt="backdrop"/>
    </div>
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
              <CreateCsv gameid={localStorage.gameid} isOpen={showNote} />
            </Modal>

            <Tabs
              gameid={localStorage.gameid}
              title={props.location.title}
            />
    </div>
  );
}

export default withAuth0(Join);
