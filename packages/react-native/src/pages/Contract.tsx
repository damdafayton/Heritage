import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {ActivityIndicator} from '../ui/ActivityIndicator';
import {ContractData} from '../molecules/ContractData';

export function Contract({minFeePerYear, feeThousandagePerYear}) {
  const contractIsLoaded = minFeePerYear && feeThousandagePerYear;

  return contractIsLoaded ? <ContractData /> : <ActivityIndicator />;
}
