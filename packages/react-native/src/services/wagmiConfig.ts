import {configureChains, createConfig} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import {mainnet, hardhat} from 'wagmi/chains';
import {WalletConnectConnector} from '@web3modal/wagmi-react-native/src/connectors/WalletConnectConnector';
import {Platform} from 'react-native';

import {getTargetNetwork} from '../helpers/network';
import {appConfig} from '../../app.config';
import {burnerWalletConfig} from './wagmi-burner/burnerWalletConfig';

const configuredNetwork = getTargetNetwork();
// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains =
  // @ts-ignore
  configuredNetwork.id === mainnet.id
    ? [configuredNetwork]
    : [configuredNetwork, mainnet];

const {chains, publicClient} = configureChains(enabledChains, [
  alchemyProvider({apiKey: appConfig.alchemyApiKey}),
  publicProvider(),
]);

// 2. Create config
const metadata = {
  name: 'Web3Modal RN',
  description: 'Web3Modal RN Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'heritagenative://',
    // universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

const allowBurner = appConfig.onlyLocalBurnerWallet
  ? configuredNetwork.id === hardhat.id
  : true;

const burnerWalletConnector = allowBurner
  ? [
      burnerWalletConfig({
        chains: [chains[0]],
      }).createConnector().connector,
    ]
  : [];

const connectors = [
  new WalletConnectConnector({
    chains,
    options: {projectId: appConfig.walletConnectProjectId, metadata},
  }),
  ...burnerWalletConnector,
];

// Remove injected connector on mobile
const removeInjected = connectors.filter(
  c => Platform.OS === 'web' || c.id !== 'injected',
);

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: removeInjected,
  publicClient,
});

export {wagmiConfig, chains};
