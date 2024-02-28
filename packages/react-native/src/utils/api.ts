import axios from 'axios';
import {Address} from 'wagmi';
import {logger} from 'react-native-logs';

import {appConfig} from '../../app.config';
const log = logger.createLogger().extend('utils/api');

const hostName = appConfig.hostName;

export function getUrl(endPoint: string) {
  const isProd = appConfig.nodeEnv === 'production';
  const url = isProd
    ? 'https://' + endPoint.toLowerCase() + '-' + hostName.split('https://')[1]
    : hostName + '/' + endPoint;

  return url;
}

export async function reqToken(address: Address) {
  const url = getUrl('auth');

  const {data, status} =
    (await axios
      .get(`${url}?address=${address}`)
      .catch(e =>
        log.error(Object.keys(e), e.code, e?.message, 'config:', e?.config),
      )) || {};

  if (status !== 200) return;

  const token = data?.token;

  return token;
}

export async function pingServer(address, token) {
  log.debug('pinging', {address, token});
  const url = getUrl('user');

  return await axios.post(url, {
    data: JSON.stringify({
      address,
      token,
    }),
  });
}
