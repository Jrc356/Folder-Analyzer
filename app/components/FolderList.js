import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FolderItem from './FolderItem';

const nodeConsole = require('console');

const nConsole = new nodeConsole.Console(process.stdout, process.stderr);

class FolderList extends Component {
  parseMap(map, file) {
    nConsole.log(file);
    nConsole.log(map);
    const parsedItems = [];

    for (const key in map.keys()) {
      if (typeof map.get(key) === typeof new Map()) {
        parsedItems = parsedItems.concat(this.parseMap(map.get(key), key));
      } else {
        parsedItems.push(<FolderItem file={file} />);
      }
    }

    return parsedItems;
  }

  render() {
    const { files } = this.props;

    const items = [];
    for (const key of Object.keys(files)) {
      items.push(this.parseMap(files, key));
    }

    nConsole.log(items);

    // const keys = Object.keys(items);
    // for(const key in keys){
    //     nConsole.log(items[key]);
    // }

    return items.map(item => item);
  }
}

export default FolderList;
