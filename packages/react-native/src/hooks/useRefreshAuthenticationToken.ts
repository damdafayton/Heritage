import {useAccount, useSignMessage} from 'wagmi';

import {authGet, userPost} from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AUTHENTICATION_TOKEN} from '../utils/constants';
import {useContext} from 'react';
import {AppStateContext} from '../context/AppState.context';
import {logger} from '../utils/logger';
const log = logger('useRefreshAuthenticationToken');

export function useRefreshAuthenticationToken() {
  const {address} = useAccount();
  const {isLoading: isLoadingSign, signMessageAsync} = useSignMessage();

  const {setAuthToken} = useContext(AppStateContext);

  const refresh = async (onError?: Function) => {
    try {
      const token = await authGet(address as `0x${string}`);

      if (!token) return;
      const signedToken = await signMessageAsync({message: token});

      const res = await userPost(address as `0x${string}`, signedToken);

      if (res.status === 201) {
        await AsyncStorage.setItem(AUTHENTICATION_TOKEN, signedToken);
        setAuthToken(signedToken);
      }

      return res;
    } catch (e) {
      log.error(e);
      if (onError) onError(e);
    }
  };

  return {refresh, isLoading: isLoadingSign};
}
