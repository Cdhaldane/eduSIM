import React from 'react';
import { render } from 'react-dom';
import _ from 'lodash';
import './ContextMenu.css';
import {
  ContextMenu,
  MenuItem,
  ContextMenuTrigger,
} from "react-contextmenu";

class El extends React.Component {
  render() {
    return (
      <ContextMenuTrigger
        id="some_unique_identifier"
        i={this.props.i}
        collect={p => p}
      >
        <div className='C'>
          {this.props.i}
        </div>
      </ContextMenuTrigger>
    );
  }
}

class ContextMenus extends React.Component {
  componentDidMount() {
  }
  handleClick = (e, data, target) => {
    console.log(e, data, target);
  }
  render() {
    return (
      <div className='A'>
        <ContextMenu id="some_unique_identifier">
          <MenuItem data={{d:"some_data"}} onClick={this.handleClick}>
            ContextMenu Item 1
        </MenuItem>
          <MenuItem data={{d:"some_data"}} onClick={this.handleClick}>
            ContextMenu Item 2
        </MenuItem>
          <MenuItem divider />
          <MenuItem data={{d:"some_data"}} onClick={this.handleClick}>
            ContextMenu Item 3
        </MenuItem>
        </ContextMenu>
      </div>
    );
  }
}

export default ContextMenus;
