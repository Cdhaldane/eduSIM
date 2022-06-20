import React from "react";
import { withAuth0 } from "@auth0/auth0-react";

const Card_component = (props) => {

  return (
  <div className="card">
   <header className="card-header">
     <div className="hello">
       <img src={props.user.picture}  alt="" />
     <div className="heading-box">
       <h1>{props.user.name}</h1>
     <h3>{props.user.email}</h3>
     </div>
     </div>
     <div className="button-box">
       <a  style={props.btnStyle} className="follow-btn" href="#" ><i class={props.icon} onClick={props.follow}></i></a>
     </div>
   </header>
   <main className="card-main">
     <div className="activity">
       <i class="lni lni-users"></i>
       <span className="activity-name">Followers</span>
     <span className="index">{props.friends}</span>
     </div>
     <div className="activity">
       <i class="lni lni-timer"></i>
       <span className="activity-name">Activity</span>
     <span className="index">{localStorage.loginCount}</span>
     </div>
     <div className="activity" onClick={props.openSims}>
       <i class="lni lni-bookmark-alt"></i>
     <span className="activity-name">Simulations</span>
       <span className="index">146</span>
     </div>
   </main>
 </div>

);
}

class Profile extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      friends: 10,
      icon: 'lni lni-circle-plus',
      text: 'Follow',
      btnStyle: {
        borderRadius: '50%',
        color: 'limegreen',
        cursor: 'pointer'
      }
    }
  }

  follow(e){
    e.preventDefault()
    let currentIcon = this.state.icon
    let currentText = this.state.text
    let currentFriends = this.state.friends
    if (currentIcon === 'lni lni-circle-plus' && currentText === 'Follow')
      this.setState({friends: currentFriends + 1, icon: 'lni lni-cross-circle', text: 'Unfollow', btnStyle: {
        color: 'maroon', cursor: 'normal', animation: 'spin 200ms ease-in-out'
      }})
    else
      this.setState({friends: currentFriends - 1, icon: 'lni lni-circle-plus', text: 'Follow', btnStyle: {
        color: 'limegreen', cursor: 'pointer', animation: 'spinBack 200ms ease-in-out'
      }})
  }

  openSims(){
    console.log(2)
  }

  render(){
    const { user } = this.props.auth0;
    const { name, picture, email, logins_count } = user;
    return (
      <Card_component
        btnStyle={this.state.btnStyle}
        icon={this.state.icon}
        text={this.state.text}
        follow={this.follow.bind(this)}
        friends={this.state.friends}
        user={user}
        openSims={this.openSims}
      />
    )
  }
}

export default withAuth0(Profile);

{/* <img
  src={picture}
  alt="Profile"
  className="profilepic"
/>
<div className="profilename">
  <h1>{name}</h1>
  <h3 className="lead text-muted">{email}</h3>
</div>
</div>

<div className="profilename">
<h1>{name}</h1>
<h3 className="lead text-muted">{email}</h3>
</div> */}
