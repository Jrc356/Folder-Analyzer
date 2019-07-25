import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FolderItem from './FolderItem';

const nodeConsole = require('console');

const nConsole = new nodeConsole.Console(process.stdout, process.stderr);

class FolderList extends Component {
  parseMap(map: Map, file: string) {
    nConsole.log(file);
    let parsedItems = [];

    map.keys().forEach(key => {
      if (typeof map.get(key) === typeof new Map()) {
        parsedItems = parsedItems.concat(this.parseMap(map.get(key), key));
      } else {
        parsedItems.push(<FolderItem file={file} />);
      }
    });

    return parsedItems;
  }

  render() {
    const { files } = this.props;
    const items = [];
    Object.values(files).forEach(value => {
      items.concat(this.parseMap(files, value));
    });

    // nConsole.log(items);

    return items.forEach(item => item);
  }
}

FolderList.propTypes = {
  files: PropTypes.instanceOf(Map).isRequired
};

export default FolderList;
