import React, { useState, useEffect } from "react";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import SimNote from "../components/SimNote/SimNote";
import CreateArea from "../components/CreateArea/CreateArea";
import Modal from "react-modal";
import axios from "axios";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import DraggableList from "react-draggable-lists";

const Dashboard = (props) => {
  const { user } = useAuth0();
  const [isLoading, setLoading] = useState(true);
  const [showNote, setShowNote] = useState(false);
  const [gamedata, getGamedata] = useState([  {
        gameinstance_name: 1,
        name: 'bill'
    },
    {
        id: 2,
        name: 'ted'
    }]);
  const [uploadedImages, setUploadedImages] = useState(null);
  const [deletionId, setDeletionId] = useState(null);
  const { t } = useTranslation();


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
            setLoading(false);
          }).catch(error => {
            console.log(error);
          });
      }).catch(error => {
        console.log(error);
      });
    }
    getAllGamedata();
  }, [user]);

  if (isLoading) {
   return <div className="App">Loading...</div>;
 }

  const addNote = (newgamedata) => {
    getGamedata((prevgamedata) => {
      return [...prevgamedata, newgamedata];
    });
  }

  const deleteNote = (id) => {
    getGamedata((prevgamedata) => {
      return prevgamedata.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  const toggleModal = () => {
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
        return t("admin.deleteSimConfirmExplanation", { name: gamedata[deletionId] ? gamedata[deletionId].gameinstance_name : "" });
      } else {
        return t("admin.revokeSimConfirmExplanation", { name: gamedata[deletionId] ? gamedata[deletionId].gameinstance_name : "" });
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
  const listItems = [
    {
        id: 1,
        name: 'bill'
    },
    {
        id: 2,
        name: 'ted'
    }
];

console.log(gamedata)
console.log(listItems)

  return (
    <div className="dashboard-wrapper">
    <div className="dashboard">
      <div className="page-margin">
        <button className="w-button auto" onClick={toggleModal}>
          {t("admin.addNewSimulation")}
        </button>
      </div>

      <div className="page-margin">
        <h2>{t("admin.mySimulations")}</h2>
        <div className="dashsim">
          <div>
           <DraggableList width={300} height={150} rowSize={1}>
             {gamedata.map((noteItem, index) => (
               <SimNote
                  key={index}
                  id={index}
                  gameid={noteItem.gameinstanceid}
                  img={noteItem.gameinstance_photo_path}
                  adminid={noteItem.createdby_adminid}
                  setConfirmationModal={setConfirmationModal}
                  title={noteItem.gameinstance_name}
                  superadmin={noteItem.createdby_adminid === localStorage.adminid}
               />
             ))}
           </DraggableList>
         </div>
        </div>
      </div>

      <Modal
        isOpen={showNote}
        hide={() => setShowNote(false)}
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
        confirmMessage={t("admin.deleteSimConfirm")}
        message={getConfirmMessage()}
      />
    </div>
    </div>
  );
}

export default withAuth0(Dashboard);
