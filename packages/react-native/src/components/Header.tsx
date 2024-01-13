import {StyleSheet, Text, View} from 'react-native';
import {DisplayVariable} from './Contract/DiplayVariable';
import {useHeritageContract} from '../hooks/useHeritageContract';

export function Header({subscriptionData = [] as any, isSubscribed}) {
  const {
    address: heritageAddress,
    abi,
    getHeritageFunction,
  } = useHeritageContract();

  const fnFeeThousandage = getHeritageFunction?.('feeThousandagePerYear');
  const fnMinFee = getHeritageFunction?.('minFeePerYearInUsd');

  const refreshDisplayVariables = true;

  const [timestamp, minFeePerYear, feeThousandagePerYear] =
    subscriptionData as Array<any>;

  console.log({minFeePerYear, feeThousandagePerYear});

  return heritageAddress ? (
    <View style={styles.contractData}>
      <View style={styles.contractDataCell}>
        <Text>Current fees</Text>
        <View style={styles.contractDataRow}>
          <Text>Annual fee: </Text>
          <DisplayVariable
            abiFunction={fnFeeThousandage}
            contractAddress={heritageAddress}
            refreshDisplayVariables={refreshDisplayVariables}
          />
          <Text>‰</Text>
        </View>
        <View style={styles.contractDataRow}>
          <Text>Minimum fee: </Text>
          <DisplayVariable
            abiFunction={fnMinFee}
            contractAddress={heritageAddress}
            refreshDisplayVariables={refreshDisplayVariables}
          />
          <Text>$</Text>
        </View>
      </View>
      {isSubscribed ? (
        <View style={styles.contractDataCell}>
          <Text>Fees for registered user</Text>
          <View style={styles.contractDataRow}>
            <Text>Annual fee: </Text>
            <DisplayVariable
              abiFunction={fnFeeThousandage}
              contractAddress={heritageAddress}
              refreshDisplayVariables={refreshDisplayVariables}
              overrideValue={feeThousandagePerYear}
            />
            <Text>‰</Text>
          </View>
          <View style={styles.contractDataRow}>
            <Text>Minimum fee: </Text>
            <DisplayVariable
              abiFunction={fnMinFee}
              contractAddress={heritageAddress}
              refreshDisplayVariables={refreshDisplayVariables}
              overrideValue={minFeePerYear}
            />
            <Text>$</Text>
          </View>
        </View>
      ) : (
        <></>
      )}
    </View>
  ) : (
    <></>
  );
}

const styles = StyleSheet.create({
  contractData: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 2,
  },
  contractDataCell: {
    flex: 1,
    backgroundColor: 'yellow',
  },
  contractDataRow: {
    display: 'flex',
    columnGap: 2,
    flexDirection: 'row',
  },
});
