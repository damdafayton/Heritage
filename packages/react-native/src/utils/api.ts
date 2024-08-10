import axios from 'axios';
import {Address} from 'wagmi';
import {getToken} from 'firebase/app-check';
import {Platform} from 'react-native';

import {appConfig} from '../../app.config';
import {logger} from './logger';
const log = logger('utils/api');

import {appCheck} from '../../web/src/services/Firebase';
import {appCheck as appCheckMobile} from '../services/firebase';
import {isProd} from './utils';

const hostName = appConfig.hostName;

async function addAppCheckTokenToHeader(config = {}) {
  let appCheckToken;

  try {
    if (Platform.OS === 'web') {
      if (isProd) {
        const {token} = await getToken(appCheck);
        appCheckToken = token;
      } else {
        // debug token is directly sent to firebase for web
        appCheckToken = appConfig.appCheckDebugToken;
      }
    } else {
      const {token} = await appCheckMobile?.getToken();
      appCheckToken = token;
    }
  } catch (e) {
    log.error('Error getting token', e);
  }

  //@ts-ignore
  const headers = config.headers || {};

  return {
    ...config,
    headers: {
      ...headers,
      'X-Firebase-AppCheck': appCheckToken,
    },
  };
}

export function getUrl(endPoint: string) {
  const isProd = hostName.startsWith('https://');
  const url = isProd
    ? 'https://' + endPoint.toLowerCase() + '-' + hostName.split('https://')[1]
    : hostName + '/' + endPoint;

  return url;
}

export async function testGet() {
  const config = await addAppCheckTokenToHeader();

  const url = getUrl('testAuth');

  try {
    const res = await axios.get(`${url}`, config);
    console.log('res', res);
  } catch (e) {
    console.log('error', e);
  }
}

export async function authGet(address: Address) {
  const url = getUrl('auth');
  const config = await addAppCheckTokenToHeader();
  // log.debug('config', JSON.stringify(config));

  const {data, status} =
    (await axios
      .get(`${url}?address=${address}`, config)
      .catch(e =>
        log.warn(Object.keys(e), e.code, e?.message, 'config:', e?.config),
      )) || {};

  if (status !== 200) return;

  const token = data?.token;

  return token;
}

/**
 *  This call updates USER token and timestamp'
 *  Returns 201 if successful
 */
export async function userPost(address, signedToken, pushToken = '') {
  const url = getUrl('user');

  const config = await addAppCheckTokenToHeader();

  return await axios.post(url, {
    data: JSON.stringify({
      address,
      signedToken,
      pushToken,
    }),
    config,
  });
}

export async function userPut(address, signedToken, pushToken = '') {
  const url = getUrl('user');

  const config = await addAppCheckTokenToHeader();

  return await axios.put(url, {
    data: JSON.stringify({
      address,
      signedToken,
      pushToken,
    }),
    config,
  });
}

// Returns timestamp data
export async function userGet(address: Address, signedToken) {
  const url = getUrl('user');
  const config = await addAppCheckTokenToHeader();

  return await axios.get(
    `${url}?address=${address}&signedToken=${signedToken || ''}`,
    config,
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
  const config = await addAppCheckTokenToHeader();

  return await axios.get(
    `${url}?address=${address}&signedToken=${signedToken || ''}`,
    config,
  );
}

export async function getEncryptedDataForInheritor(
  inheritorKey: string,
  inheritorEmail: string,
) {
  const url = getUrl('encryptedData');
  const config = await addAppCheckTokenToHeader();

  return await axios.get(
    `${url}?inheritorKey=${inheritorKey || ''}&inheritorEmail=${
      inheritorEmail || ''
    }`,
    config,
  );
}

export async function postEncryptedData(address: Address, data: string) {
  const url = getUrl('encryptedData');
  const config = await addAppCheckTokenToHeader();

  return await axios.post(url, {
    data,
    config,
  });
}
