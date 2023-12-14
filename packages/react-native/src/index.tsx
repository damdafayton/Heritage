import React from 'react';

import '@walletconnect/react-native-compat';
import {WagmiConfig} from 'wagmi';
import {createWeb3Modal, Web3Modal} from '@web3modal/wagmi-react-native';

import App from './App';
import {wagmiConfig, chains} from './services/wagmiConfig';
import {appConfig} from '../app.config';

// 3. Create modal
createWeb3Modal({
  projectId: appConfig.walletConnectProjectId,
  chains,
  wagmiConfig,
});

export const index = () => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <App />
      <Web3Modal />
    </WagmiConfig>
  );
};
