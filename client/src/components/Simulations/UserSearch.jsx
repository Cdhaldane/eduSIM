import React, { useState } from 'react';
import axios from 'axios';
import Profile from "../../views/Profile.jsx"
import "./SimulationTable.css"


function UserSearch(props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [userProfile, setUserProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const handleSearch = async () => {
      try {
        setLoading(true);
        axios.get(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/getProfile/:email', {params: {email: searchTerm}})
          .then((res) => {
            console.log(res.data)
            props.setUser(res.data)
            setLoading(false);
          })
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
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