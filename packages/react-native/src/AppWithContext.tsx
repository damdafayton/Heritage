/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react';

import {StyleSheet, useColorScheme} from 'react-native';
import {W3mButton} from '@web3modal/wagmi-react-native';
import {useAccount, useContractRead} from 'wagmi';
import Config from 'react-native-config';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {logger} from './utils/logger';
const log = logger('App');

import {Home} from './pages/Home';
import {useGetSubscriptionData} from './hooks/useGetSubscriptionData';
import {HerritageWalletContext} from './context/HerritageWallet.context';
import {useHeritageWalletContract} from './hooks/useHeritageWalletContract';
import {Abi} from 'viem';
import {displayTxResult} from './helpers/utils';
import {Appbar} from './ui/Appbar';
import {MenuType} from './typings/config';
import {Contract} from './pages/Contract';
import {useContext, useEffect, useReducer, useState} from 'react';
import {Subscribed} from './pages/subscribed/Subscribed';
import {AppStateContext} from './context/AppState.context';
import {ErrorBanner} from './molecules/ErrorBanner';
import {useTheme} from 'react-native-paper';
import {Tabs} from './molecules/Tabs';

const AppWithContext = ({children}) => {
  log.debug({Config});
  const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

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

  const [activeTab, setActiveTab] = useState<string>(MenuType.HOME);

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
        {children}
      </HerritageWalletContext.Provider>
    </AppStateContext.Provider>
  );
};

export default AppWithContext;
