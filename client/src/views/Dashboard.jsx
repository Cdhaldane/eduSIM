import React, { useState, useEffect, useRef } from "react";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import SimNote from "../components/SimNote/SimNote";
import CreateArea from "../components/CreateArea/CreateArea";
import Modal from "react-modal";
import axios from "axios";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
import { useTranslation } from "react-i18next";
import clamp from 'lodash-es/clamp'
import swap from 'lodash-move'
import { useDrag } from 'react-use-gesture'
import { useSprings, animated } from 'react-spring'


const Dashboard = (props) => {
  const { user } = useAuth0();
  const [isLoading, setLoading] = useState(true);
  const [showNote, setShowNote] = useState(false);
  const [gamedata, getGamedata] = useState();
  const [uploadedImages, setUploadedImages] = useState(null);
  const [updater, setUpdate] = useState(0)
  const [deletionId, setDeletionId] = useState(0);
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
          let allData = res.data;
          if(localStorage?.order?.length > 5)
            getGamedata(JSON.parse(localStorage.order));
          else
            getGamedata(allData);
          setLoading(false);
        }).catch(error => {
          console.error(error);
        });
    }).catch(error => {
      console.error(error);
    });
  }

  useEffect(() => {
    getAllGamedata()
    if(localStorage.getItem('order') === 'null')
      localStorage.removeItem('order')
  }, [localStorage.order]);

  useEffect(() => {

  }, [gamedata]);

  if (isLoading) {
    return <div className="App"></div>;
  }

  const deleteNote = (id) => {
    getGamedata((prevgamedata) => {
      return prevgamedata.filter((noteItem, index) => {
        return index !== id;
      });
    });
    getAllGamedata();
    localStorage.setItem("order", JSON.stringify(gamedata))
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
    return t("admin.deleteSimConfirmExplanation", { name: gamedata[deletionId] ? gamedata[deletionId].gameinstance_name : "" });
  }

  const confirmAction = () => {
    if (deletionId) {
      deleteNote(deletionId);
      var body = {
        id: deletionId
      }
      axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/delete/:id', body).then((res) => {
        var temp = JSON.parse(localStorage.getItem("order"));
        temp = temp.filter(function (item) {
          return item.gameinstanceid != res.data.gameinstance.gameinstanceid;
        });
        localStorage.setItem("order", JSON.stringify(temp))
      }).catch(error => {
        console.error(error);
      });
    }
  }


  function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  const fn = (order, active, originalIndex, curIndex, y) => (index) =>
    active && index === originalIndex
      ? { y: curIndex * 150 + y, scale: 1.1, zIndex: '1', shadow: 15, immediate: (n) => n === 'y' || n === 'zIndex' }
      : { y: order.indexOf(index) * 150, scale: 1, zIndex: '0', shadow: 1, immediate: false }

  function DraggableList({ items }) {
    const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order
    const [springs, setSprings] = useSprings(items.length, fn(order.current)) // Create springs, each corresponds to an item, controlling its transform, scale, etc.

    const bind = useDrag(({ args: [originalIndex], active, movement: [, y] }) => {
      const curIndex = order.current.indexOf(originalIndex)
      const curRow = clamp(Math.round((curIndex * 150 + y) / 150), 0, items.length - 1)
      const newOrder = swap(order.current, curIndex, curRow)
      setSprings(fn(newOrder, active, originalIndex, curIndex, y)) // Feed springs new style data, they'll animate the view without causing a single render
      if (!active) {
        order.current = newOrder
        arraymove(gamedata, curIndex, curRow)
        localStorage.setItem("order", JSON.stringify(gamedata))
      }
    })
    return (
      <div cancel=".notesim">
        {springs.map(({ zIndex, shadow, y, scale }, i) => (
          <animated.div

            {...bind(i)}
            key={i}
            style={{
              zIndex,
              boxShadow: shadow.to((s) => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
              y
            }}
          >
            <SimNote
              key={i}
              id={i}
              gameid={items[i].gameinstanceid}
              img={items[i].gameinstance_photo_path}
              adminid={items[i].createdby_adminid}
              setConfirmationModal={setConfirmationModal}
              title={items[i].gameinstance_name}
              superadmin={items[i].createdby_adminid === localStorage.adminid}
            />
          </animated.div>
        ))}
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper" style={{
      height: gamedata?.length * 190 + 250,
    }}>
    <div className="dashboard disable-dbl-tap-zoom">
      <div className="page-margin">
        <button className="w-button auto" onClick={toggleModal}>
          {t("admin.addNewSimulation")}
        </button>
      </div>
      <div className="page-margin">
        <h2>{t("admin.mySimulations")}</h2>
        <div className="dashsim" index={updater}>
              <DraggableList items={gamedata}/>
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
  </div>
  );
}

export default withAuth0(Dashboard);
