import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {ContractData} from '../molecules/ContractData';

export function Contract() {
  return <ContractData />;
}
