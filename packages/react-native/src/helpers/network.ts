import Config from 'react-native-config';

import {appConfig} from '../../app.config';
import {Platform} from 'react-native';
import {hardhat} from 'viem/chains';

export function getTargetNetwork() {
  const configuredNetwork = appConfig.targetNetwork;

  const isAndroidAndDev =
    Config.NODE_ENV === 'development' && Platform.OS === 'android';

  const isLocalAndAndroidAndDev =
    configuredNetwork?.id === hardhat.id && isAndroidAndDev;

  // Android dev env needs to adjust local network to hardhat
  if (isLocalAndAndroidAndDev) {
    //@ts-ignore
    configuredNetwork.rpcUrls.default.http[0] = Config.HARDHAT_RPC;
    //@ts-ignore
    configuredNetwork.rpcUrls.public.http[0] = Config.HARDHAT_RPC;
  }

  return {
    ...configuredNetwork,
  };
}
