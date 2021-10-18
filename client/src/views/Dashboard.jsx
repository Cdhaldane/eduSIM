import React, { useState, useEffect } from "react";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import SimNote from "../components/SimNote/SimNote";
import CreateArea from "../components/CreateArea/CreateArea";
import Modal from "react-modal";
import axios from "axios";
import ConfirmationModal from "../components/Modal/ConfirmationModal";

function Dashboard(props) {
  const { user } = useAuth0();
  const [showNote, setShowNote] = useState(false);
  const [gamedata, getGamedata] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(null);
  const [deletionId, setDeletionId] = useState(null);

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const setConfirmationModal = (data, index) => {
    setConfirmationVisible(data);
    if (data) {
      setDeletionId(index);
    } else {
      setDeletionId(null);
    }
  }

  useEffect(() => {
    const getAllGamedata = async () => {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/getAdminbyEmail/:email/:name', {
        params: {
          email: user.email,
          name: user.name
        }
      }).then((res) => {
        const allData = res.data;
        localStorage.setItem('adminid', allData.adminid)
        axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstances/',
          {
            params: {
              id: allData.adminid
            }
          }).then((res) => {
            const allData = res.data;
            getGamedata(allData);
          }).catch(error => {
            console.log(error);
          });
      }).catch(error => {
        console.log(error);
      });
    }
    getAllGamedata();
  }, [user]);

  function addNote(newgamedata) {
    getGamedata((prevgamedata) => {
      return [...prevgamedata, newgamedata];
    });
  }

  function deleteNote(id) {
    getGamedata((prevgamedata) => {
      return prevgamedata.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  function toggleModal() {
    if (!uploadedImages) {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/image/getImagesFrom/' + localStorage.adminid).then((res) => {
        setUploadedImages(res.data.resources);
      });
    }
    setShowNote(!showNote);
  }

  const getConfirmMessage = () => {
    if (gamedata[deletionId]) {
      if (gamedata[deletionId].createdby_adminid === localStorage.adminid) {
        return `Are you sure you want to delete the ${gamedata[deletionId] ? gamedata[deletionId].gameinstance_name : ""} simulation? This action cannot be undone.`;
      } else {
        return `Are you sure you want your access to the ${gamedata[deletionId] ? gamedata[deletionId].gameinstance_name : ""} simulation revoked? This action cannot be undone.`;
      }
    }
  }

  const confirmAction = () => {
    if (gamedata[deletionId]) {
      if (gamedata[deletionId].createdby_adminid === localStorage.adminid) {
        deleteNote(deletionId);

        var body = {
          id: gamedata[deletionId].gameinstanceid
        }

        axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/delete/:id', body).catch(error => {
          console.error(error);
        });
      } else {
        deleteNote(deletionId);

        axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/revokeGameInstanceAccess', {
          gameinstanceid: gamedata[deletionId].gameinstanceid,
          adminid: localStorage.adminid
        }).catch(error => {
          console.error(error);
        });
      }
    }
  }

  return (
    <div className="dashboard">

      <div className="page-margin">
        <button className="addbutton" onClick={toggleModal}>
          Add a new simulation +
        </button>
      </div>

      <hr />

      <div className="page-margin">
        <h2>My simulations</h2>
        <div className="dashsim">
          {gamedata.map((noteItem, index) => {
            return (
              <div key={index}>
                <SimNote
                  id={index}
                  gameid={noteItem.gameinstanceid}
                  img={noteItem.gameinstance_photo_path}
                  adminid={noteItem.createdby_adminid}
                  setConfirmationModal={setConfirmationModal}
                  title={noteItem.gameinstance_name}
                  superadmin={noteItem.createdby_adminid === localStorage.adminid}
                />
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={showNote}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="createmodalarea"
        overlayClassName="myoverlay"
        closeTimeoutMS={250}
        ariaHideApp={false}
      >
        <CreateArea 
          onAdd={addNote} 
          onDelete={() => setShowNote(!showNote)} 
          gamedata={gamedata} 
          isOpen={showNote} 
          close={toggleModal} 
          previewImages={uploadedImages}
        />
      </Modal>

      <ConfirmationModal
        visible={confirmationVisible}
        hide={() => setConfirmationModal(false)}
        confirmFunction={confirmAction}
        confirmMessage={"Yes - Delete Simulation"}
        message={getConfirmMessage()}
      />
    </div>
  );
}

export default withAuth0(Dashboard);
