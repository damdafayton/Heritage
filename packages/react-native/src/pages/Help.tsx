const log = logger('Help');
import {List} from 'react-native-paper';

import {Text} from '../ui';
import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {View} from 'react-native';
import {styles} from '../ui/styles';
import {logger} from '../utils/logger';

export function Help() {
  const heritageWalletData = useContext(HerritageWalletContext);

  const feeThousandagePerYear = heritageWalletData?.feeThousandagePerYear || 1;
  const minFeePerYear = heritageWalletData?.minFeePerYear || 24;

  return (
    <View style={{marginTop: styles.global.marginTop}}>
      <Text variant="titleLarge">Questions</Text>
      <List.Section title="">
        <List.Accordion title="Fee examples">
          <List.Subheader>For 1.000$</List.Subheader>
          <Text style={{marginStart: 24}}>
            {`Annual fee = ${feeThousandagePerYear} ‰
Calculated fee = 1.000 * 0,00${feeThousandagePerYear} = ${
              (1000 * feeThousandagePerYear) / 1000
            }$
Minimum fee = ${minFeePerYear}$
Applied yearly fee = ${minFeePerYear}$`}
          </Text>
          <List.Subheader>For 10.000$</List.Subheader>
          <Text style={{marginStart: 24}}>
            {`Annual fee = ${feeThousandagePerYear} ‰
Calculated fee = 10.000 * 0,00${feeThousandagePerYear} = ${
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
            contract being exploited by malicious actors, in a single year, no
            more than 1% of the user funds can be lost.
          </Text>
        </List.Accordion>
      </List.Section>
    </View>
  );
}
