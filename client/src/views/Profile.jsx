import React, { useEffect, useState, useRef } from "react";
import { useAuth0, withAuth0 } from "@auth0/auth0-react";
import SimulationTable from "../components/Simulations/SimulationTable";
import Modal from "react-modal";
import axios from "axios";
import UserSearch from "../components/Simulations/UserSearch";
import Loading from "../components/Loading/Loading";
import { useAlertContext } from "../components/Alerts/AlertContext";
import { ColorExtractor } from 'react-color-extractor'
import Gravatar from "react-gravatar";
import "./Styles/Profile.css";
import { useLocation } from "react-router-dom";

import UsersIcon from "../../public/icons/users.svg";
import CirclePlus from "../../public/icons/circle-plus2.svg";
import CircleCross from "../../public/icons/cross-circle.svg";
import Stopwatch from "../../public/icons/stopwatch2.svg";
import Bookmark from "../../public/icons/bookmark.svg";

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
  const [imageSelected, setImageSelected] = useState("v1688854666/sunset_312-wallpaper-3440x1440_inuomb.jpg")
  const [colors, setColors] = useState([]);

  const name = colors[Math.floor(Math.random() * colors.length)]
  const border = colors[Math.floor(Math.random() * colors.length)]

  const path = useLocation()
  const adminid = path.pathname.split("/")[2];

  const handleColors = (colors) => {
    setColors(colors);
  };


  useEffect(() => {
    if(props.user.bannerpath === undefined || props.user.bannerpath === null) return
    setImageSelected(props?.user?.bannerpath)
  }, [props?.user?.bannerpath])

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
            bannerpath: result.info.public_id,
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
      {adminid === localStorage.adminid &&
        <button className="card-banner" onClick={() => openWidget()}
          style={{ 'background': colors[2] }}>
          Banner
        </button>}
      <UserSearch setUser={props.setUser} style={{ 'background': colors[2] }}></UserSearch>
      <header className="card-header">
        <div className="hello">
          {props.user.picture ? <img src={props.user.picture} alt="" /> : <Gravatar email={props.user.email} className="gravatar" />}
          <div className="heading-box">
            <h1 style={{ color: name, border: '2px solid ' + name }}>{props.user.name}</h1>
            <h3 style={{ color: colors[Math.floor(Math.random() * colors.length)] }}>{props.user.email}</h3>
          </div>
        </div>
        {adminid !== localStorage.adminid &&
          <div className="button-box">
            <div onClick={props.follow}>{props.icon === 'plus' ? <CirclePlus className={"follow-btn" + props.icon} /> : <CircleCross className={"follow-btn" + props.icon} />}</div>
          </div>}
      </header>
      <main className="card-main">
        <Activity border={border}>
          <UsersIcon />
          <span className="activity-name">Followers</span>
          <span className="index">{props.user.followers}</span>
        </Activity>
        <Activity border={border}>
          <Stopwatch />
          <span className="activity-name">Activity</span>
          <span className="index sepcial">{props.user.updatedAt?.split("T")[0]}</span>
        </Activity>
        <Activity border={border} onClick={props.openSims}>
          <Bookmark />
          <span className="activity-name">Simulations</span>
          <span className="index">{props.data && Object.keys(props.data).length}</span>
        </Activity>
      </main>
    </div>

  );
}

const Profile = ({ auth0 }) => {
  const [loading, setLoading] = useState(true);
  const [icon, setIcon] = useState('plus');
  const [text, setText] = useState('Follow');
  const [showTable, setShowTable] = useState(false);
  const [gamedata, getGamedata] = useState();

  const alertContext = useAlertContext();
  const path = useLocation()
  const adminid = path.pathname.split("/")[2];
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState()


  useEffect(() => {
    if (adminid)
      updateProfile('adminid', adminid)
  }, []);

  const updateProfile = (idType, id) => {
    axios.get(`${process.env.REACT_APP_API_ORIGIN}/api/adminaccounts/getProfile/${idType}/${id}`)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
        getAllGamedata();

        if (res.data.following.includes(localStorage.adminid)) {
          setIcon('cross');
          setText('Unfollow');
      
        } else {
          setIcon('plus');
          setText('Follow');
          
        }
      })
      .catch((error) => {
        setLoading(false); // Set loading to false even if there is an error
        setUsers([]); // Set users to an empty array if there is an error
        // Add any other fallback or error handling logic you need here
      });
  };


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
    if (icon === 'plus' && text === 'Follow') {
      let body = {
        email: user.email,
        followers: user.follers ? user.followers + 1 : 1,
        following: user.following ? [...user.following, localStorage.adminid] : [localStorage.adminid]
      }
      axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body)
        .then(response => {
          // Update the local state with the new download count
          const updatedUser = () => {
            return { ...user, followers: user.follers ? user.followers + 1 : 1 };
          };
          setUser(updatedUser);
        })
        .catch(error => {
          console.error('Error updating download count:', error);
        });
      setIcon('cross');
      setText('Unfollow');
 
    } else {
      let body = {
        email: user.email,
        followers: user.followers - 1,
        following: user.following.filter((id) => id !== localStorage.adminid)
      }
      axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body)
        .then(response => {
          // Update the local state with the new download count
          const updatedUser = () => {
            return { ...user, followers: user.followers - 1 };
          };
          setUser(updatedUser);
        })
        .catch(error => {
          console.error('Error updating download count:', error);
        });
      setIcon('plus');
      setText('Follow');
   
    }
  };

  const openSims = () => {
    setShowTable(!showTable)
  };

  if (loading) {
    return <><Loading /></>
  }

  return (
    <>
      <Card_component
        icon={icon}
        text={text}
        follow={follow}
        user={user}
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

// computer build
// cpu - ryzen 7 5800x $270
// gpu - rtx 3080 $800
// ram - 32gb 3400mhz $100
// mobo - b550 $150
// psu - 750w $100
// case - $100
// storage - 1tb nvme $100
// total - $1620
