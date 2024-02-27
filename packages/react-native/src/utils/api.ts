import axios from 'axios';
import {Address} from 'wagmi';
import {logger} from 'react-native-logs';
import {appConfig} from '../../app.config';
const log = logger.createLogger().extend('api');

export function getUrl(hostName, endPoint) {
  const isProd = appConfig.nodeEnv === 'production';
  const url = isProd
    ? 'https://' + endPoint + '-' + hostName.split('https://')[1]
    : hostName + '/' + endPoint;

  return url;
}

export async function reqToken(hostName, address: Address) {
  const url = getUrl(hostName, 'auth');

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

export async function pingServer(hostName, address, token) {
  log.debug('pinging', {address, token});
  const url = getUrl(hostName, 'user');

  const timestamp = Date.now();
  return await axios.post(url, {
    data: JSON.stringify({
      timestamp,
      address,
      token,
    }),
  });
}
