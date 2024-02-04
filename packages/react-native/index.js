/**
 * @format
 */

import {AppRegistry} from 'react-native';

import App from './src/App';
import {index} from './src/index';
import {name as appName} from './src/app.json';

AppRegistry.registerComponent(appName, () => index);
