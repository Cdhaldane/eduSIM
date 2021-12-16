import React, { useState, useEffect, useRef } from "react";
import Switch from "react-switch";
import axios from "axios";
import { useAlertContext } from "../Alerts/AlertContext";
import { useTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import "./CreateArea.css";

const CreateArea = (props) => {
  const [note, setNote] = useState([]);
  const [img, setImg] = useState("Demo.jpg");
  const [moreImages, setMoreImages] = useState(false);
  const [title, setTitle] = useState("");
  const [checked, setChecked] = useState(false);
  const [filename, setFilename] = useState("images/ujjtehlwjgsfqngxesnd");
  const [imageSelected, setImageSelected] = useState("");
  const [copy, setCopy] = useState(0);
  const [copiedParams, setCopiedParams] = useState();
  const [willUpload, setWillUpload] = useState(false);
  const { t } = useTranslation();
  const detailsArea = new useRef();
  const imageArea = new useRef();

  const alertContext = useAlertContext();

  const handleClickOutside = e => {
    if (detailsArea.current &&
      !(detailsArea.current.contains(e.target) || imageArea.current.contains(e.target))) {
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
      alertContext.showAlert(t("alert.simNameRequired"), "warning");
      return;
    }
    if (props.gamedata.some(game => game.gameinstance_name === title.trim())) {
      alertContext.showAlert(t("alert.simAlreadyExists"), "warning");
      return;
    }
    if ((imageSelected.size / 1000000) > 10) {
      alertContext.showAlert(t("alert.imageTooLarge"), "warning");
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
        game_parameters: "",
        createdby_adminid: localStorage.adminid,
        status: 'created'
      }
      if (copy === 1) {
        await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/createGameInstance', data).then((res) => {
          let body = {
            id: res.data.gameinstanceid,
            game_parameters: copiedParams,
            createdby_adminid: localStorage.adminid,
            invite_url: ""
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
  const onChange = (event) => {
    setImageSelected(event.target.files[0]);
    setImg(URL.createObjectURL(event.target.files[0]));
    setNote({
      title: title,
      img: URL.createObjectURL(event.target.files[0]),
    });
    setWillUpload(true);
  }

  // Handle input and adds title and img to notes array
  const handleChange = (event) => {
    setTitle(event.target.value);
  }

  const createSelectItems = () => {
    let items = [(<option value="">Select a previous sim</option>)];
    for (let i = 0; i <= props.gamedata.length - 1; i++) {
      // Here I will be creating my options dynamically based on
      items.push(<option value={i}>{props.gamedata[i].gameinstance_name}</option>);

      // What props are currently passed to the parent component
    }
    return items;
  }

  const handleCopySim = (event) => {
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
        <p className="gradient-border modal-title">{t("modal.addNewSimulation")}</p>
        <div>
          {t("modal.chooseGame")}
          <select id="games">
            <option value="Team Leadership">Team Leadership</option>
            <option value="Project Management">Project Management</option>
            <option value="">...</option>
            <option value="blank">Create a blank simulation</option>
          </select>
        </div>
        {props.gamedata.length !== 0 && (
          <div className="gradient-border">
            {t("modal.duplicatePreviousSimulation")}
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
            {t("modal.selectPreviousSimulation")}
            <select id="prevgames" onChange={handleCopySim}>
              {createSelectItems()}
            </select>
          </div>
        )}
        <div className="gradient-border">
          {t("modal.enterName")}
          <input
            tpye="text"
            id="namei"
            name="title"
            onChange={handleChange}
            value={title}
            placeholder=""
          />
        </div>
        <div className="gradient-border">
          {t("modal.chooseImage")}
          <div className="form-imgpreview">
            <img id="plus" src="plus.png" alt="add" onClick={() => setMoreImages(!moreImages)} />
            {img ? (
              <img id="preview" alt="preview" src={img} />
            ) : (
              <img id="previewno" alt="preview" src={img} />
            )}
          </div>
        </div>
        <button type="button" className="modal-bottomright-button" onClick={uploadImage}>
          {t("common.add")}
        </button>
      </form>
      {moreImages && (
        <form ref={imageArea} className="form-imgs">
        {props.previewImages?.map((image, index) => (
            <Image
              key={index}
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
            {t("modal.imageFromFile")}
          </label>
        </form>
      )}
    </div>
  );
}

export default CreateArea;
