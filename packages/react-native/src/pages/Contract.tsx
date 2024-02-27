import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {ContractData} from '../molecules/ContractData';
import {useHeritageAdminContract} from '../hooks/useHeritageAdminContract';

export function Contract() {
  const {address} = useHeritageAdminContract();

  return <ContractData />;
}
