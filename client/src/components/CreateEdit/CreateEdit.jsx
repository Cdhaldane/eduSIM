import React, { useState, useRef, useEffect } from "react";
import { parse } from "papaparse"
import "./CreateEdit.css";
import { useAlertContext } from "../Alerts/AlertContext";
import { useTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import axios from 'axios';

import Plus from "../../../public/icons/plus.svg"

const CreateEdit = (props) => {
  const [file, setFile] = useState('');
  const [result, setResult] = useState('');
  const form = useRef();
  const alertContext = useAlertContext();
  const { t } = useTranslation();
  const [note, setNote] = useState([]);
  const [img, setImg] = useState("https://res.cloudinary.com/uottawaedusim/image/upload/v1630036729/images/ujjtehlwjgsfqngxesnd.jpg");
  const [files, setFiles] = useState("");
  const [moreImages, setMoreImages] = useState(false);
  const [title, setTitle] = useState(localStorage.title);
  const [checked, setChecked] = useState(false);
  const [filename, setFilename] = useState("images/ujjtehlwjgsfqngxesnd");
  const [imageSelected, setImageSelected] = useState(localStorage.img);
  const [copy, setCopy] = useState(0);
  const [copiedParams, setCopiedParams] = useState();
  const [willUpload, setWillUpload] = useState(false);
  const detailsArea = new useRef();
  const imageArea = new useRef();
  const fileInputRef = new useRef();



  const handleChange = (event) => {
    console.log(event)
    setTitle(event.target.value);
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
          localStorage.setItem("img", result.info.public_id)
          myWidget.close();
        }
      }
    );
    myWidget.open();
  }

  const uploadImage = async event => {
    // Check if name is empty or a duplicate
    let data = JSON.parse(localStorage.order)
    if (title.trim() === "") {
      alertContext.showAlert(t("alert.simNameRequired"), "warning");
      return;
    }
    if (data.some(game => game.gameinstance_name === title.trim())) {
      alertContext.showAlert(t("alert.simAlreadyExists"), "warning");
      return;
    }
    event.preventDefault();
    if (localStorage.images == null || localStorage.images == "") {
      var temp = []
      temp.push(imageSelected)
      localStorage.setItem("images", JSON.stringify(temp))
    } else {
      var temp = JSON.parse(localStorage.getItem("images"));
      temp.push(imageSelected)
      if (temp.length > 5) {
        temp.shift();
      }
      localStorage.setItem("images", JSON.stringify(temp))
    }
    let body = {
      id: props.gameid,
      createdby_adminid: localStorage.adminid,
      gameinstance_name: title,
      gameinstance_photo_path: imageSelected
    }
    axios.put(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/update/:id', body).then((res) => {
    })
    var temp = JSON.parse(localStorage.getItem("order"));
    for (let i = 0; i < JSON.parse(localStorage.order).length; i++) {
      if (temp[i].gameinstance_name == localStorage.title) {
        temp[i].gameinstance_name = title;
      }
      if (temp[i].gameinstance_photo_path == localStorage.img) {
        temp[i].gameinstance_photo_path = imageSelected;
      }
    }
    localStorage.setItem("order", JSON.stringify(temp));
    props.updateImg(imageSelected);
    props.updateTitle(title);
    props.close();
  };


  return (
    <div className="area">
      <form ref={detailsArea} className="form-input">
        <p className="gradient-border modal-title">{t("common.edit")} {localStorage.title}</p>
        <div className="gradient-border">
          {t("modal.enterName")}
          <input
            tpye="text"
            id="namei"
            name="title"
            onChange={(e) => handleChange(e)}
            value={title}
            placeholder={localStorage.title}

          />
        </div>
        <div className="gradient-border">
          <div className="create-edit-icon">
            {t("modal.chooseImage")}
            <Plus className="icon" onClick={() => setMoreImages(!moreImages)} />
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

          <button type="button" className="green left-ca top" onClick={uploadImage}>
            {t("common.save")}
          </button>
          <button type="button" className="red top" onClick={props.close}>
            {t("common.cancel")}
          </button>

        </div>
      </form>
      {moreImages && (
        <div className="create-edit-images">
          <form ref={imageArea} >
            {JSON.parse(localStorage.images).map((image, index) => (
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
            
          </form>
          <button type="button" className="modal-button green form-imgsubmit" onClick={openWidget}>
              {t("modal.imageFromFile")}
            </button>
        </div>
      )}
    </div>
  );
}
export default CreateEdit;
