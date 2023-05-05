
import React, { useEffect, useState, useRef } from "react";
import { useAuth0, withAuth0 } from "@auth0/auth0-react";
import SimulationTable from "../components/Simulations/SimulationTable";
import Modal from "react-modal";
import axios from "axios";
import UserSearch from "../components/Simulations/UserSearch";
import Loading from "../components/Loading/Loading";
import { useAlertContext } from "../components/Alerts/AlertContext";
import { ColorExtractor } from 'react-color-extractor'

import "./Styles/Profile.css";
import { useLocation } from "react-router-dom";

const Activity = ({ border, children, onClick }) => {
  const activityRef = useRef();

  const handleMouseEnter = () => {
    if (activityRef.current) {
      activityRef.current.style.backgroundColor = border;
    }
  };

  const handleMouseLeave = () => {
    if (activityRef.current) {
      activityRef.current.style.backgroundColor = '';
    }
  };

  return (
    <div
      ref={activityRef}
      className="activity"
      style={{
        border: `2px solid ${border}`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Card_component = (props) => {
  const [imageSelected, setImageSelected] = useState("")
  const [colors, setColors] = useState([]);

  const name = colors[Math.floor(Math.random() * colors.length)]
  const border = colors[Math.floor(Math.random() * colors.length)]

  const handleColors = (colors) => {
    setColors(colors);
    console.log(colors);
  };

  useEffect(() => {
    setImageSelected(props.user.bannerPath)
  }, [props])

  const openWidget = (event) => {
    var myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "uottawaedusim",
        uploadPreset: "bb8lewrh"
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setImageSelected(result.info.public_id);
          let body = {
            email: props.user.email,
            bannerPath: result.info.public_id,
          }
          axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body).then((res) => {
            console.log(res.data)
          })
          myWidget.close();
        }
      }
    );
    myWidget.open();
  }

  return (
    <div className="card">
      <ColorExtractor getColors={handleColors}>
        <img className="card-background" src={"https://res.cloudinary.com/uottawaedusim/image/upload/" + imageSelected} />
      </ColorExtractor>
      {props.user.adminid === localStorage.adminid &&
        <button className="card-banner" onClick={() => openWidget()}
          style={{ 'background': colors[2] }}>
          Banner
        </button>}
      <UserSearch setUser={props.setUser} style={{ 'background': colors[2] }}></UserSearch>
      <header className="card-header">
        <div className="hello">
          <img src={props.user.picture} alt="" />
          <div className="heading-box">
            <h1 style={{ color: name, border: '2px solid ' + name }}>{props.user.name}</h1>
            <h3 style={{ color: colors[Math.floor(Math.random() * colors.length)] }}>{props.user.email}</h3>
          </div>
        </div>
        {props.user.adminid !== localStorage.adminid &&
          <div className="button-box">
            <a style={props.btnStyle} className="follow-btn" href="#" ><i class={props.icon} onClick={props.follow}></i></a>
          </div>}
      </header>
      <main className="card-main">
        <Activity border={border}>
          <i className="lni lni-users"></i>
          <span className="activity-name">Followers</span>
          <span className="index">{props.user.followers}</span>
        </Activity>
        <Activity border={border}>
          <i className="lni lni-timer"></i>
          <span className="activity-name">Activity</span>
          <span className="index sepcial">{props.user.updatedAt?.split("T")[0]}</span>
        </Activity>
        <Activity border={border} onClick={props.openSims}>
          <i className="lni lni-bookmark-alt"></i>
          <span className="activity-name">Simulations</span>
          <span className="index">{props.data && Object.keys(props.data).length}</span>
        </Activity>
      </main>
    </div>

  );
}

const Profile = ({ auth0 }) => {
  const [loading, setLoading] = useState(true);
  const [icon, setIcon] = useState('lni lni-circle-plus');
  const [text, setText] = useState('Follow');
  const [showTable, setShowTable] = useState(false);
  const [gamedata, getGamedata] = useState();
  const [btnStyle, setBtnStyle] = useState({
    borderRadius: '50%',
    color: 'limegreen',
    cursor: 'pointer'
  });
  const alertContext = useAlertContext();
  const path = useLocation()
  const adminid = path.pathname.split("/")[2];
  const { user } = useAuth0();
  const [users, setUsers] = useState()


  useEffect(() => {
    updateProfile('adminid', adminid)
  }, []);

  const updateProfile = (idType, id) => {
    try {
      axios.get(`${process.env.REACT_APP_API_ORIGIN}/api/adminaccounts/getProfile/${idType}/${id}`)
        .then((res) => {
          console.log(res.data)
          setUsers(res.data)
          setLoading(false);
          getAllGamedata()
          if (res.data.following.includes(localStorage.adminid)) {
            console.log("already following")
            setIcon('lni lni-cross-circle');
            setText('Unfollow');
            setBtnStyle({
              color: 'maroon',
              cursor: 'normal',
              animation: 'spin 200ms ease-in-out'
            });
          } else {
            setIcon('lni lni-circle-plus');
            setText('Follow');
            setBtnStyle({
              color: 'limegreen',
              cursor: 'pointer',
              animation: 'spinBack 200ms ease-in-out'
            });
          }
        })
    } catch (error) {
      console.error(error);
    }
  }


  const getAllGamedata = async (email, name) => {
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstances/:id',
      {
        params: {
          id: adminid
        }
      }).then((res) => {
        getGamedata(res.data);
      }).catch(error => {
        console.error(error);
      });
  }

  const follow = (e) => {
    e.preventDefault();
    if (icon === 'lni lni-circle-plus' && text === 'Follow') {
      let body = {
        email: users.email,
        followers: users.followers + 1,
        following: [...users.following, localStorage.adminid]
      }
      axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body)
        .then(response => {
          // Update the local state with the new download count
          const updatedUser = () => {
            return { ...users, followers: response.data.adminaccount.followers };
          };
          setUsers(updatedUser);
        })
        .catch(error => {
          console.error('Error updating download count:', error);
        });
      setIcon('lni lni-cross-circle');
      setText('Unfollow');
      setBtnStyle({
        color: 'maroon',
        cursor: 'normal',
        animation: 'spin 200ms ease-in-out'
      });
    } else {
      let body = {
        email: users.email,
        followers: users.followers - 1,
        following: users.following.filter((id) => id !== localStorage.adminid)
      }
      axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body)
        .then(response => {
          // Update the local state with the new download count
          const updatedUser = () => {
            return { ...users, followers: response.data.adminaccount.followers };
          };
          setUsers(updatedUser);
        })
        .catch(error => {
          console.error('Error updating download count:', error);
        });
      setIcon('lni lni-circle-plus');
      setText('Follow');
      setBtnStyle({
        color: 'limegreen',
        cursor: 'pointer',
        animation: 'spinBack 200ms ease-in-out'
      });
    }
  };

  const openSims = () => {
    setShowTable(!showTable)
  };

  const setUser = (data) => {
    setUsers(data)
  }

  if (loading) {
    return <><Loading /></>
  }

  return (
    <>
      <Card_component
        btnStyle={btnStyle}
        icon={icon}
        text={text}
        follow={follow}
        user={users}
        openSims={openSims}
        setUser={(e) => setUser(e)}
        data={gamedata}
      />
      <Modal
        isOpen={showTable}
        onRequestClose={() => { setShowTable(false) }}
        className="tablemodal"
        overlayClassName="tableoverlay"
        closeTimeoutMS={250}
        ariaHideApp={false}
      >
        <SimulationTable data={gamedata} user={users} />
      </Modal>
    </>
  );
};

export default withAuth0(Profile);
