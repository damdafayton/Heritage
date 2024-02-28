import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {ContractData} from '../molecules/ContractData';
import {Divider, Text} from '../ui';
import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';

export function Contract() {
  const {minFeePerYear, feeThousandagePerYear} = useContext(
    HerritageWalletContext,
  );

  return (
    <>
      <ContractData />
      <Divider />
      {feeThousandagePerYear && minFeePerYear && (
        <>
          <Text variant="titleMedium">Fee examples</Text>
          <Text variant="titleSmall">For 1000$</Text>
          <Text>
            {`Calculated fee = 1000 * 0.00${feeThousandagePerYear} = ${
              (1000 * feeThousandagePerYear) / 1000
            }$
Minimum fee = ${minFeePerYear}$
Applied fee = ${minFeePerYear}$`}
          </Text>
          <Text variant="titleSmall">For 10000$</Text>
          <Text>
            {`Calculated fee = 10000 * 0.00${feeThousandagePerYear} = ${
              (10000 * feeThousandagePerYear) / 1000
            }$
Minimum fee = ${minFeePerYear}$
Applied fee = ${(10000 * feeThousandagePerYear) / 1000}$`}
          </Text>
          <Text variant="titleMedium">Security</Text>
          <Text>
            Maximum 1% cap is applied by the contract as a resort of final
            protection against bugs/exploits. This ensures that in case of
            contract being exploited by malicious actors, in a single year, no
            more than 1% of the user funds can be lost.
          </Text>
        </>
      )}
    </>
  );
}
