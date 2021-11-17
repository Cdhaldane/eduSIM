import React from "react";
import "./Loading.css";

const loadingImg = "https://samherbert.net/svg-loaders/svg-loaders/three-dots.svg";

class Loading extends React.Component {
  render() {
    return (
      <div className="spinner">
        <img src={loadingImg} alt="Loading..." />
      </div>
    );
  }
}

export default Loading;
