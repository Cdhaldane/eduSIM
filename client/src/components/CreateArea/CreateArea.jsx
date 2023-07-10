import React, { useState, useEffect, useRef, useCallback } from "react";
import Switch from "react-switch";
import axios from "axios";
import { useAlertContext } from "../Alerts/AlertContext";
import { useTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import "./CreateArea.css";

import Plus from "../../../public/icons/plus.svg";

const CreateArea = (props) => {
  const [note, setNote] = useState([]);
  const [img, setImg] = useState("https://res.cloudinary.com/uottawaedusim/image/upload/v1651267180/images/ujjtehlwjgsfqngxesnd.jpg");
  const [files, setFiles] = useState("");
  const [moreImages, setMoreImages] = useState(false);
  const [title, setTitle] = useState("");
  const [checked, setChecked] = useState(false);
  const [filename, setFilename] = useState("images/ujjtehlwjgsfqngxesnd");
  const [imageSelected, setImageSelected] = useState("images/ujjtehlwjgsfqngxesnd");
  const [copy, setCopy] = useState(0);
  const [prevImages] = useState(localStorage.getItem("images"));
  const [copiedParams, setCopiedParams] = useState();
  const [willUpload, setWillUpload] = useState(false);
  const [gameSelected, setGameSelected] = useState("blank");
  const [gameData, setData] = useState("");
  const { t } = useTranslation();
  const detailsArea = useRef();
  const imageArea = useRef();
  const fileInputRef = useRef();
  const alertContext = useAlertContext();

  

  const uploadImage = async (event) => {
    event.preventDefault();
    // Check if name is empty or a duplicate
    if (title.trim() === "") {
      alertContext.showAlert(t("alert.simNameRequired"), "warning");
      return;
    }
    if (props.gamedata.some(game => game.gameinstance_name === title.trim())) {
      alertContext.showAlert(t("alert.simAlreadyExists"), "warning");
      return;
    }
    event.preventDefault();
    if(localStorage.images == null || localStorage.images == "" ){
      var temp = []
      temp.push(imageSelected)
      localStorage.setItem("images", JSON.stringify(temp))
    } else {
      var temp = JSON.parse(localStorage.getItem("images"));
      temp.push(imageSelected)
      if(temp.length > 5){
        temp.shift();
      }
      localStorage.setItem("images", JSON.stringify(temp))
    }
    try {
      let data = {
        gameinstance_name: title,
        gameinstance_photo_path: imageSelected,
        game_parameters: gameData,
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
          axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/update/:id', body).catch(error => {
            console.error(error);
          });
        }).catch(error => {
          console.error(error);
        });
      } else {
        await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/createGameInstance', data).then((res) => {
          console.log(res)
          props.setOrder(res.data);
        }).catch(error => {
          console.error(error);
        })
      }
    } catch (error) {
      console.error(error);
    }
    props.close();
  };

  const uploadSim = useCallback((e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      setFiles(JSON.parse(e.target.result));
      const parsedJson = JSON.parse(e.target.result);
      setTitle(`${parsedJson.gameinstance_name} - copy`);
      setData(parsedJson.game_parameters);
      setImageSelected(parsedJson.gameinstance_photo_path);
    };
  }, []);

  const handleChange = useCallback((event) => {
    setTitle(event.target.value);
  }, []);

  const createSelectItems = useCallback(() => {
    let items = [<option value="">Select a previous simulation</option>];
    for (let i = 0; i <= props.gamedata.length - 1; i++) {
      items.push(
        <option value={i}>{props.gamedata[i].gameinstance_name}</option>
      );
    }
    return items;
  }, [props.gamedata]);

  const handleCopySim = useCallback((event) => {
    setCopy(0);
    setData(props.gamedata[event.target.value].game_parameters)
    setImg(props.gamedata[event.target.value].gameinstance_photo_path)
    setImageSelected(props.gamedata[event.target.value].gameinstance_photo_path)
    setTitle(props.gamedata[event.target.value].gameinstance_name + " - copy");
    setFilename(props.gamedata[event.target.value].gameinstance_photo_path);
    setCopiedParams(props.gamedata[event.target.value].game_parameters);
  }, [props.gamedata]);

  const openWidget = useCallback((event) => {
    var myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "uottawaedusim",
        uploadPreset: "bb8lewrh"
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setImageSelected(result.info.public_id);
          setImg(result.info.url);
          setWillUpload(true);
          myWidget.close();
        }
      }
    );
    myWidget.open();
  }, []);

  const handleGameSelection = (e) => {
    setGameSelected(e.target.value);
    setImageSelected('images/cep2wsc5zbjxifbf3acn.jpg');
    setTitle("Team Leadership Simulation")
  }

  return (
    <div className="area">
      <form ref={detailsArea} className="form-input">
      <p className="gradient-border modal-title">{t("modal.addNewSimulation")}</p>
        <div>
          {t("modal.chooseGame")}
          <select id="games" onChange={e => handleGameSelection(e)}>
            <option value="blank">Create a blank simulation</option>
            <option value="team-leadership">Team Leadership</option>
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
            maxLength="25"
          />
        </div>
        <div className="gradient-border">
          <div>
            {t("modal.chooseImage")}
            <i onClick={() => setMoreImages(!moreImages)}><Plus className="icon create-icon create-fix"/></i>
          </div>
          <div className="form-imgpreview">

            {img ? (
              <Image
                cloudName="uottawaedusim"
                publicId={imageSelected}
                alt={t("alt.sim")}
              />
            ) : (
              <Image
                cloudName="uottawaedusim"
                publicId={imageSelected}
                alt={t("alt.sim")}
              />
            )}
          </div>
        </div>
        <div className="button-container">
          <div className="button-col left-ca">
            <input type="file" onChange={uploadSim} />
            <button type="button" className="green" onClick={() => fileInputRef.current.click()}>
              {t("common.upload")}
            </button>
            <input onChange={uploadSim} multiple={false} ref={fileInputRef} type='file' hidden />
          </div>
          <div className="button-col right-ca">
            <button type="button" className="modal-button green" onClick={uploadImage}>
              {t("common.add")}
            </button>
            <button type="button" className="modal-button red" onClick={props.close}>
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </form>

      <form ref={imageArea} className={`form-imgs ${moreImages ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
        {prevImages && 
          <div>
            {JSON.parse(prevImages).map((image, index) => (
              <Image
                key={index}
                cloudName="uottawaedusim"
                publicId={image}
                onClick={() => {
                  setImageSelected(image);
                  setImg(image);
                }}
                alt={t("alt.sim")}
              />
            ))}
          </div>}
        <button type="button" className="modal-button green" onClick={openWidget}>
          {t("modal.imageFromFile")}
        </button>
      </form>

    </div>
  );
};

export default CreateArea;

