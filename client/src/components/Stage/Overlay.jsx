import React, { Component } from "react";
import {
  Stage
} from "react-konva";

class Overlay extends Component {

  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
      loading: true
    }
  }
  

  componentDidMount = () => {
    let overlay = this.props.state.pages[this.props.state.level-1]?.overlays
    for(let i = 0; i < overlay.length; i++){
      if(overlay[i].id === this.props.state.overlayOpenIndex){
        this.setState({
          height: overlay[i].positionRect.h * overlay[i].positionRect.scaleY,
          width: overlay[i].positionRect.w * overlay[i].positionRect.scaleX,
        })
      }
    }
    for (let i = 0; i < Object.keys(this.refs).length; i++) {
      const key = Object.keys(this.refs)[i];
      this.props.setRefs(key, this.refs[key]);
    }

    if(!this.props.playMode){
      let meainElem = document.getElementById("overlayGameContainer");
      meainElem.style.backgroundImage = `repeating-linear-gradient(rgb(0, 0, 0, 0.1) 0 1px, transparent 1px 100%),
      repeating-linear-gradient(90deg, rgb(0, 0, 0, 0.1) 0 1px, transparent 1px 100%);`
    }
    this.setState({
      loading: false
    })
  }

  componentDidUpdate = () => {
    for (let i = 0; i < Object.keys(this.refs).length; i++) {
      const key = Object.keys(this.refs)[i];
      this.props.setRefs(key, this.refs[key]);
    }
 
  }

  handleClose = () => {
    let page = this.props.state.pages[this.props.state.level-1]
    if(page?.overlays[0].overlayOpenOption === "pageExit" && this.props.playMode){
      this.props.handleLevel(this.props.state.level+1)
    }
    this.props.closeOverlay();
  }

  render() {
    let stageHeight = 0;
    if (this.props.playMode && this.props.propsIn.canvasHeights.overlay) {
      stageHeight = this.props.propsIn.canvasHeights.overlay;
    } else if (document.getElementById("overlayGameContainer")) {
      stageHeight = document.getElementById("overlayGameContainer").clientHeight - 1;
    }
    console.log(this.props)
    return (
      <div className={`overlayMain`}>
        <div>
          <div className="area overlayCanvas">
            <i id="overlayCloseButton" className="fas fa-times fa-3x" onClick={this.handleClose} />
            {/* The Konva Stage */}
            <div
              {...(this.props.playMode ? {} :
                {
                  onKeyDown: this.props.onKeyDown,
                  onKeyUp: this.props.onKeyUp,
                  onContextMenu: (e) => e.preventDefault()
                }
              )}
              id="overlayGameContainer"
              
              style={{
                backgroundColor: this.props.state.pages[this.props.state.level - 1]?.overlayColor,
              }}
              className={this.props.playMode ? "playModeCanvasContainer" : ""}
              tabIndex="0"
              name="pasteContainer"
            >
              <Stage
                ref={"overlayStage"}
                height={this.props.playMode ? this.state.height * this.props.state.overlayLayerScale : stageHeight}
                width={this.props.playMode ? this.state.width * this.props.state.overlayLayerScale : document.getElementById("overlayGameContainer") ?
                document.getElementById("overlayGameContainer").clientWidth : 0}
                offsetX={this.props.playMode ? this.props.state.overlayCenterX : 0}
                offsetY={this.props.playMode ? this.props.state.overlayCenterY : 0}
                {...(this.props.playMode ? {} :
                  {
                    onMouseDown: (e) => this.props.onMouseDown(e, false),
                    onMouseUp: (e) => this.props.onMouseUp(e, false),
                    onMouseMove: (e) => this.props.onMouseMove(e, false),
                    onWheel: (e) => this.props.onWheel(e, false),
                    onContextMenu: (e) => e.evt.preventDefault(),
                    // Mobile Event Listeners
                    onTouchStart: (e) => this.props.onMouseDown(e, false),
                    onTouchEnd: (e) => this.props.onMouseUp(e, false),
                  }
                )}
              >
                {this.props.propsIn.loadObjects("overlay", this.props.playMode ? "play" : "edit", this.props.state.movingCanvas, this.props.canvasState)}
              </Stage>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Overlay;
