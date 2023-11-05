import React from 'react';
import {AppRegistry} from 'react-native';
// import App from './src/components/App';
import App from './App';
// import appJSON from './app.json';

// const {name: appName} = appJSON;

AppRegistry.registerComponent('appName', () => App);

AppRegistry.runApplication('appName', {
  rootTag: document.getElementById('react-native-web-app'),
});
