import axios from 'axios';
import {Address} from 'wagmi';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('api');

export async function reqToken(hostName, address: Address) {
  const {data, status} =
    (await axios
      .get(`${hostName}auth?address=${address}`)
      .catch(e =>
        log.error(Object.keys(e), e.code, e?.message, 'config:', e?.config),
      )) || {};

  if (status !== 200) return;

  const token = data?.token;

  return token;
}

export async function pingServer(hostName, address, token) {
  log.debug('pinging', {address, token});
  const timestamp = Date.now();
  return await axios.post(`${hostName}user`, {
    data: JSON.stringify({
      timestamp,
      address,
      token,
    }),
  });
}
