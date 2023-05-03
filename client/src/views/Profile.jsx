
import React, { useEffect, useState } from "react";
import { User, withAuth0 } from "@auth0/auth0-react";
import SimulationTable from "../components/Simulations/SimulationTable";
import Modal from "react-modal";
import axios from "axios";
import UserSearch from "../components/Simulations/UserSearch";
import Button from "../components/Buttons/Button";
import Loading from "../components/Loading/Loading";

import "./Styles/Profile.css";

const Card_component = (props) => {
  const [imageSelected, setImageSelected] = useState("")

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
      <img className="card-background" src={"https://res.cloudinary.com/uottawaedusim/image/upload/" + imageSelected} />
      {props.user.adminid === localStorage.adminid && <button className="card-banner" onClick={() => openWidget()}>Banner</button>}
      <UserSearch setUser={props.setUser}/>
      <header className="card-header">
        <div className="hello">
          <img src={props.user.picture} alt="" />
          <div className="heading-box">
            <h1>{props.user.name}</h1>
            <h3>{props.user.email}</h3>
          </div>
        </div>
        {props.user.adminid !== localStorage.adminid &&
        <div className="button-box">
          <a style={props.btnStyle} className="follow-btn" href="#" ><i class={props.icon} onClick={props.follow}></i></a>
        </div>}
      </header>
      <main className="card-main">
        <div className="activity">
          <i class="lni lni-users"></i>
          <span className="activity-name">Followers</span>
          <span className="index">{props.user.followers}</span>
        </div>
        <div className="activity sepcial">
          <i class="lni lni-timer"></i>
          <span className="activity-name">Activity</span>
          <span className="index">{props.user.updatedAt?.split("T")[0]}</span>
        </div>
        <div className="activity" onClick={props.openSims}>
          <i class="lni lni-bookmark-alt"></i>
          <span className="activity-name">Simulations</span>
          <span className="index">{props.data && Object.keys(props.data).length}</span>
        </div>
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

  
  const { user } = auth0;
  const { name, picture, email, logins_count } = user;
  const [users, setUsers] = useState(user)

  useEffect(() => {
    getAllGamedata()
  }, [users]);

  useEffect(() => {
    updateProfile()
  },[]);

  const updateProfile = () => {
    try {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/getProfile/:email', {params: {email: email}})
        .then((res) => {
          console.log(res.data)
          setUsers(res.data)
          setLoading(false);
        })
    } catch (error) {
      console.error(error);
    }
  }

  const getAllGamedata = async (email, name) => {
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/getAdminbyEmail/:email/:name', {
      params: {
        email: users.email,
        name: users.name
      }
    }).then((res) => {
      const allData = res.data;
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstances/:id',
        {
          params: {
            id: allData.adminid
          }
        }).then((res) => {
          getGamedata(res.data);
        }).catch(error => {
          console.error(error);
        });
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
        followers: users.followers - 1
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

  if (loading){
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
        onRequestClose={() => {setShowTable(false), updateProfile()}}
        className="tablemodal"
        overlayClassName="tableoverlay"
        closeTimeoutMS={250}
        ariaHideApp={false}
      >
        <SimulationTable data={gamedata} user={user} />
      </Modal>
    </>
  );
};

export default withAuth0(Profile);
