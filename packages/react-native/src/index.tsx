import React from 'react';

import '@walletconnect/react-native-compat';
import {WagmiConfig} from 'wagmi';
import {createWeb3Modal, Web3Modal} from '@web3modal/wagmi-react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import '../shim';
import App from './App';
import {wagmiConfig, chains} from './services/wagmiConfig';
import {appConfig} from '../app.config';

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

// 3. Create modal
createWeb3Modal({
  projectId: appConfig.walletConnectProjectId,
  chains,
  wagmiConfig,
  clipboardClient,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
  ],
  // defaultChain: appConfig.devNetwork,
  // tokens: {
  //   [appConfig.devNetwork.id]: {
  //     address: appConfig.devPublicAddress,
  //   },
  // },
});

export const index = () => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <App />
      <Web3Modal />
    </WagmiConfig>
  );
};
