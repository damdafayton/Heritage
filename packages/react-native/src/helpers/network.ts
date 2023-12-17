import {appConfig} from '../../app.config';

export function getTargetNetwork() {
  const configuredNetwork = appConfig.targetNetwork;

  return {
    ...configuredNetwork,
  };
}
