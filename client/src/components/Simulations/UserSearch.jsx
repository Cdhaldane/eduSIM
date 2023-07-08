import React, { useState } from 'react';
import axios from 'axios';
import Profile from "../../views/Profile.jsx"
import "./SimulationTable.css"
import { useAlertContext } from "../Alerts/AlertContext";
import { set } from 'immutable';


function UserSearch(props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfiles] = useState([]);
  const alertContext = useAlertContext();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_ORIGIN}/api/adminaccounts/getProfile/email/${searchTerm}`)
      .then((res) => {
        console.log(res.data);
        props.setUser(res.data)
        setLoading(false);
      }).catch(error => {
        console.error(error);
        alertContext.showAlert(`No user found with email ${searchTerm}.`, "error");
        setLoading(false);
      });
      setSearchTerm('');
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="usersearch-container">
      <div className="input-container">
        <input type="text" value={searchTerm} onChange={handleInputChange} placeholder="Users' Email" />
        <button style={props.style} onClick={handleSearch}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
    </div>
  );
}

export default UserSearch;