import {configureChains, createConfig} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import {mainnet, polygon, optimism, arbitrum, base, zora} from 'wagmi/chains';
// import {connectorsForWallets, getDefaultWallets} from '@rainbow-me/rainbowkit';

import {appConfig} from '../../app.config';
import {defaultWagmiConfig} from '@web3modal/wagmi-react-native';

const {chains, publicClient} = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, zora],
  [alchemyProvider({apiKey: appConfig.alchemyApiKey}), publicProvider()],
);

// const {connectors} = getDefaultWallets({
//   appName: 'My RainbowKit App',
//   projectId: 'YOUR_PROJECT_ID',
//   chains,
// });

// const wagmiConfig = createConfig({
//   autoConnect: true,
//   // connectors,
//   publicClient,
// });

// 2. Create config
const metadata = {
  name: 'Web3Modal RN',
  description: 'Web3Modal RN Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId: appConfig.walletConnectProjectId,
  metadata,
});

export {wagmiConfig, chains};
