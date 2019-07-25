// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import FolderList from './FolderList';

const nodeConsole = require('console');

const nConsole = new nodeConsole.Console(process.stdout, process.stderr);

const fs = require('fs');
const path = require('path');
const os = require('os');
const disk = require('diskusage');

const MB = 1000000.0;

const DEBUG = false;
function cLog(msg) {
  if (DEBUG) {
    nConsole.log(msg);
  }
}

class Home extends Component {
  static createStats(filePath) {
    return JSON.parse(JSON.stringify(fs.statSync(filePath)));
  }

  static addFileToMap(map, filePath, fileName) {
    cLog('[addFileToMap] start');
    let keys;
    if (filePath === '/') {
      keys = ['/'];
    } else {
      keys = filePath.split('/');
    }

    let dict = map;

    Object.values(dict).forEach(key => {
      const value = key === '' ? '/' : key;

      if (
        dict.has(value) &&
        value === keys[keys.length - 1] &&
        'files' in dict.get(value)
      ) {
        cLog(`[addFileToMap] adding ${fileName} to ${value} files`);
        dict.get('files').push(fileName);
      } else if (dict.has(value) && value === keys[keys.length - 1]) {
        cLog(
          `[addFileToMap] Creating new file list and adding ${fileName} to ${value}`
        );
        dict.get(value).set('files', [fileName]);
      } else if (dict.has(value)) {
        dict = dict.get(value);
      } else {
        dict.get(value).set('files', [fileName]);
      }
    });
  }

  static readDirIntoMap(map, dir) {
    const dirContents = fs.readdirSync(dir);

    Object.values(dirContents).forEach(file => {
      if (!file.startsWith('.')) {
        const dirPath = dir === '/' ? dir + file : `${dir}/${file}`;
        const stat = fs.statSync(dirPath);
        if (stat.isDirectory()) {
          cLog(`Directory: ${file}`);
          Home.addDirToMap(map, dirPath);
        } else if (stat.isFile()) {
          cLog(`File: ${file}`);
          Home.addFileToMap(map, dirPath, file);
        }

        const fileSizeInBytes = stat.size;
        const fileSizeInMegabytes = fileSizeInBytes / MB;
        console.log(fileSizeInMegabytes);
      }
    });
  }

  static addDirToMap(map, dirPath) {
    cLog('[addDirToMap] start');
    const keys = dirPath.split('/');

    let dict = map;

    Object.values(keys).forEach(key => {
      const value = key === '' ? '/' : key;

      if (dict.has(value)) {
        cLog(`[addDirToMap] getting dict ${value} in map`);
        dict = dict.get(value);
      } else {
        cLog(`[addDirToMap] adding ${value} to map ${dict}`);
        dict.set(
          value,
          new Map(
            Object.entries({ stats: Home.createStats(dirPath), path: dirPath })
          )
        );
      }
    });
  }

  state = {
    files: new Map()
  };

  componentDidMount() {
    const root =
      os.platform === 'win32' ? process.cwd().split(path.sep)[0] : '/';
    nConsole.log(
      `\n\n#################### STARTING ANALYZER ON "${root}" ####################`
    );
    disk.check(root, (err, info) => {
      nConsole.log('Total Space:', info.total / MB, 'MB');
      nConsole.log('Free Space:', info.free / MB, 'MB');
      nConsole.log('Available Space:', info.available / MB, 'MB');
    });
    const map = new Map();
    map.set(root, new Map());
    Home.readDirIntoMap(map, root);
    this.setState({ files: map });
  }

  render() {
    const { files } = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <h2>Folder Analyzer</h2>

        <FolderList files={files} />
      </div>
    );
  }
}

export default Home;
