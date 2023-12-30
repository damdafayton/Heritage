import {configureChains, createConfig} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import {mainnet, hardhat} from 'wagmi/chains';
import {defaultWagmiConfig} from '@web3modal/wagmi-react-native';
import {w3mConnectors} from '@web3modal/ethereum';

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

const burnerWallet =
  configuredNetwork.id === hardhat.id
    ? [burnerWalletConfig({chains: [chains[0]]})]
    : [];

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
    native: 'heritagenative://',
    // universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

const burnerWalletConnector = burnerWallet
  ? [
      burnerWalletConfig({
        chains: [chains[0]],
      }).createConnector().connector,
    ]
  : [];

const connectors = [
  ...w3mConnectors({chains, projectId: appConfig.walletConnectProjectId}),
  ...burnerWalletConnector,
];

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// const wagmiConfig = defaultWagmiConfig({
//   chains,
//   projectId: appConfig.walletConnectProjectId,
//   metadata,
// });

export {wagmiConfig, chains};
