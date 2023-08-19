import React, { useState, useEffect, useRef, useMemo } from "react";
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
import SimulationTable from "../components/Simulations/SimulationTable";
import Loading from "../components/Loading/Loading";

import { supabase } from "../components/Supabase.js";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

import "./Styles/Dashboard.css";
import { use } from "i18next";


const Dashboard = (props) => {
  // const { user } = useAuth0();
  const [isLoading, setLoading] = useState(true);
  const [showNote, setShowNote] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [gamedata, getGamedata] = useState();
  const [fulldata, getFullGamedata] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(null);
  const [updater, setUpdate] = useState(0)
  const [deletionId, setDeletionId] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [users, setUsers] = useState();
  const { t } = useTranslation();
  const [height, setHeight] = useState(1000);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [adminid, setAdminid] = useState(null);
  const [adminEmail, setAdminEmail] = useState(null);

  const memoizedGamedata = useMemo(() => gamedata, [gamedata]);


  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      let tempUser = session?.user ?? null;
      if (session) {
        axios.get(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/getAdminbyEmail/:email/:name', {
          params: {
            email: tempUser.email,
            name: tempUser.user_metadata.name,
          }
        }).then((res) => {
          const allData = res.data;
          localStorage.setItem('adminid', allData.adminid);
          localStorage.setItem('adminEmail', allData.email);
          setUsers(allData)
          setAdminid(allData.adminid);
          setAdminEmail(allData.email);
          let body = {
            email: tempUser.email,
            picture: tempUser.user_metadata.picture,
          }
          axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body)
          getAllGamedata(allData.adminid)

        }).then(res => { }).catch(error => {
          console.error(error);
        });
      } else {
        setShowAuth(true)
      }
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) props.show();
    })
  }, [])



  const setConfirmationModal = (data, index) => {
    setConfirmationVisible(data);
    if (data) {
      setDeletionId(index);
    } else {
      setDeletionId(null);
    }
  }
  const getAllGamedata = async (id) => {
    let adminid = localStorage.getItem('adminid');
    if (id) adminid = id;
    try {
      if (!adminid) return;
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstances/:id', {
        params: {
          id: adminid
        }
      }).then((res) => {
        const allData2 = res.data;
        setOrder(allData2)
        setHeight(allData2.length * 150);
        setLoading(false)

      }).catch(error => {
        console.error(error);
      });
    } catch (error) {
      console.error(error);
    }
  }

  const setOrder = (data) => {
    // set gamedata to be in order of localStorage.order

    if (localStorage.order && data) {
      let order = JSON.parse(localStorage.order);
      if (order.length !== data.length) {
        getGamedata(data);
        localStorage.setItem('order', JSON.stringify(data));
        return;
      };
      order.map((item, index) => {
        if (item === null) localStorage.removeItem('order');
      })

      console.log(gamedata, order)
      getGamedata(order);
    } else {
      getGamedata(data);
      localStorage.setItem('order', JSON.stringify(data));
    }
  }


  useEffect(() => {
    const getAllGameInstances = async () => {
      try {
        const gameInstancesResponse = await axios.get(`${process.env.REACT_APP_API_ORIGIN}/api/gameinstances/getAllGameInstances`);
        const gameInstancesData = gameInstancesResponse.data;
        // Process the game instances data as needed
        getFullGamedata(gameInstancesData);
      } catch (error) {
        console.error(error);
      }
    };
    getAllGameInstances();

  }, [user]);


  const toggleModal = () => {
    if (!uploadedImages) {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/image/getImagesFrom/' + localStorage.adminid).then((res) => {
        setUploadedImages(res.data.resources);
      });
    }
    // throw new Error('I crashed!');

    setShowNote(!showNote);
  }

  const getConfirmMessage = () => {
    return t("admin.deleteSimConfirmExplanation", { name: gamedata && gamedata[deletionId] ? gamedata[deletionId].gameinstance_name : "" });
  }

  const confirmAction = () => {
    if (deletionId) {
      let body = {
        id: deletionId
      }
      axios.put(`${process.env.REACT_APP_API_ORIGIN}/api/gameinstances/delete/${deletionId}`, body)
    }
    console.log(deletionId, gamedata)
    let out = []
    gamedata.forEach((item) => {
      if (item.gameinstanceid !== deletionId) {
        out.push(item)
      }
    });
    localStorage.setItem('order', JSON.stringify(out));

    getGamedata(out);
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
              gameid={memoizedGamedata[i].gameinstanceid}
              img={memoizedGamedata[i].gameinstance_photo_path}
              adminid={memoizedGamedata[i].createdby_adminid}
              setConfirmationModal={setConfirmationModal}
              title={memoizedGamedata[i].gameinstance_name}
              superadmin={memoizedGamedata[i].createdby_adminid === localStorage.adminid}
              date={memoizedGamedata[i].updatedAt}
              data={memoizedGamedata[i].game_parameters}
              updater={updater}
            />

          </animated.div>
        ))}
      </div>
    )
  }
  if (isLoading) {
    return <div className="App"><Loading /></div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard disable-dbl-tap-zoom">
        <div className="page-margin dashboard-buttons">
          <button className="d-button" onClick={toggleModal}>
            {t("admin.addNewSimulation")}
          </button>
          <button className="d-button" onClick={() => setShowTable(!showTable)}>
            User created simulations
          </button>
        </div>
        <div className="page-margin">
          <h2>{t("admin.mySimulations")}</h2>
          <div className="dashsim" index={updater} style={{ height: height }}>
            <DraggableList items={memoizedGamedata ? memoizedGamedata : []} />
          </div>
          <Modal
            isOpen={showNote}
            onRequestClose={() => setShowNote(false)}
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
              setOrder={setOrder}
            />
          </Modal>

          <Modal
            isOpen={showTable}
            onRequestClose={() => setShowTable(false)}
            className="tablemodal"
            overlayClassName="tableoverlay"
            closeTimeoutMS={250}
            ariaHideApp={false}
          >
            <SimulationTable data={fulldata} user={users} />
          </Modal>
          <Modal
            isOpen={showAuth}
            className="dashboard-login"
            overlayClassName="tableoverlay"
            onRequestClose={() => setShowAuth(false)}
            closeTimeoutMS={250}
            ariaHideApp={false}
          >
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="dark"
              providers={['google', 'azure']}
              redirectTo={`${location.origin}/dashboard`}
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

export default (Dashboard);
