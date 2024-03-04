/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import SplashScreen from 'react-native-splash-screen';

import 'react';

import {W3mButton} from '@web3modal/wagmi-react-native';
import {useAccount, useContractRead} from 'wagmi';
import Config from 'react-native-config';

import {useGetSubscriptionData} from './hooks/useGetSubscriptionData';
import {HerritageWalletContext} from './context/HerritageWallet.context';
import {useHeritageWalletContract} from './hooks/useHeritageWalletContract';
import {Abi} from 'viem';
import {displayTxResult} from './helpers/utils';
import {Appbar} from './ui/Appbar';
import {useEffect, useLayoutEffect, useReducer, useState} from 'react';
import {AppStateContext} from './context/AppState.context';
import {Tabs} from './molecules/Tabs';
import {SuccessSnackbar} from './molecules/SuccessSnackbar';
import {ErrorSnackbar} from './molecules/ErrorSnackbar';
import {useAutoConnect} from './hooks/useAutoConnect';
import {logger} from './utils/logger';
import * as Sentry from '@sentry/react-native';
import {Appearance} from 'react-native';
import PolyfillCrypto from 'react-native-webview-crypto';
import {appConfig} from '../app.config';
import {useTheme} from 'react-native-paper';

Sentry.init({
  dsn: appConfig.sentryDSN,
});

const log = logger('App');

const App = () => {
  useAutoConnect();

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

  const [forceUpdateKey, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (isUserDisconnected || isFetching1) return;

    if (minFeePerYear) {
      log.debug('Connected to contract');
      return;
    }

    if (forceUpdateKey > 1) {
      log.error(
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

  const [errors, setError] = useState<string[]>([]);
  const [successes, setSuccess] = useState<string[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const theme = useTheme();

  return (
    <>
      <PolyfillCrypto />
      <AppStateContext.Provider
        value={{
          isModalVisible,
          errors: errors,
          clearErrors: () => setError([]),
          setError: ({message: newError, isModalVisible: isModal = false}) => {
            setError([...errors, newError]);
            setIsModalVisible(isModal);
          },
          successes: successes,
          clearSuccesses: () => setSuccess([]),
          setSuccess: ({
            message: newMessage,
            isModalVisible: isModal = false,
          }) => {
            setSuccess([...successes, newMessage]);
            setIsModalVisible(isModal);
          },
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
          {!isUserDisconnected ? (
            <W3mButton
              balance="show"
              loadingLabel="Loading.."
              label="Loading.."
              connectStyle={{
                backgroundColor: theme.colors.background,
                borderRadius: 0,
              }}
              accountStyle={{
                backgroundColor: theme.colors.background,
                borderRadius: 0,
              }}
            />
          ) : null}
          <Tabs />
        </HerritageWalletContext.Provider>
      </AppStateContext.Provider>
      {!isModalVisible ? <SuccessSnackbar successes={successes} /> : null}
      {!isModalVisible ? <ErrorSnackbar errors={errors} /> : null}
    </>
  );
};

export default App;
