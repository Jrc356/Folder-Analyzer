import React, { Component } from 'react';
const nodeConsole = require('console');
const nConsole = new nodeConsole.Console(process.stdout, process.stderr);

export class FolderItem extends Component {
  render() {
    <p>{this.props.file}</p>;
  }
}

export default FolderItem;
