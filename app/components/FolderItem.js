import React, { Component } from 'react';
import PropTypes from 'prop-types';

// const nodeConsole = require('console');

// const nConsole = new nodeConsole.Console(process.stdout, process.stderr);

class FolderItem extends Component {
  render() {
    const { file } = this.props;
    return <p>{file}</p>;
  }
}

FolderItem.propTypes = {
  file: PropTypes.string.isRequired
};

export default FolderItem;
