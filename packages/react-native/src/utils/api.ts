import axios from 'axios';
import {Address} from 'wagmi';
import {logger} from 'react-native-logs';

import {appConfig} from '../../app.config';
const log = logger.createLogger().extend('utils/api');

const hostName = appConfig.hostName;

export function getUrl(endPoint: string) {
  const isProd = hostName.startsWith('https://');
  const url = isProd
    ? 'https://' + endPoint.toLowerCase() + '-' + hostName.split('https://')[1]
    : hostName + '/' + endPoint;

  return url;
}

export async function authGet(address: Address) {
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

export async function userPost(address, signedToken) {
  log.debug('This call updates USER token and timestamp', {
    address,
    signedToken,
  });
  const url = getUrl('user');

  return await axios.post(url, {
    data: JSON.stringify({
      address,
      signedToken,
    }),
  });
}

// Returns timestamp data
export async function userGet(address: Address, signedToken) {
  const url = getUrl('user');

  return await axios.get(
    `${url}?address=${address}&signedToken=${signedToken || ''}`,
  );
}

export async function pingGet(address: Address, signedToken) {
  const url = getUrl('ping');

  return await axios.get(
    `${url}?address=${address}&signedToken=${signedToken || ''}`,
  );
}

export async function getEncryptedData(address: Address, signedToken: string) {
  const url = getUrl('encryptedData');
  return await axios.get(
    `${url}?address=${address}&signedToken=${signedToken || ''}`,
  );
}

export async function getEncryptedDataForInheritor(
  inheritorKey: string,
  inheritorEmail: string,
) {
  const url = getUrl('encryptedData');
  return await axios.get(
    `${url}?inheritorKey=${inheritorKey || ''}&inheritorEmail=${
      inheritorEmail || ''
    }`,
  );
}

export async function postEncryptedData(address: Address, data: string) {
  const url = getUrl('encryptedData');

  return await axios.post(url, {
    data,
  });
}
