import React, { Component } from 'react';
import Level from "../Level/Level";
import Modal from "react-modal";
import CreateRole from "../CreateRoleSelection/CreateRole";
import styled from "styled-components";
import moment from "moment";
import { OrderedSet } from "immutable";
import Overlay from "./Overlay";
import { withTranslation } from "react-i18next";
import { Image } from "cloudinary-react";
import { throttle, debounce } from 'lodash';

import {
  EditorState,
  SelectionState,
  convertToRaw,
  convertFromRaw,
  Modifier
} from 'draft-js';

import {
  Stage
} from "react-konva";

import Layers from "../../../public/icons/layers.svg"
import Up from "../../../public/icons/chevron-up.svg"
import Down from "../../../public/icons/chevron-down.svg"

const EndScreen = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: #e5e5e5;
  top: 0;
  left: 0;
  z-index: 5;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: opacity .4s;
  ${(p) => !p.open && `
    opacity: 0;
    pointer-events: none;
  `}
  & > p {
    font-size: 3em;
  }
  & > button {
    align-self: center;
    font-family: inherit;
    padding: 10px 20px;
    font-size: 1em;
    color: white;
    background-color: var(--primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: none;
    text-align: center;
    cursor: pointer;
    border-radius: 10px;
    margin-top: 10px;
  }
`;

const CanvasGame = (props) => {
    const customObjects = ([...this.props.customObjects]);
    const savedObjects = ([...this.props.savedObjects, 'status', 'pages', 'overlayImage']);

    

    return (

    )
}