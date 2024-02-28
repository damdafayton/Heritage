import {TouchableOpacity, View} from 'react-native';
import {Button, Text, Tooltip} from '../ui';
import {useCallback, useEffect, useState} from 'react';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useAccount, useSignMessage} from 'wagmi';
import {getUserData, pingServer, reqToken} from '../utils/api';
import {logger} from '../utils/logger';
import {useTheme} from 'react-native-paper';
import {styles} from '../ui/styles';
const log = logger('BackgroundTask');

const BACKGROUND_TRACKING_KEY = 'com.herritage.backgroundTracking';

export function BackgroundTask() {
  const {address} = useAccount();

  const [canPingServer, setCanPingServer] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastPingTimestamp, setLastPingTimestamp] = useState('');

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

  const refreshTimestamp = useCallback(async () => {
    const signedToken = (await AsyncStorage.getItem(
      BACKGROUND_TRACKING_KEY,
    )) as `0x${string}`;

    const {data} = await getUserData(address as `0x${string}`, signedToken);

    setLastPingTimestamp(data?.timestamp);
  }, [setLastPingTimestamp]);

  useEffect(() => {
    if (canPingServer) {
      (async () => {
        await refreshTimestamp();
      })();
    }
  }, [canPingServer, setLastPingTimestamp]);

  const theme = useTheme();

  if (isChecking) return <></>;

  return (
    <View style={styles.global}>
      {!canPingServer ? (
        <>
          <Text style={{marginTop: 0}}>
            <AntDesign name="warning" color={theme.colors.error} /> Your app is
            not pinging the server to confirm that you are alive. If an account
            is inactive for 30 days:
          </Text>
          <Text>1) It's inheritance will be distributed. </Text>
          <Text>
            2) It's encrypted data will be delivered to registered receivers.
          </Text>
          <Text>
            This button enables the app to send a ping in the background to the
            server every 15 minutes to confirm that you are still alive.
          </Text>
          <Button
            loading={isLoadingSign}
            mode="contained-tonal"
            buttonColor={theme.colors.success}
            textColor={theme.colors.background}
            onPress={startTracking}>
            Start I'm alive tracker
          </Button>
        </>
      ) : (
        <>
          <Text style={{marginTop: 0}}>
            <AntDesign size={14} name="check" color={theme.colors.success} />{' '}
            App is pinging the server to notify that you are alive.
          </Text>
          {lastPingTimestamp && (
            <Text>
              Last ping: {new Date(lastPingTimestamp).toLocaleString()}{' '}
              <TouchableOpacity
                onPress={refreshTimestamp}
                style={{marginBottom: -1}}>
                <MaterialCommunityIcons size={14} name="refresh" />
              </TouchableOpacity>
            </Text>
          )}
          <Button
            loading={isLoadingSign}
            mode="contained-tonal"
            onPress={stopTracking}
            textColor={theme.colors.background}
            buttonColor={theme.colors.error}>
            Stop I'm alive tracker
          </Button>
        </>
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
