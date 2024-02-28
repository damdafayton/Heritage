import {View} from 'react-native';
import {Button, Tooltip} from '../ui';
import {useEffect, useState} from 'react';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAccount, useSignMessage} from 'wagmi';
import {pingServer, reqToken} from '../utils/api';
import {logger} from '../utils/logger';
import {useTheme} from 'react-native-paper';
const log = logger('BackgroundTask');

const BACKGROUND_TRACKING_KEY = 'com.herritage.backgroundTracking';

export function BackgroundTask() {
  const {address} = useAccount();

  const [canPingServer, setCanPingServer] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!address) {
      setCanPingServer(false);
      return;
    }

    setIsChecking(true);

    (async () => {
      const signedToken = (await AsyncStorage.getItem(
        BACKGROUND_TRACKING_KEY,
      )) as `0x${string}`;

      // Confirm validity of token by pinging the server
      if (signedToken) {
        const {status} = await pingServer(address, signedToken);

        if (status === 201) {
          setCanPingServer(true);
        }
      } else {
        setCanPingServer(false);
      }

      setIsChecking(false);
    })();
  }, [address, setIsChecking]);

  const {isLoading: isLoadingSign, signMessageAsync} = useSignMessage();

  const startTracking = async () => {
    log.debug('startTracking');

    const _token = await reqToken(address as `0x${string}`);

    if (!_token) return;
    const signedToken = await signMessageAsync({message: _token});

    const {status} = await pingServer(address as `0x${string}`, signedToken);

    if (status === 201) {
      await AsyncStorage.setItem(BACKGROUND_TRACKING_KEY, signedToken);
      setCanPingServer(true);
    }
  };

  const stopTracking = async () => {
    log.debug('stopTracking');
    await AsyncStorage.setItem(BACKGROUND_TRACKING_KEY, '');
    setCanPingServer(false);
  };

  useEffect(() => {
    if (canPingServer) {
      (async () => {
        const signedToken = (await AsyncStorage.getItem(
          BACKGROUND_TRACKING_KEY,
        )) as `0x${string}`;

        startBackgroundFetch(address, signedToken);
      })();
    }
  }, [canPingServer]);

  const theme = useTheme();

  if (isChecking) return <></>;

  return (
    <View>
      {!canPingServer ? (
        <Tooltip
          title={
            'This button enables the app to send a ping to the server every 15 minutes to confirm that you are still alive.'
          }>
          <Button
            loading={isLoadingSign}
            mode="contained-tonal"
            buttonColor={theme.colors.success}
            textColor={theme.colors.background}
            onPress={startTracking}>
            Start tracking if I'm alive
          </Button>
        </Tooltip>
      ) : (
        <Button
          loading={isLoadingSign}
          mode="contained-tonal"
          onPress={stopTracking}
          textColor={theme.colors.background}
          buttonColor={theme.colors.error}>
          Stop tracking that I'm alive
        </Button>
      )}
    </View>
  );
}

async function startBackgroundFetch(address, signedToken) {
  // BackgroundFetch event handler.
  const onEvent = async taskId => {
    log.debug('task:', taskId);
    // Do your background work...
    // await this.addEvent(taskId);
    // IMPORTANT:  You must signal to the OS that your task is complete.
    await pingServer(address as `0x${string}`, signedToken);

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
}
