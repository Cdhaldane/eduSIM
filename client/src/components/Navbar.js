import React, {Component} from "react";
import {MenuItems} from "./MenuItems";
import Button from "./Button.jsx"
import AuthenticationButton from "./AuthenticationButton"

class NavBar extends Component {
  state = { clicked: false}
  handleClick = () => {
    this.setState({clicked: !this.state.clicked})
  }
  render() {
    return (
      <nav className="NavbarItems">
        <h1 className="navbar-logo">uOttawa<img className="img" src="favicon.ico" ></img></h1>
        <div className="menu-icon" onClick={this.handleClick}>
        <i className={this.state.clicked ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
      <ul className={this.state.clicked ? "nav-menu active" : "nav-menu"}>
        {MenuItems.map((item,index) =>{
          return (
            <li key={index}>
              <a className={item.cName} href={item.url}>
                {item.title}
              </a>
            </li>
          )
        })}
      </ul>
      <AuthenticationButton />
      </nav>
    );
  }
}

export default NavBar;
