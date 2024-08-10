import {Hex} from 'viem';
import * as chains from 'wagmi/chains';
import Config from 'react-native-config';

import {configForPlatform} from './src/configForPlatform';

// console.log('appConfig', JSON.stringify(Config));

export type ScaffoldConfig = {
  targetNetwork: chains.Chain;
  burnerPrivateKey: Hex;
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
  logSeverity: string;
  nodeEnv?: 'production' | 'development';
  hostName: string;
  sentryDSN?: string;
  appCheckDebugToken?: string;
  minimumCheckInterval: number;
  firebaseApiKey: string;
};

const isProd = Config.NODE_ENV === 'production';

export const appConfig: ScaffoldConfig = {
  nodeEnv: Config.NODE_ENV,
  logSeverity: isProd ? 'error' : 'debug',
  minimumCheckInterval: isProd ? 240 : 15,
  hostName: Config.HOSTNAME,
  // The network where your DApp lives in
  targetNetwork: chains[Config.CHAIN],
  burnerPrivateKey: Config.BURNER_PRIVATE_KEY,
  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect on the local network
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: isProd
    ? Config.ALCHEMY_API_KEY
    : 'oKxs-03sij-U_N0iOlrSsZFr29-IqbuF',

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    '3a8170812b534d0ff9d794f19a901d64',

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: false,

  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet:  On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  walletAutoConnect: true,
  sentryDSN:
    'https://88cfa3a3f6d063f2e0e6c4f75e8c86ae@o4506819614736384.ingest.sentry.io/4506819616636928',
  appCheckDebugToken: Config.APP_CHECK_DEBUG_TOKEN,
  firebaseApiKey: Config.FIREBASE_API_KEY || configForPlatform.FIREBASE_API_KEY,
};
