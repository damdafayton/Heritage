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

import {logger} from './utils/logger';
const log = logger('App');

import {useGetSubscriptionData} from './hooks/useGetSubscriptionData';
import {HerritageWalletContext} from './context/HerritageWallet.context';
import {useHeritageWalletContract} from './hooks/useHeritageWalletContract';
import {Abi} from 'viem';
import {displayTxResult} from './helpers/utils';
import {Appbar} from './ui/Appbar';
import {MenuType} from './typings/config';
import {useEffect, useReducer, useState} from 'react';
import {AppStateContext} from './context/AppState.context';
import {ErrorBanner} from './molecules/ErrorBanner';
import {Tabs} from './molecules/Tabs';

const App = () => {
  log.debug({Config});

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

    setTimeout(() => {
      refetch();
      refetch2();
      forceUpdate();
    }, 2000);
  }, [key]);

  const [errors, setErrors] = useState<string[]>([]);
  const [isModalError, setIsModalError] = useState(false);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [isModalSuccess, setIsModalSuccess] = useState(false);

  const [appBarKey, rerenderAppBar] = useReducer(x => x + 1, 0);

  return (
    <AppStateContext.Provider
      value={{
        errors,
        clearErrors: () => setErrors([]),
        setErrors: ({errors: newErrors, modalError = false}) => {
          setErrors([...errors, ...newErrors]);
          setIsModalError(modalError);
        },
        isModalError,
        successes,
        clearSuccesses: () => setSuccesses([]),
        setSuccesses: ({successes: newSuccesses, modalSuccess = false}) => {
          setSuccesses([...successes, ...newSuccesses]);
          setIsModalSuccess(modalSuccess);
        },
        isModalSuccess,
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
        <Appbar key={appBarKey} />
        <W3mButton balance="show" />
        <ErrorBanner />
        <Tabs
          isConnected={isConnected}
          isSubscribed={isSubscribed}
          updateAppBar={rerenderAppBar}
        />
      </HerritageWalletContext.Provider>
    </AppStateContext.Provider>
  );
};

export default App;
