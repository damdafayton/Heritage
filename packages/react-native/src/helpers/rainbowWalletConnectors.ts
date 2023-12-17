// import {connectorsForWallets} from '@rainbow-me/rainbowkit';

// import {chains} from './wagmiConfig';
// import {appConfig} from '../../app.config';

// import {
//   braveWallet,
//   // coinbaseWallet,
//   ledgerWallet,
//   metaMaskWallet,
//   rainbowWallet,
//   safeWallet,
//   walletConnectWallet,
// } from '@rainbow-me/rainbowkit/wallets';

// /**
//  * @returns targetNetwork object consisting targetNetwork from scaffold.config and extra network metadata
//  */

// export function getTargetNetwork() {
//   const configuredNetwork = appConfig.targetNetwork;

//   return {
//     ...configuredNetwork,
//   };
// }

// const configuredNetwork = getTargetNetwork();

// const walletsOptions = {
//   chains,
//   projectId: appConfig.walletConnectProjectId,
// };
// const wallets = [
//   metaMaskWallet({...walletsOptions, shimDisconnect: true}),
//   walletConnectWallet(walletsOptions),
//   ledgerWallet(walletsOptions),
//   braveWallet(walletsOptions),
//   // coinbaseWallet({...walletsOptions, appName: 'scaffold-eth-2'}),
//   rainbowWallet(walletsOptions),
//   // ...(configuredNetwork.id === chains.hardhat.id || !onlyLocalBurnerWallet
//   //   ? [burnerWalletConfig({chains: [chains[0]]})]
//   //   : []),
//   safeWallet({
//     ...walletsOptions,
//     debug: false,
//     allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
//   }),
// ];

// /**
//  * wagmi connectors for the wagmi context
//  */
// export const connectors = connectorsForWallets([
//   {
//     groupName: 'Supported Wallets',
//     wallets,
//   },
// ]);
