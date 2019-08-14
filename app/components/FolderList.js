import React, { Component } from 'react';
import PropTypes from 'prop-types';

const { Console } = require('console');

const nConsole = new Console(process.stdout, process.stderr);

class FolderList extends Component {
  parseMap(map) {
    let parsedItems = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const key of map.keys()) {
      const value = map.get(key);
      if (!value.has('path')) {
        parsedItems = parsedItems.concat(this.parseMap(value));
      } else {
        parsedItems.push(<FolderItem key={key} path={value.get('path')} />);
      }
    }

    return parsedItems;
  }

  render() {
    const { files } = this.props;
    const items = this.parseMap(files);

    items.forEach(element => {
      nConsole.log(element.props.path);
    });

    if (items.length === 0) {
      return null;
    }

    return (
      <div>
        <ul>{items}</ul>
      </div>
    );
  }
}

const customPropTypes = {
  mapRequired(props, propName) {
    const m = props[propName];
    if (!m) {
      return new Error(`Required property ${propName} not supplied`);
    }
    if (!(m instanceof Map)) {
      return new Error('must be a Map');
    }
  }
};

FolderList.propTypes = {
  // eslint-disable-next-line react/require-default-props
  files: customPropTypes.mapRequired
};

const FolderItem = ({ path }) => <li>{path}</li>;

FolderItem.propTypes = {
  path: PropTypes.string.isRequired
};

export default FolderList;
