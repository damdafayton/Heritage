import {TouchableOpacity, View} from 'react-native';
import {Banner, Button, Snackbar, Text, Tooltip} from '../ui';
import {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useAccount, useSignMessage} from 'wagmi';
import {userGet, userPost, authGet} from '../utils/api';
import {logger} from '../utils/logger';
import {useTheme} from 'react-native-paper';
import {styles} from '../ui/styles';
import {AUTHENTICATION_TOKEN, TRACK_PING} from '../utils/constants';
import {useRefreshAuthenticationToken} from '../hooks/useRefreshAuthenticationToken';
import {Loading} from './Loading';
import {AppStateContext} from '../context/AppState.context';
const log = logger('BackgroundTask');

export function BackgroundTask() {
  const {address} = useAccount();

  const [isBackgroundFetching, setIsBackgroundFetching] = useState<
    undefined | boolean
  >(undefined);
  const [lastPingTimestamp, setLastPingTimestamp] = useState('');
  const [forceUpdate, forceUpdateBackgroundFetcher] = useReducer(x => x + 1, 0);
  const theme = useTheme();

  const {authToken} = useContext(AppStateContext);

  const {refresh: refreshAuthentication, isLoading: isLoadingAuth} =
    useRefreshAuthenticationToken();

  const callUserGet = async () => {
    const signedToken = (await AsyncStorage.getItem(
      AUTHENTICATION_TOKEN,
    )) as `0x${string}`;

    return await userGet(address as `0x${string}`, signedToken);
  };

  const refreshTimestamp = useCallback(async () => {
    const {data} = await callUserGet();

    const timestamp = data?.timestamp;

    if (!timestamp) return;

    setLastPingTimestamp(timestamp);
  }, [setLastPingTimestamp]);

  const startTracking = async () => {
    log.debug('startTracking');

    try {
      // Check if user is authenticated by requesting timestamp
      const {status} = await callUserGet();
      log.debug({status});
      if (status === 200) {
        await AsyncStorage.setItem(TRACK_PING, 'true');
        forceUpdateBackgroundFetcher();
        return;
      }
      await refreshAuthentication();
    } catch (e) {
      log.debug(e);
      await refreshAuthentication();
    }
  };

  const stopTracking = async () => {
    log.debug('stopTracking');
    await AsyncStorage.setItem(TRACK_PING, '');
    forceUpdateBackgroundFetcher();
  };

  useEffect(() => {
    (async () => {
      refreshTimestamp();

      const isAllowedToTrack =
        (await AsyncStorage.getItem(TRACK_PING)) === 'true';

      setIsBackgroundFetching(isAllowedToTrack);

      if (isAllowedToTrack) {
        startBackgroundFetch(address, authToken);
      } else {
        BackgroundFetch.stop();
      }
    })();
  }, [address, authToken, forceUpdate]);

  const [showTrackerSnack, setShowTrackerSnack] = useState(false);

  if (isBackgroundFetching === undefined) return <Loading />;

  return (
    <View style={{marginTop: styles.global.marginTop}}>
      {!isBackgroundFetching ? (
        <>
          <TouchableOpacity
            onPress={() => setShowTrackerSnack(!showTrackerSnack)}>
            <Text>
              <AntDesign name="warning" color={theme.colors.error} /> Your app
              is not pinging the server to confirm that you are alive.
            </Text>
          </TouchableOpacity>
          {showTrackerSnack ? (
            <Banner
              style={{marginTop: 14}}
              visible={showTrackerSnack}
              onDismiss={() => setShowTrackerSnack(false)}>
              {`If an account is inactive for 30 days:
1) It's inheritance will be distributed. \ 
2) It's encrypted data will be delivered to registered receivers.\

This button enables the app to send a ping in the background to the server every 15 minutes to confirm that you are still alive.`}
            </Banner>
          ) : null}
          <Button
            loading={isLoadingAuth}
            mode="contained-tonal"
            buttonColor={theme.colors.success}
            textColor={theme.colors.background}
            onPress={startTracking}>
            Start I'm alive tracker
          </Button>
        </>
      ) : (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: 8,
            }}>
            <AntDesign size={16} name="check" color={theme.colors.success} />
            <Text style={{flex: 1}}>
              App is pinging the server to notify that you are alive.
            </Text>
          </View>
          {lastPingTimestamp && (
            <Text>
              Last ping: {new Date(lastPingTimestamp).toLocaleString()}{' '}
              <Tooltip title="Refresh last pinged">
                <TouchableOpacity
                  onPress={refreshTimestamp}
                  style={{marginBottom: -1}}>
                  <MaterialCommunityIcons
                    size={18}
                    name="refresh"
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </Tooltip>
            </Text>
          )}
          <Button
            loading={isLoadingAuth}
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
    log.debug('task => ' + taskId);
    // Do your background work...
    // await this.addEvent(taskId);
    // IMPORTANT:  You must signal to the OS that your task is complete.
    await userPost(address as `0x${string}`, signedToken);
    BackgroundFetch.finish(taskId);
  };

  // Timeout callback is executed when your Task has exceeded its allowed running-time.
  // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
  const onTimeout = async taskId => {
    log.warn('task TIMEOUT => ' + taskId);
    BackgroundFetch.finish(taskId);
  };

  // Initialize BackgroundFetch only once when component mounts.
  let status = await BackgroundFetch.configure(
    {minimumFetchInterval: 15},
    onEvent,
    onTimeout,
  );

  log.debug('configure status => ' + status);
}
