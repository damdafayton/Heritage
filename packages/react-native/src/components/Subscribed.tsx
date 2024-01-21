import {Button, StyleSheet, Text, View} from 'react-native';

import {DisplayVariable} from './Contract/DiplayVariable';
import {findYearsPassed} from '../helpers/findYearsPassed';
import {useContext, useState} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {AddInheritantForm} from '../forms/AddInheritantForm';
import {useHeritageWalletContract} from '../hooks/useHeritageWalletContract';
import {useAccount, useContractWrite} from 'wagmi';
import {DepositForm} from '../forms/DepositForm';
import {useConvertDepositToWei} from '../forms/hooks/useConvertDepositToWei';

export function Subscribed() {
  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );
  const {deposited, paidFeeCount, lastYearPaid, startTimestamp, minFeePerYear} =
    subscriptionData;

  const [activeForm, setActiveForm] = useState<
    'send' | 'deposit' | 'add-inheritant' | 'pay-fee' | undefined
  >(undefined);

  const {abi, address} = useHeritageWalletContract();

  const {writeAsync: writeAsyncFee} = useContractWrite({
    abi,
    address,
    functionName: 'forcePaySingleFee',
  });

  const payFee = async () => {
    setActiveForm(undefined);
    await writeAsyncFee();

    refetchSubscriptionData();
  };

  const {getDepositInWei} = useConvertDepositToWei();

  const {writeAsync: writeAsyncDeposit} = useContractWrite({
    abi,
    address,
    functionName: 'deposit',
  });

  const {address: userAddr} = useAccount();

  const onSubmitDeposit = async vals => {
    const wei = await getDepositInWei(vals);
    console.log({wei});

    if (!userAddr) return;

    await writeAsyncDeposit({
      value: wei,
      args: [userAddr],
    });

    refetchSubscriptionData();
  };

  return (
    <>
      <View style={styles.contractDataRow}>
        <Text>Deposited: </Text>
        <DisplayVariable overrideValue={deposited} />
        <Text>ETH</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Last year paid: </Text>
        <DisplayVariable overrideValue={lastYearPaid} />
      </View>
      <View style={styles.contractDataRow}>
        <Text>Years paid: </Text>
        <DisplayVariable overrideValue={paidFeeCount} />
      </View>
      <View style={styles.contractDataRow}>
        <Text>Years required to pay: </Text>
        <DisplayVariable
          overrideValue={findYearsPassed(startTimestamp * 1000)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => setActiveForm('send')} title="Send funds" />
        <Button
          onPress={() => setActiveForm('deposit')}
          title="Deposit funds"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => setActiveForm('add-inheritant')}
          title="Add inheritant"
        />
        <Button onPress={payFee} title="Pay 1 year fee" />
      </View>
      {(() => {
        switch (activeForm) {
          case 'deposit':
            return <DepositForm onSubmit={onSubmitDeposit} />;
          case 'pay-fee':
            return <Text>TEST ME</Text>;
          case 'send':
            return <Text>TEST ME</Text>;
          case 'add-inheritant':
            return <AddInheritantForm />;
        }
      })()}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {flexDirection: 'row', justifyContent: 'center'},
  contractDataRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 2,
  },
});
