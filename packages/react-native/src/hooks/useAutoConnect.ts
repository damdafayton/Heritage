import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect} from 'react';
import {hardhat} from 'viem/chains';
import {Connector, useAccount, useConnect} from 'wagmi';

import {getTargetNetwork} from '../helpers/network';
import {appConfig} from '../../app.config';
import {
  burnerWalletId,
  defaultBurnerChainId,
} from '../services/wagmi-burner/BurnerConnector';
import {logger} from '../utils/logger';

const WALLET_ID_KEY = 'heritage.wallet';
const log = logger('useAutoConnect');

/**
 * This function will get the initial wallet connector (if any), the app will connect to
 * @param previousWalletId
 * @param connectors
 * @returns
 */
const getInitialConnector = (
  previousWalletId: string | null,
  connectors: Connector[],
): {connector: Connector | undefined; chainId?: number} | undefined => {
  const targetNetwork = getTargetNetwork();
  log.debug(targetNetwork);

  const allowBurner = appConfig.onlyLocalBurnerWallet
    ? targetNetwork.id === hardhat.id
    : true;

  if (!previousWalletId) {
    // The user was not connected to a wallet
    if (allowBurner && appConfig.walletAutoConnect) {
      const connector = connectors.find(f => f.id === burnerWalletId);
      return {connector, chainId: defaultBurnerChainId};
    }
  } else {
    // the user was connected to wallet
    if (appConfig.walletAutoConnect) {
      if (previousWalletId === burnerWalletId && !allowBurner) {
        return;
      }

      const connector = connectors.find(f => f.id === previousWalletId);
      return {connector};
    }
  }

  return undefined;
};

export function useAutoConnect() {
  const connectState = useConnect();
  const accountState = useAccount();

  useEffect(() => {
    (async () => {
      if (accountState.isConnected) {
        // user is connected, set walletName
        await AsyncStorage.setItem(
          WALLET_ID_KEY,
          accountState.connector?.id ?? '',
        );
      } else {
        // user has disconnected, reset walletName
        await AsyncStorage.setItem(WALLET_ID_KEY, '');
      }
    })();
  }, [accountState.isConnected, accountState.connector?.name]);

  useEffect(() => {
    (async () => {
      const initialConnector = getInitialConnector(
        await AsyncStorage.getItem(WALLET_ID_KEY),
        connectState.connectors,
      );

      if (initialConnector?.connector) {
        connectState.connect({
          connector: initialConnector.connector,
          chainId: initialConnector.chainId,
        });
      }
    })();
  }, []);
}
