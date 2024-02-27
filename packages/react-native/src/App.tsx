/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react';

import {W3mButton, Web3Modal} from '@web3modal/wagmi-react-native';
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
import {useBackgroundWork} from './hooks/useBackgroundWork';
import {Tasks} from './molecules/Tasks';
import * as Sentry from '@sentry/react-native';
import {Button} from 'react-native';

Sentry.init({
  dsn: 'https://88cfa3a3f6d063f2e0e6c4f75e8c86ae@o4506819614736384.ingest.sentry.io/4506819616636928',
});
const log = logger('App');

const App = () => {
  useAutoConnect();

  const {address: userAddress, isConnecting, isDisconnected} = useAccount();

  const {subscriptionData, refetchSubscriptionData, isSubscribed} =
    useGetSubscriptionData(userAddress);

  const {findContractFunction, address: heritageAddress} =
    useHeritageWalletContract();

  const fnFeeThousandage = findContractFunction?.('feeThousandagePerYear');
  const fnMinFee = findContractFunction?.('minFeePerYearInUsd');

  const {data: data1, refetch} = useContractRead({
    address: heritageAddress,
    functionName: fnFeeThousandage?.name,
    abi: [fnFeeThousandage] as Abi,
  });

  const {data: data2, refetch: refetch2} = useContractRead({
    address: heritageAddress,
    functionName: fnMinFee?.name,
    abi: [fnMinFee] as Abi,
  });

  const feeThousandagePerYear = Number(displayTxResult(data1));
  const minFeePerYear = Number(displayTxResult(data2));

  const [isConnected, setIsConnected] = useState(
    !!(minFeePerYear && feeThousandagePerYear),
  );

  log.debug({minFeePerYear, feeThousandagePerYear});

  const [key, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (isConnected) return;

    if (minFeePerYear && feeThousandagePerYear) {
      setIsConnected(true);
      return;
    }

    log.error(
      `Connection error to contract at ${heritageAddress}. Will try again in 4 seconds`,
    );

    const timeoutId = setTimeout(() => {
      refetch();
      refetch2();
      forceUpdate();
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [key]);

  const [errors, setError] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [successes, setSuccess] = useState<string[]>([]);

  const [appBarKey, rerenderAppBar] = useReducer(x => x + 1, 0);

  return (
    <AppStateContext.Provider
      value={{
        isModalVisible,
        errors,
        clearErrors: () => setError([]),
        setError: ({message: newError, isModalVisible: isModal = false}) => {
          setError([...errors, newError]);
          setIsModalVisible(isModal);
        },
        successes,
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
        key={key}
        value={{
          subscriptionData,
          refetchSubscriptionData,
          hostName: Config.HOSTNAME,
          minFeePerYear,
          feeThousandagePerYear,
        }}>
        <Tasks />
        <Appbar key={appBarKey} />
        <W3mButton balance="show" />
        <Web3Modal />
        <Tabs
          isConnected={isConnected}
          isSubscribed={isSubscribed}
          updateAppBar={rerenderAppBar}
        />
        <SuccessSnackbar />
        <ErrorSnackbar />
      </HerritageWalletContext.Provider>
    </AppStateContext.Provider>
  );
};

export default App;
