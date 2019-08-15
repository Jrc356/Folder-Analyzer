// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import FolderList from './FolderList';

const { Console } = require('console');

const nConsole = new Console(process.stdout, process.stderr);

const fs = require('fs');
const path = require('path');
const os = require('os');
const disk = require('diskusage');

const MB = 1000000.0;

class Home extends Component {
  static createStats(filePath) {
    return JSON.parse(JSON.stringify(fs.statSync(filePath)));
  }

  static addFileToMap(map, filePath, fileName) {
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
        dict.get('files').push(fileName);
      } else if (dict.has(value) && value === keys[keys.length - 1]) {
        dict.get(value).set('files', [fileName]);
      } else if (dict.has(value)) {
        dict = dict.get(value);
      } else {
        dict.get(value).set('files', [fileName]);
      }
    });
  }

  static readDirIntoMap(map, dir) {
    let dirContents;
    try {
      dirContents = fs.readdirSync(dir);
    } catch (exp) {
      nConsole.log(exp);
      return;
    }

    Object.values(dirContents).forEach(file => {
      if (!file.startsWith('.')) {
        const dirPath = dir === '/' ? dir + file : `${dir}/${file}`;

        // TODO stat gives the size of folder itself and not the contents, need to recursive search
        // This is part of next phase anyway so will be implemented there
        let stat;
        try {
          stat = fs.statSync(dirPath);
        } catch (exp) {
          nConsole.log(exp);
          return;
        }

        if (stat.isDirectory()) {
          Home.addDirToMap(map, dirPath);
        } else if (stat.isFile()) {
          Home.addFileToMap(map, dirPath, file);
        }

        const fileSizeInBytes = stat.size;
        const fileSizeInMegabytes = fileSizeInBytes / MB;
        console.log(`${file} size: ${fileSizeInMegabytes} MB`);
      }
    });
  }

  static addDirToMap(map, dirPath) {
    const keys = dirPath.split('/');

    let dict = map;

    Object.values(keys).forEach(key => {
      const value = key === '' ? '/' : key;

      try {
        if (dict.has(value)) {
          dict = dict.get(value);
        } else {
          dict.set(
            value,
            new Map(
              Object.entries({
                stats: Home.createStats(dirPath),
                path: dirPath
              })
            )
          );
        }
      } catch (exp) {
        nConsole.log(exp);
      }
    });
  }

  constructor(props) {
    super(props);
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
    this.state = { files: map };
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
