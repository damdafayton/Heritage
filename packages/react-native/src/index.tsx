import 'react';
import '@walletconnect/react-native-compat';
import {WagmiConfig} from 'wagmi';
import {createWeb3Modal, Web3Modal} from '@web3modal/wagmi-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {NavigationContainer} from '@react-navigation/native';
import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme,
  PaperProvider,
} from 'react-native-paper';

import '../shim';
import App from './App';
import {wagmiConfig, chains} from './services/wagmiConfig';
import {appConfig} from '../app.config';
import {Appearance} from 'react-native';

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
    success: 'green',
  },
};
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    success: 'rgb(116 194 119)',
  },
};
const theme = Appearance.getColorScheme() === 'dark' ? darkTheme : lightTheme;

// 3. Create modal
createWeb3Modal({
  projectId: appConfig.walletConnectProjectId,
  chains,
  wagmiConfig,
  clipboardClient,
  featuredWalletIds: [
    'f5b4eeb6015d66be3f5940a895cbaa49ef3439e518cd771270e6b553b48f31d2', // MEW
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance
    'cbc11415130d01316513f735eac34fd1ad7a5d40a993bbb6772d2c02eeef3df8', // Binance US
    'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a', // Uniswap
    'c482dfe368d4f004479977fd88e80dc9e81107f3245d706811581a6dfe69c534', // NOW
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
    <NavigationContainer>
      <WagmiConfig config={wagmiConfig}>
        <PaperProvider theme={theme}>
          <App />
        </PaperProvider>
      </WagmiConfig>
    </NavigationContainer>
  );
};
