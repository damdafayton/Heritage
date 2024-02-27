import {useContext, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ant from 'react-native-vector-icons/AntDesign';

import {SegmentedButtons} from '../../ui/SegmentedButtons';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {findYearsPassed} from '../../helpers/findYearsPassed';
import {HomeSubscribedType} from '../../typings/config';
import {useContractWrite} from 'wagmi';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {Button} from '../../ui/Button';
import {Divider} from '../../ui/Divider';
import {Text} from '../../ui';
import {useTheme} from 'react-native-paper';

export function HomeSubscribed() {
  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  if (!subscriptionData) return <ActivityIndicator />;

  const {deposited, paidFeeCount, lastYearPaid, startTimestamp, minFeePerYear} =
    subscriptionData;

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
    // setActiveForm(undefined);
    await writeAsyncFee();

    refetchSubscriptionData();
  };

  const theme = useTheme();

  return (
    <>
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
        <Button
          mode="contained-tonal"
          onPress={payFee}
          compact={true}
          style={{marginHorizontal: 8, marginTop: 0}}
          loading={loadingPayFee}
          labelStyle={{
            paddingVertical: 2,
            marginVertical: 0,
            paddingHorizontal: 4,
          }}>
          Pay extra
        </Button>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Years required to pay: </Text>
        <Text>{findYearsPassed(startTimestamp * 1000)}</Text>
      </View>
      <Divider />
      <SegmentedButtons
        value={segmentedButtons}
        onValueChange={value => {
          // setSegmentedButtons(value);
          navigation.navigate(value);
        }}
        buttons={[
          {
            value: HomeSubscribedType.DEPOSIT,
            label: HomeSubscribedType.DEPOSIT,
          },
          {value: HomeSubscribedType.SEND, label: HomeSubscribedType.SEND},
        ]}
      />
      <SegmentedButtons
        value={segmentedButtons}
        onValueChange={value => {
          // setSegmentedButtons(value);
          navigation.navigate(value);
        }}
        buttons={[
          {
            value: HomeSubscribedType.ENCRYPTED_DATA,
            label: HomeSubscribedType.ENCRYPTED_DATA,
          },
          {
            value: HomeSubscribedType.ADD_INHERITANT,
            label: HomeSubscribedType.ADD_INHERITANT,
          },
        ]}
      />
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
    marginTop: 8,
  },
});
