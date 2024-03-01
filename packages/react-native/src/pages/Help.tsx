import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Help');
import {List} from 'react-native-paper';

import {Text} from '../ui';
import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Loading} from '../molecules/Loading';

export function Help() {
  const {minFeePerYear, feeThousandagePerYear} = useContext(
    HerritageWalletContext,
  );

  return (
    <>
      {feeThousandagePerYear && minFeePerYear ? (
        <>
          <List.Section title="">
            <List.Accordion title="Fee examples">
              <List.Subheader>For 1000$</List.Subheader>
              <Text style={{marginStart: 24}}>
                {`Calculated fee = 1000 * 0.00${feeThousandagePerYear} = ${
                  (1000 * feeThousandagePerYear) / 1000
                }$
Minimum fee = ${minFeePerYear}$
Applied yearly fee = ${minFeePerYear}$`}
              </Text>
              <List.Subheader>For 10000$</List.Subheader>
              <Text style={{marginStart: 24}}>
                {`Calculated fee = 10000 * 0.00${feeThousandagePerYear} = ${
                  (10000 * feeThousandagePerYear) / 1000
                }$
Minimum fee = ${minFeePerYear}$
Applied yearly fee = ${(10000 * feeThousandagePerYear) / 1000}$`}
              </Text>
            </List.Accordion>
            <List.Accordion title="Security">
              <Text>
                {'     '}
                Maximum 1% cap is applied by the contract as a resort of final
                protection against bugs/exploits. This ensures that in case of
                contract being exploited by malicious actors, in a single year,
                no more than 1% of the user funds can be lost.
              </Text>
            </List.Accordion>
          </List.Section>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
