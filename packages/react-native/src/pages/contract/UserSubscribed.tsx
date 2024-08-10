import {useContext, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ant from 'react-native-vector-icons/AntDesign';

import {SegmentedButtons} from '../../ui/SegmentedButtons';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {findYearsPassed} from '../../helpers/findYearsPassed';
import {ContractSubscribedType} from '../../types/types';
import {useContractWrite} from 'wagmi';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {Button} from '../../ui/Button';
import {Divider} from '../../ui/Divider';
import {Text} from '../../ui';
import {useTheme} from 'react-native-paper';
import {ContractData} from '../../molecules/ContractData';
import {AppStateContext} from '../../context/AppState.context';

export function UserSubscribed() {
  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  const {setError} = useContext(AppStateContext);

  if (!subscriptionData) return <ActivityIndicator />;

  const {
    deposited,
    paidFeeCount,
    lastYearPaid,
    startTimestamp,
    minFeePerYear,
    feeThousandagePerYear,
  } = subscriptionData;

  const navigation = useNavigation();

  const [segmentedButtons, setSegmentedButtons] = useState('');

  const {abi, address} = useHeritageWalletContract();

  const {writeAsync: writeAsyncFee, isLoading: loadingPayFee} =
    useContractWrite({
      abi,
      address,
      functionName: 'forcePaySingleFee',
    });

  const payFee = async () => {
    try {
      // setActiveForm(undefined);
      await writeAsyncFee();

      refetchSubscriptionData();
    } catch (e) {
      setError({message: 'An error occured while paying the fee'});
    }
  };

  const theme = useTheme();

  return (
    <>
      <ContractData rowStyle={styles.contractDataRow} />
      <View style={styles.contractDataRow}>
        <Text>User annual fee: </Text>
        <Text>{feeThousandagePerYear}</Text>
        <Text>‰</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>User minimum fee: </Text>
        <Text>{minFeePerYear}</Text>
        <Text>$</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Deposited: </Text>
        <Text>{deposited}</Text>
        <Text>ETH</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Last year paid: </Text>
        <Text>
          {lastYearPaid ? (
            <Ant name="checkcircle" size={20} color={theme.colors.success} />
          ) : (
            <MaterialIcons name="cancel" size={20} color={theme.colors.error} />
          )}
        </Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Years paid: </Text>
        <Text>{paidFeeCount}</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Years required to pay: </Text>
        {startTimestamp ? (
          <Text>{findYearsPassed(startTimestamp * 1000)}</Text>
        ) : null}
      </View>
      <Divider />
      <SegmentedButtons
        value={segmentedButtons}
        onValueChange={value => {
          if (value === ContractSubscribedType.PAY_EXTRA) {
            payFee();
            return;
          }
          // setSegmentedButtons(value);
          navigation.navigate(value);
        }}
        buttons={[
          {
            value: ContractSubscribedType.DEPOSIT,
            label: ContractSubscribedType.DEPOSIT,
          },
          {
            value: ContractSubscribedType.SEND,
            label: ContractSubscribedType.SEND,
          },
          {
            value: ContractSubscribedType.PAY_EXTRA,
            label: ContractSubscribedType.PAY_EXTRA,
          },
        ]}
      />
      <Button
        mode="contained-tonal"
        onPress={() =>
          navigation.navigate(ContractSubscribedType.ADD_INHERITANT as never)
        }>
        {ContractSubscribedType.ADD_INHERITANT}
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {flexDirection: 'row', justifyContent: 'center'},
  contractDataRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 2,
    alignItems: 'center',
    marginTop: 4,
  },
});
