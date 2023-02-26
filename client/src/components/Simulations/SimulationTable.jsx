import React, { useState } from 'react';
import "./SimulationTable.css"
import { Image } from "cloudinary-react";
import axios from "axios";

const SimulationTable = ({ data }) => {
  const [simulations, setSimulations] = useState(data)
  const [likes, setLikes] = useState({});

  const handleLike = (id) => {
    setLikes({ ...likes, [id]: (likes[id] || 0) + 1 });
  };

  const handleDownload = (simulation, downloadCount) => {
    // Make a POST request to update the download count for the simulation
    console.log(simulation)
    let body = {
      id: simulation.gameinstanceid,
      downloads: downloadCount + 1
    }
    axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/update/:id', body)
      .then(response => {
        // Update the local state with the new download count
        const updatedSimulations = simulations.map(sims => {
          console.log(sims)
          if (sims.gameinstanceid === simulation.gameinstanceid) {
            return { ...sims, downloads: response.data.gameinstance.downloads };
          } else {
            return sims;
          }
        });
        console.log(updatedSimulations)
        setSimulations(updatedSimulations);
      })
      .catch(error => {
        console.error('Error updating download count:', error);
      });
  };
  


  return (
    <table>
      <thead>
        <tr>
          <th>Simulation Name</th>
          <th>Simulation Date</th>
          <th>Created By</th>
          <th>Number of Downloads</th>
          <th>Likes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {simulations.map((simulation) => (
          <tr key={simulation.id}>
            <td><Image
            cloudName="uottawaedusim"
            className="table-img"
            publicId={
              "https://res.cloudinary.com/uottawaedusim/image/upload/" + simulation.gameinstance_photo_path
            }
            />{simulation.gameinstance_name}</td>
            <td>{simulation.createdAt.split("T")[0]}</td>
            <td>{simulation.createdby_adminid}</td>
            <td>{simulation.downloads}</td>
            <td>{likes[simulation.id] || 0}</td>
            <td>
              <button className="like-button" onClick={() => handleLike(simulation.id)}>Like</button>
              <button className="download-button" onClick={() => handleDownload(simulation, simulation.downloads)}>Download</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimulationTable;