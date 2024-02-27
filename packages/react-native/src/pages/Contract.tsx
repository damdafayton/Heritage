import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {ContractData} from '../molecules/ContractData';
import {Text} from '../ui';

export function Contract() {
  return (
    <>
      <ContractData />
      <Text variant="titleMedium">Example fees</Text>
      <Text variant="titleSmall">For 1000$</Text>
      <Text>
        {`Calculated fee = 1000 * 0.001 = 1$
Minimum fee = 5$
Applied fee = 5$`}
      </Text>
      <Text variant="titleSmall">For 10000$</Text>
      <Text>
        {`Calculated fee = 1000 * 0.001 = 10$
Minimum fee = 5$
Applied fee = 10$`}
      </Text>
      <Text variant="titleMedium">Security</Text>
      <Text>
        Maximum 1% cap is applied by the contract as a resort of final
        protection against bugs/exploits. This ensures that in case of contract
        being exploited by malicious actors, in a single year, no more than 1%
        of the user funds can be lost.
      </Text>
    </>
  );
}
