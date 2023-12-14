import React from 'react';
import {AppRegistry} from 'react-native';
// import App from './src/components/App';

import {index} from './index';
// import appJSON from './app.json';

// const {name: appName} = appJSON;

AppRegistry.registerComponent('appName', () => index);

AppRegistry.runApplication('appName', {
  rootTag: document.getElementById('react-native-web-app'),
});
