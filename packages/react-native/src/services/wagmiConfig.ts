import {Connector, configureChains, createConfig} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  hardhat,
} from 'wagmi/chains';
import {defaultWagmiConfig} from '@web3modal/wagmi-react-native';
import {w3mConnectors} from '@web3modal/ethereum';

import {getTargetNetwork} from '../helpers/network';
import {appConfig} from '../../app.config';
import {burnerWalletConfig} from './wagmi-burner/burnerWalletConfig';
import {connectorsForWallets} from '@rainbow-me/rainbowkit';

const {chains, publicClient} = configureChains(
  [hardhat, mainnet, polygon, optimism, arbitrum, base, zora],
  [alchemyProvider({apiKey: appConfig.alchemyApiKey}), publicProvider()],
);

const configuredNetwork = getTargetNetwork();

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

/**
 * wagmi connectors for the wagmi context
 */
export const connectors = connectorsForWallets([
  {
    groupName: 'Supported Wallets',
    wallets: [burnerWalletConfig({chains: [chains[0]]})],
  },
]);

const wagmiConfig = createConfig({
  connectors: [
    ...w3mConnectors({chains, projectId: appConfig.walletConnectProjectId}),
    // burnerWalletConfig({chains: [chains[0]]}).createConnector(),
  ],
  publicClient,
});

// const wagmiConfig = defaultWagmiConfig({
//   chains,
//   projectId: appConfig.walletConnectProjectId,
//   // metadata,
// });

export {wagmiConfig, chains};
