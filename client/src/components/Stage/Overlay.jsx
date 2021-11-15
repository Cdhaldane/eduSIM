import React, { Component } from "react";
import Modal from "react-modal";
import {
  Stage,
  Layer
} from "react-konva";

class Overlay extends Component {

  constructor(props) {
    super(props);

    this.setState = this.setState.bind(this);

    let objectState = {};
    let objectDeleteState = {};
    for (let i = 0; i < this.props.propsIn.savedObjects.length; i++) {
      objectState = {
        ...objectState,
        [this.props.propsIn.savedObjects[i]]: []
      }
      objectDeleteState = {
        ...objectDeleteState,
        [`${this.props.propsIn.savedObjects[i]}DeleteCount`]: 0
      }
    }

    this.state = {
      // Objects and Delete Counts
      ...objectState,
      ...objectDeleteState,

      // Right click menu
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,

      // An array of arrays containing grouped items
      savedGroups: [],

      // Transformer for custom objects
      // This manually gets updated to simulate a normal Konva transformer
      customRect: [
        {
          visible: true,
          x: 0,
          y: 0,
          id: "customRect",
          name: "customRect",
          ref: "customRect",
          opacity: 0,
        }
      ],

      // Context Menu
      selectedContextMenu: null,

      // The Text Editor (<textarea/>) & other text properties
      textX: 0,
      textY: 0,
      textEditVisible: false,
      text: "",
      currentTextRef: "",
      textareaWidth: 0,
      textareaHeight: 0,
      textareaInlineStyle: {
        display: "none"
      },
      textareaFill: null,
      textareaFontFamily: null,
      textareaFontSize: 10,
      textRotation: 0,
      shouldTextUpdate: true,
      selectedFont: null,

      // Image, Video, Audio, Document sources
      vidsrc: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm",
      imgsrc: 'https://cdn.hackernoon.com/hn-images/0*xMaFF2hSXpf_kIfG.jpg',
      audsrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3",
      docsrc: "",
      docimage: null,

      // Draw
      tool: 'pen', // eraser or pen
      isDrawing: false,
      drawMode: false,
      color: "black",
      drawStrokeWidth: 5,

      // Variables for calculating responsive sizing 
      // (for different screen sizes)
      layerX: 0,
      layerY: 0,
      layerScale: 1,
      layerDraggable: false,

      // Fill and Stroke
      colorf: "black",
      colors: "black",
      strokeWidth: 3.75,
      opacity: 1,
      lastFill: null,

      // The blue selection rectangle / click location
      // And info about the selection
      selection: {
        isDraggingShape: false,
        visible: false,
        x1: -100,
        y1: -100,
        x2: 0,
        y2: 0
      },
      selectedShapeName: "",
      groupSelection: [],

      // This is used to time the touch click on mobile devices to see if it was a right click
      touchTime: null,
      touchEvent: null,

      gamepieceStatus: {},

      connectors: [],
      gameroles: [],
      errMsg: "",
      arrowDraggable: false,
      newArrowRef: "",
      count: 0,
      newArrowDropped: false,
      newConnectorDropped: false,
      arrowEndX: 0,
      arrowEndY: 0,
      isTransforming: false,
      infolevel: false,
      rolelevel: "",
      tic: false,
      personalAreaOpen: 0, // 0 = closed, 1 = open
      state: false,
      saving: null,
      saved: [],
      roadmapId: null,
      alreadyCreated: false,
      publishing: false,
      isPasteDisabled: false,
      gameinstanceid: this.props.gameinstance,
      adminid: this.props.adminid,
      savedstates: [],
      savedStateLoaded: false,
    };
  }

  componentDidUpdate = () => {
    for (let i = 0; i < Object.keys(this.refs).length; i++) {
      const key = Object.keys(this.refs)[i];
      this.props.setRefs(key, this.refs[key]);
    }
  }

  render() {
    return (
      <div className="overlayMain">
        <div>
          <div className="area overlayCanvas">
            <i className="fas fa-times fa-3x" onClick={this.props.closeOverlay} />
            {/* The Konva Stage */}
            <div
              onKeyDown={this.props.onKeyDown}
              onKeyUp={this.props.onKeyUp}
              id="overlayCanvasContainer"
              tabIndex="0"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Stage
                ref={"overlayStage"}
                height={document.getElementById("overlayCanvasContainer") ?
                  document.getElementById("overlayCanvasContainer").clientHeight : 0}
                width={document.getElementById("overlayCanvasContainer") ?
                  document.getElementById("overlayCanvasContainer").clientWidth : 0}
                onMouseDown={(e) => this.props.onMouseDown(e, false)}
                onMouseUp={(e) => this.props.onMouseUp(e, false)}
                onMouseMove={(e) => this.props.onMouseMove(e, false)}
                onWheel={(e) => this.props.onWheel(e, false)}
                onContextMenu={(e) => e.evt.preventDefault()}
                // Mobile Event Listeners
                onTouchStart={(e) => this.props.onMouseDown(e, false)}
                onTouchEnd={(e) => this.props.onMouseUp(e, false)}
              >
                <Layer
                  ref={"overlayLayer"}
                  scaleX={this.props.state.overlayLayerScale}
                  scaleY={this.props.state.overlayLayerScale}
                  x={this.props.state.overlayLayerX}
                  y={this.props.state.overlayLayerY}
                  height={window.innerHeight}
                  width={window.innerWidth}
                  draggable={this.props.state.layerDraggable}
                  onDragMove={(e) => this.props.onDragMove(e, false)}
                >
                  {this.props.propsIn.loadObjects("overlay", "edit")}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Overlay;