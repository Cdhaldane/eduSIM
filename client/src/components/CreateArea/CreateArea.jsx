import React, { useState, useEffect, useRef } from "react";
import Switch from "react-switch";
import axios from "axios";
import { useAlertContext } from "../Alerts/AlertContext";
import { useTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import "./CreateArea.css";

import Plus from "../../../public/icons/plus.svg"

const CreateArea = (props) => {
  const [note, setNote] = useState([]);
  const [img, setImg] = useState("https://res.cloudinary.com/uottawaedusim/image/upload/v1630036729/images/ujjtehlwjgsfqngxesnd.jpg");
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
  const [gameData, setData] = useState("");
  const { t } = useTranslation();
  const detailsArea = new useRef();
  const imageArea = new useRef();
  const fileInputRef= new useRef();
  const alertContext = useAlertContext();
  const handleClickOutside = e => {
    if (detailsArea.current &&
      !(detailsArea.current.contains(e.target) || (imageArea.current && imageArea.current.contains(e.target)))) {
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
        props.onAdd();
      } else {
        await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/createGameInstance', data).then((res) => {

          if(gameData) {
            let roles = JSON.parse(gameData).roles
            for(let i = 0; i < roles.length; i++){
              console.log(roles[i])
              let data = {
                gameinstanceid: res.data.gameinstanceid,
                gamerole: roles[i].gamerole,
                numspots: roles[i].numspots,
                roleDesc: roles[i].roleDesc,
              };
              axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/createRole', data).then((res) => {
                console.log(res)
              }).catch(error => {
                console.error(error);
              });
            }
          }
          var temp = JSON.parse(localStorage.getItem("order"));
          temp.unshift(res.data)
          localStorage.setItem("order", JSON.stringify(temp))
          props.onAdd();
        }).catch(error => {
          console.error(error);
        })
      }
    } catch (error) {
      console.error(error);
    }
    props.close();
  };

  const uploadSim = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      setFiles(JSON.parse(e.target.result));
      let parsedJson = (JSON.parse(e.target.result).data);
      parsedJson.createdby_adminid = localStorage.adminid;
      setTitle(parsedJson.gameinstance_name + " - copy");
      setData(parsedJson.game_parameters)
      setImageSelected(parsedJson.gameinstance_photo_path);
    };


  }
  const handleSimUpload = (e) => {
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/createGameInstance', JSON.parse(e));
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
    setCopy(1);
    setTitle(props.gamedata[event.target.value].gameinstance_name + " - copy");
    setFilename(props.gamedata[event.target.value].gameinstance_photo_path);
    setCopiedParams(props.gamedata[event.target.value].game_parameters);
  }

  const openWidget = (event) => {
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
  }

  return (
    <div className="area">
      <form ref={detailsArea} className="form-input">
        <p className="gradient-border modal-title">{t("modal.addNewSimulation")}</p>
        <div>
          {t("modal.chooseGame")}
          <select id="games">
            <option value="Team Leadership">Team Leadership</option>
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
            maxLength="13"
          />
        </div>
        <div className="gradient-border">
          <div>
            {t("modal.chooseImage")}
            <i onClick={() => setMoreImages(!moreImages)} ><Plus className="icon create-icon"/></i>
          </div>
          <div className="form-imgpreview">

            {img ? (
              <Image
                id="preview"
                cloudName="uottawaedusim"
                publicId={imageSelected}
                alt={t("alt.sim")}
              />
            ) : (
              <Image
                id="nopreview"
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
            <button type="button" className="green left-ca" onClick={uploadImage}>
              {t("common.add")}
            </button>
            <button type="button" className="red" onClick={props.close}>
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </form>
      {moreImages && (
        <form ref={imageArea} className="form-imgs">
        {prevImages ? (
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
          </div>
        ) : (
          <div></div>
        )}
          <button type="button" className="modal-button green form-imgsubmit" onClick={openWidget}>
            {t("modal.imageFromFile")}
          </button>

        </form>
      )}
    </div>
  );
}

export default CreateArea;
