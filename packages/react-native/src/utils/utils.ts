import {appConfig} from '../../app.config';

export const sleep = (ms = 3000) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const isProd = appConfig.nodeEnv === 'production';
