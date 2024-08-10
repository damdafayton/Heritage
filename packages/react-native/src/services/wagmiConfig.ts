import {configureChains, createConfig} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import {mainnet, hardhat} from 'wagmi/chains';
import {WalletConnectConnector} from '@web3modal/wagmi-react-native/src/connectors/WalletConnectConnector';
import {InjectedConnector} from 'wagmi/connectors/injected';

// import {WalletConnectConnector} from '../../web/node_modules/@wagmi/connectors/dist/esm/walletConnect';

import {Platform} from 'react-native';

import {getTargetNetwork} from '../helpers/network';
import {appConfig} from '../../app.config';
import {burnerWalletConfig} from './wagmi-burner/burnerWalletConfig';

const configuredNetwork = getTargetNetwork();
// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains =
  // @ts-ignore
  configuredNetwork.id === mainnet.id
    ? [configuredNetwork]
    : [configuredNetwork, mainnet];

const {chains, publicClient} = configureChains(enabledChains, [
  alchemyProvider({apiKey: appConfig.alchemyApiKey}),
  publicProvider(),
]);

// 2. Create config
export const metadata = {
  name: 'Heritage',
  description: `Heritage App`,
  url: 'https://damdafayton.github.io/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'heritagenative://',
    universal: 'damdafayton.github.io/heritageapp',
  },
  defaultChain: chains[0].id,
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

export const connectors = [
  new WalletConnectConnector({
    chains,
    options: {projectId: appConfig.walletConnectProjectId, metadata},
  }),
  ...burnerWalletConnector,
];

if (Platform.OS === 'web') {
  connectors.unshift(new InjectedConnector());
}

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: connectors,
  publicClient,
});

export {wagmiConfig, chains};
