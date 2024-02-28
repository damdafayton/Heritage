import axios from 'axios';
import {useContext, useEffect, useState} from 'react';
import BackgroundFetch from 'react-native-background-fetch';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {logger} from '../utils/logger';
import {useAccount, useSignMessage} from 'wagmi';
import {pingServer, reqToken} from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const log = logger('useBackgroundWork');

const BACKGROUND_TASK_KEY = 'com.herritage.backgroundTask';

export function useBackgroundWork() {
  const {hostName} = useContext(HerritageWalletContext);
  const {address} = useAccount();
  const {isLoading: isLoadingSign, signMessageAsync} = useSignMessage();
  const [tokenValue, setTokenValue] = useState<`0x${string}`>();

  const initBackgroundFetch = async () => {
    // BackgroundFetch event handler.
    const onEvent = async taskId => {
      log.debug('task:', taskId);
      // Do your background work...
      // await this.addEvent(taskId);
      // IMPORTANT:  You must signal to the OS that your task is complete.
      await pingServer(hostName, address as `0x${string}`, tokenValue);

      BackgroundFetch.finish(taskId);
    };

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    const onTimeout = async taskId => {
      log.warn('task TIMEOUT:', taskId);
      BackgroundFetch.finish(taskId);
    };

    // Initialize BackgroundFetch only once when component mounts.
    let status = await BackgroundFetch.configure(
      {minimumFetchInterval: 15},
      onEvent,
      onTimeout,
    );

    log.debug('configure status:', status);
  };

  useEffect(() => {
    log.debug('pinging');

    if (!address) return;

    (async () => {
      const token = (await AsyncStorage.getItem(
        BACKGROUND_TASK_KEY,
      )) as `0x${string}`;

      if (!token) {
        const _token = await reqToken(hostName, address as `0x${string}`);

        if (!_token) return;
        const signedToken = await signMessageAsync({message: _token});

        const {status} = await pingServer(
          hostName,
          address as `0x${string}`,
          signedToken,
        );

        if (status === 201) {
          await AsyncStorage.setItem(BACKGROUND_TASK_KEY, signedToken);
          setTokenValue(signedToken);
        }
      } else {
        setTokenValue(token);
        pingServer(hostName, address as `0x${string}`, token);
      }
    })();
  }, [address]);

  useEffect(() => {
    initBackgroundFetch();
  }, [tokenValue]);
}
