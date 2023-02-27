import React, { useState, useEffect } from 'react';
import "./SimulationTable.css"
import { Image } from "cloudinary-react";
import axios from "axios";
import { useAlertContext } from "../Alerts/AlertContext";

const SimulationTable = (props) => {
  console.log(props)
  const [simulations, setSimulations] = useState(props.data)
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const alertContext = useAlertContext();

  const handleAction = (simulation, type) => {
    let actionType = type === 'likes' ? 'likes' : 'downloads';

    if (actionType === 'likes' && (props.user.likedSims.includes(simulation.gameinstanceid))) {
      alertContext.showAlert("You have already liked this simulation!", "warning");
      return;
    }

    let body = {
      id: simulation.gameinstanceid,
      [actionType]: simulation[actionType] + 1
    }
    axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/update/:id', body)
      .then(response => {
        // Update the local state with the new action count
        if (actionType === 'downloads' && (props.user.downloadedSims.includes(simulation.gameinstanceid))) {
          return;
        }
        const updatedSimulations = simulations.map(sims => {
          if (sims.gameinstanceid === simulation.gameinstanceid) {
            return { ...sims, [actionType]: response.data.gameinstance[actionType] };
          } else {
            return sims;
          }
        });
        setSimulations(updatedSimulations);
      })
      .catch(error => {
        console.error('Error updating action count:', error);
      });
      if(actionType === 'downloads'){
        let downloadedSims = props.user.downloadedSims
        downloadedSims.push(simulation.gameinstanceid)
        let body = {
          email: props.user.email,
          downloadedSims: downloadedSims
        }
        axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body)

        const blob = new Blob([JSON.stringify(simulation.game_parameters)], { type: 'application/json' });
        const href =  URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = simulation.gameinstance_name + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      if(actionType === 'likes'){
        let likedSims = props.user.likedSims
        likedSims.push(simulation.gameinstanceid)
        let body = {
          email: props.user.email,
          likedSims: likedSims
        }
        axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body)
      }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const sortSimulations = (a, b) => {
    if (sortColumn === 'downloads') {
      return sortOrder === 'asc' ? a.downloads - b.downloads : b.downloads - a.downloads;
    } else if (sortColumn === 'likes') {
      return sortOrder === 'asc' ? a.likes - b.likes : b.likes - a.likes;
    } else {
      return 0;
    }
  };

  return (
    <div className="simtable-container">
      <table>
        <thead>
          <tr>
            <th>Simulation Name</th>
            <th>Simulation Date</th>
            <th>Created By</th>
            <th id="table-sort" onClick={() => handleSort('downloads')}>Number of Downloads {sortColumn === 'downloads' ? sortOrder === 'asc' ? '▲' : '▼' : ''}</th>
            <th id="table-sort" onClick={() => handleSort('likes')}>Likes {sortColumn === 'likes' ? sortOrder === 'asc' ? '▲' : '▼' : ''}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {simulations.sort(sortSimulations).map((simulation) => (
            <tr key={simulation.id}>
              <td><Image
              cloudName="uottawaedusim"
              className="table-img"
              publicId={
                "https://res.cloudinary.com/uottawaedusim/image/upload/" + simulation.gameinstance_photo_path
              }
              />{simulation.gameinstance_name}</td>
              <td>{simulation.createdAt.split("T")[0]}</td>
              <td>{props.user?.name}</td>
              <td>{simulation.downloads || 0} </td>
              <td>{simulation.likes || 0}</td>
              <td>
                <button className="like-button" onClick={() => handleAction(simulation, "likes")}>Like</button>
                <button className="download-button" onClick={() => handleAction(simulation, "downloads")}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimulationTable;