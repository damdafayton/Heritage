import React, {useEffect} from 'react';

import '../shim';
import PolyfillCrypto from 'react-native-webview-crypto';
import SplashScreen from 'react-native-splash-screen';
import './services/firebase';
import {AppWithWagmi} from './AppWithWagmi';

export const index = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <>
      <PolyfillCrypto />
      <AppWithWagmi />
    </>
  );
};
