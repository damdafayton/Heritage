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
import {useEffect, useReducer, useState} from 'react';
import {AppStateContext} from './context/AppState.context';
import {Tabs} from './molecules/Tabs';
import {SuccessSnackbar} from './molecules/SuccessSnackbar';
import {ErrorSnackbar} from './molecules/ErrorSnackbar';
import {useAutoConnect} from './hooks/useAutoConnect';
import {logger} from './utils/logger';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WALLET_ID_KEY} from './utils/constants';

Sentry.init({
  dsn: 'https://88cfa3a3f6d063f2e0e6c4f75e8c86ae@o4506819614736384.ingest.sentry.io/4506819616636928',
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

    log.error(
      `Connection error to contract at ${heritageAddress}. Will try again in 10 seconds`,
    );

    const timeoutId = setTimeout(() => {
      refetch();
      refetch2();
      forceUpdate();
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [forceUpdateKey, isFetching1, isUserDisconnected]);

  const [errors, setError] = useState<string[]>([]);
  const [successes, setSuccess] = useState<string[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [AUTHENTICATION_TOKEN, setAUTHENTICATION_TOKEN] = useState('');

  useEffect(() => {
    SplashScreen.hide();

    (async () => {
      const token = await AsyncStorage.getItem(AUTHENTICATION_TOKEN);
      setAUTHENTICATION_TOKEN(token || '');
    })();
  }, []);

  return (
    <>
      <AppStateContext.Provider
        value={{
          isModalVisible,
          clearErrors: () => setError([]),
          setError: ({message: newError, isModalVisible: isModal = false}) => {
            setError([...errors, newError]);
            setIsModalVisible(isModal);
          },
          clearSuccesses: () => setSuccess([]),
          setSuccess: ({
            message: newMessage,
            isModalVisible: isModal = false,
          }) => {
            setSuccess([...successes, newMessage]);
            setIsModalVisible(isModal);
          },
          authToken: AUTHENTICATION_TOKEN,
          setAuthToken: setAUTHENTICATION_TOKEN,
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
            />
          ) : null}
          <Tabs />
        </HerritageWalletContext.Provider>
      </AppStateContext.Provider>
      <SuccessSnackbar successes={successes} />
      <ErrorSnackbar errors={errors} />
    </>
  );
};

export default App;
