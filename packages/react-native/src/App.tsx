/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react';

import {W3mButton} from '@web3modal/wagmi-react-native';
import {useAccount, useContractRead} from 'wagmi';
import Config from 'react-native-config';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from 'react-native-paper';
import {Platform, View} from 'react-native';

import {useGetSubscriptionData} from './hooks/useGetSubscriptionData';
import {HerritageWalletContext} from './context/HerritageWallet.context';
import {useHeritageWalletContract} from './hooks/useHeritageWalletContract';
import {Abi} from 'viem';
import {displayTxResult} from './helpers/utils';
import {Appbar} from './ui/Appbar';
import {useEffect, useLayoutEffect, useReducer, useState} from 'react';
import {AppStateContext} from './context/AppState.context';
import {Tabs} from './molecules/Tabs.navigator';
import {SuccessSnackbar} from './molecules/SuccessSnackbar';
import {ErrorSnackbar} from './molecules/ErrorSnackbar';
import {useAutoConnect} from './hooks/useAutoConnect';
import {logger} from './utils/logger';
import {appConfig} from '../app.config';
import {Loading} from './molecules/Loading';
import {SelectUserType} from './pages/SelectUserType';
import {AppMode} from './types/types';

Sentry.init({
  dsn: appConfig.sentryDSN,
});

const log = logger('App');

const App = () => {
  const [forceUpdateKey, forceUpdate] = useReducer(x => x + 1, 0);
  const [appMode, setAppMode] = useState<`${AppMode}`>('loading');
  const [errors, setError] = useState<string[]>([]);
  const [successes, setSuccess] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useLayoutEffect(() => {
    (async () => {
      const mode = await AsyncStorage.getItem('appMode');
      if (mode) {
        setAppMode(mode as any);
      } else {
        setAppMode('selector');
      }
    })();
  }, [setAppMode]);

  useAutoConnect();

  const theme = useTheme();

  const {address: userAddress, isDisconnected: isUserDisconnected} =
    useAccount();

  const {subscriptionData, refetchSubscriptionData, isSubscribed} =
    useGetSubscriptionData(userAddress);

  const {findContractFunction, address: heritageAddress} =
    useHeritageWalletContract();

  const fnFeeThousandage = findContractFunction?.('feeThousandagePerYear');
  const fnMinFee = findContractFunction?.('minFeePerYearInUsd');

  const {
    data: data1,
    refetch,
    isFetching: isFetching1,
  } = useContractRead({
    address: heritageAddress,
    functionName: fnFeeThousandage?.name,
    abi: [fnFeeThousandage] as Abi,
  });

  const {
    data: data2,
    refetch: refetch2,
    isFetching: isFetching2,
  } = useContractRead({
    address: heritageAddress,
    functionName: fnMinFee?.name,
    abi: [fnMinFee] as Abi,
  });

  const feeThousandagePerYear = Number(displayTxResult(data1));
  const minFeePerYear = Number(displayTxResult(data2));

  log.debug({minFeePerYear, feeThousandagePerYear});

  useEffect(() => {
    if (!userAddress || isFetching1) return;

    if (minFeePerYear) {
      log.debug('Connected to contract');
      return;
    }

    if (forceUpdateKey > 1) {
      log.warn(
        `Failed to connect to the contract at ${
          heritageAddress || '??'
        } for 2 times. App will try connecting again in 5 seconds`,
      );
    }

    const timeoutId = setTimeout(() => {
      refetch();
      refetch2();
      forceUpdate();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [forceUpdateKey, isFetching1, isUserDisconnected]);

  useEffect(() => {
    log.debug('userAddress', userAddress);
  }, [userAddress]);

  const isIOS = Platform.OS === 'ios';

  return (
    <>
      <AppStateContext.Provider
        value={{
          isModalVisible,
          errors: errors,
          clearErrors: () => setError([]),
          setError: ({message: newError, isModalVisible: isModal = false}) => {
            setError([newError]);
            setIsModalVisible(isModal);
          },
          successes: successes,
          clearSuccesses: () => setSuccess([]),
          setSuccess: ({
            message: newMessage,
            isModalVisible: isModal = false,
          }) => {
            setSuccess([newMessage]);
            setIsModalVisible(isModal);
          },
          setAppMode,
          appMode,
        }}>
        <HerritageWalletContext.Provider
          value={{
            subscriptionData,
            refetchSubscriptionData,
            hostName: Config.HOSTNAME,
            minFeePerYear,
            feeThousandagePerYear,
            isSubscribed,
            isConnected: !!minFeePerYear,
          }}>
          <Appbar />
          {(() => {
            switch (appMode) {
              case AppMode.LOADING:
                return <Loading />;
              case AppMode.INHERITEE:
                return (
                  <>
                    {userAddress && !isIOS ? (
                      <>
                        <View
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: theme.colors.background,
                            paddingHorizontal: 18,
                          }}>
                          <W3mButton
                            balance="show"
                            loadingLabel="Loading.."
                            label="Loading.."
                            connectStyle={{
                              backgroundColor: theme.colors.background,
                            }}
                            accountStyle={{
                              backgroundColor: theme.colors.background,
                              width: '100%',
                            }}
                          />
                        </View>
                        <View
                          style={{
                            alignSelf: 'center',
                            backgroundColor: theme.colors.background,
                            width: '100%',
                            height: 8,
                          }}></View>
                      </>
                    ) : null}
                    <Tabs />
                  </>
                );
              case AppMode.INHERITOR:
                // Inheritor doesnt need to be connected
                return <Tabs />;
              case AppMode.SELECTOR:
                return <SelectUserType />;
            }
          })()}
        </HerritageWalletContext.Provider>
      </AppStateContext.Provider>
      {!isModalVisible ? <SuccessSnackbar successes={successes} /> : null}
      {!isModalVisible ? <ErrorSnackbar errors={errors} /> : null}
    </>
  );
};

export default App;
