// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import FolderList from './FolderList';
const nodeConsole = require('console');
const nConsole = new nodeConsole.Console(process.stdout, process.stderr);

const fs = require('fs');
const path = require("path");
const os = require("os");
var disk = require('diskusage');

const MB = 1000000.0;

const DEBUG = false;
function cLog(msg){
  if(DEBUG) {
    nConsole.log(msg);
  }
}

class Home extends Component {
  state = {
    "files":{}
  }

  createStats(path){
    return JSON.parse(JSON.stringify(fs.statSync(path)));
    
  }

  addDirToMap(map, path, file){
    cLog("[addDirToMap] start")
    const keys = path.split("/");

    var dict = map;
    for (var key in keys){
      key = keys[key];
      if(key == "") {
        key = "/";
      }

      if(dict.has(key)) {
        cLog("[addDirToMap] getting dict " + key + " in map")
        dict = dict.get(key);
        continue;
      } else {
        cLog("[addDirToMap] adding " + key + " to map " + dict);
        dict.set(key, new Map(Object.entries({"stats":this.createStats(path), "path":path})));
      }
    }
  }

  addFileToMap(map, path, file){
    cLog("[addFileToMap] start")
    let keys;
    if(path == "/"){
      keys = ["/"];
    } else {
      keys = path.split("/");
    }

    var dict = map;
    for (var key in keys){
      key = keys[key];
      if(key == "") {
        key = "/";
      }

      if(dict.has(key) && key == keys[keys.length - 1] && "files" in dict.get(key)) {
        cLog("[addFileToMap] adding " + file + " to " + key + "files")
        dict.get("files").push(file);
      } else if (dict.has(key) && key == keys[keys.length - 1]) {
        cLog("[addFileToMap] Creating new file list and adding " + file + " to " + key)
        dict.get(key).set("files", [file]);
      } else if (dict.has(key)) {
        dict = dict.get(key);
        continue;
      } else {
        dict.get(key).set("files", [file]);
      }
    }
  }

  readDirIntoMap(map, dir){
    var dirContents = fs.readdirSync(dir);

    for(var idx in dirContents){
      var file = dirContents[idx];
      if(file.startsWith(".")) {
        continue;
      }

      const path = dir=="/" ? dir + file : dir + "/" + file;
      const stat = fs.statSync(path);
      if(stat.isDirectory()){
        cLog("Directory: " + file);
        this.addDirToMap(map, path, file);
      } else if(stat.isFile()){
        cLog("File: " + file);
        this.addFileToMap(map, dir, file);
      }

      const fileSizeInBytes = stat.size;
      const fileSizeInMegabytes = fileSizeInBytes / MB;

    }
  }

  componentDidMount(){
    const root = (os.platform == "win32") ? process.cwd().split(path.sep)[0] : "/"
    nConsole.log("\n\n#################### STARTING ANALYZER ON", "\"" + root + "\"", "####################");
    disk.check(root, function(err, info){
      nConsole.log("Total Space:", info.total / MB, "MB");
      nConsole.log("Free Space:", info.free / MB, "MB");
      nConsole.log("Available Space:", info.available / MB, "MB");
    })
    const map = new Map();
    map.set(root, new Map());
    this.readDirIntoMap(map, root);
    this.setState({"files":map});
  }

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Folder Analyzer</h2>
        
        <FolderList files={this.state.files} />
      </div>
    );
  }
}

export default Home;
