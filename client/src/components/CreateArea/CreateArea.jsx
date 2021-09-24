import React, { useState, useEffect, useRef } from "react";
import Switch from "react-switch";
import axios from "axios";
import { useAlertContext } from "../Alerts/AlertContext";
import { Image } from "cloudinary-react";
import "./CreateArea.css";

function CreateArea(props) {
  const [note, setNote] = useState([]);
  const [img, setImg] = useState("Demo.jpg");
  const [title, setTitle] = useState("");
  const [checked, setChecked] = useState(false);
  const [filename, setFilename] = useState("images/ujjtehlwjgsfqngxesnd");
  const [imageSelected, setImageSelected] = useState("");
  const [copy, setCopy] = useState(0);
  const [copiedParams, setCopiedParams] = useState();
  const [willUpload, setWillUpload] = useState(false);
  const detailsArea = new useRef();
  const imageArea = new useRef();

  const alertContext = useAlertContext();

  const handleClickOutside = e => {
    if (!(detailsArea.current.contains(e.target) || imageArea.current.contains(e.target))) {
      props.close();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const uploadImage = async event => {
    // Check if name is empty or a duplicate
    if (title.trim() === "") {
      alertContext.showAlert("A name is required for the simulation.", "warning");
      return;
    }
    if (props.gamedata.some(game => game.gameinstance_name === title.trim())) {
      alertContext.showAlert("A simulation with this name already exists. Please pick a new name.", "warning");
      return;
    }

    event.preventDefault();
    const formData = new FormData();
    formData.append("file", imageSelected);
    formData.append("folder", "images");
    formData.append("uploader", localStorage.adminid);
    try {
      let url = filename;
      if (willUpload) {
        let res = await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/image/upload', formData);
        url = res.data.public_id;
      }
      let data = {
        gameinstance_name: title,
        gameinstance_photo_path: url,
        game_parameters: 'value',
        createdby_adminid: localStorage.adminid,
        status: 'created'
      }
      if (copy === 1) {
        await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/createGameInstance', data).then((res) => {
          let body = {
            id: res.data.gameinstanceid,
            game_parameters: copiedParams,
            createdby_adminid: localStorage.adminid,
            invite_url: 'value'
          }
          axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/update/:id', body).then((res) => {
            console.log(res);
          }).catch(error => {
            console.log(error);
          });
        }).catch(error => {
          console.log(error);
        });
        props.onAdd(note);
      } else {
        await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/createGameInstance', data).catch(error => {
          console.log(error);
        });
        props.onAdd(note);
      }

      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  // Handles selection of img from file
  function onChange(event) {
    setImageSelected(event.target.files[0]);
    setImg(URL.createObjectURL(event.target.files[0]));
    setNote({
      title: title,
      img: URL.createObjectURL(event.target.files[0]),
    });
    setWillUpload(true);
  }

  // Handle input and adds title and img to notes array
  function handleChange(event) {
    setTitle(event.target.value);
  }

  // Handles showing of img overlay
  function handleImg(event) {
    event.preventDefault();
    setImg(!img)
  }

  function createSelectItems() {
    let items = [(<option value="">Select a previous sim</option>)];
    for (let i = 0; i <= props.gamedata.length - 1; i++) {
      // Here I will be creating my options dynamically based on
      items.push(<option value={i}>{props.gamedata[i].gameinstance_name}</option>);

      // What props are currently passed to the parent component
    }
    return items;
  }

  function handleCopySim(event) {
    // Setting copy to 1 so when we add we can also update the params to copiedParams
    setCopy(1);
    setTitle(props.gamedata[event.target.value].gameinstance_name);
    setFilename(props.gamedata[event.target.value].gameinstance_photo_path);
    setNote({
      title: props.gamedata[event.target.value].gameinstance_name,
      img: props.gamedata[event.target.value].gameinstance_photo_path,
    });
    setCopiedParams(props.gamedata[event.target.value].game_parameters);
  }

  return (
    <div className="area">
      <form ref={detailsArea} className="form-input">
        <p className="gradient-border modal-title">Add New Simulation</p>
        <div>
          Choose a game
          <select id="games">
            <option value="Team Leadership">Team Leadership</option>
            <option value="Project Management">Project Management</option>
            <option value="">...</option>
            <option value="blank">Create a blank simulation</option>
          </select>
        </div>
        {props.gamedata.length !== 0 && (
          <div className="gradient-border">
            Duplicate a previous simulation
            <label id="switch">
              <Switch
                onChange={() => setChecked(!checked)}
                checked={checked}
                className="react-switch"
              />
            </label>
          </div>
        )}
        {checked && (
          <div>
            Select a previous simulation
            <select id="prevgames" onChange={handleCopySim}>
              {createSelectItems()}
            </select>
          </div>
        )}
        <div className="gradient-border">
          Enter a ‎name‎‏‏‎ ‎
          <input
            tpye="text"
            id="namei"
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="                         "
          />
        </div>
        <div className="gradient-border">
          Choose an image
          <div className="form-imgpreview">
            <img id="plus" src="plus.png" alt="add" onClick={handleImg} />
            {img ? (
              <img id="preview" alt="preview" src={img} />
            ) : (
              <img id="previewno" alt="preview" src={img} />
            )}
          </div>
        </div>
        <button type="button" className="modal-bottomright-button" onClick={uploadImage}>
          Add
        </button>
      </form>
      {img && (
        <form ref={imageArea} className="form-imgs">
          {props.previewImages?.map((image) => (
            <Image
              cloudName="uottawaedusim"
              publicId={image.url}
              onClick={() => {
                setFilename(image.public_id);
                setImg(image.url);
                setWillUpload(false);
              }}
            />
          ))}
          <input type="file" name="img" id="file" onChange={onChange} />
          <label htmlFor="file" className="form-imgsubmit">
            From file
          </label>
        </form>
      )}
    </div>
  );
}

export default CreateArea;
