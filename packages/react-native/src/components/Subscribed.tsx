import {Formik} from 'formik';
import {FormEvent} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import {formatEther} from 'ethers';

import {DisplayVariable} from './Contract/DiplayVariable';
import {SubscriptionData} from '../hooks/useGetSubscriptionData';

export function Subscribed({
  subscriptionData,
}: {
  subscriptionData: SubscriptionData;
}) {
  const {deposited} = subscriptionData;

  const handleFormSubmit = () => {};

  return (
    <>
      <View style={styles.contractDataRow}>
        <Text>Wallet deposit: </Text>
        <DisplayVariable overrideValue={deposited} />
        <Text>ETH</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Send" />
        <Button title="Deposit" />
        <Button title="Add inheritant" />
      </View>
      <Formik
        initialValues={{depositType: 'USD', depositAmount: ''}}
        onSubmit={handleFormSubmit}>
        {({handleChange, handleBlur, handleSubmit, values}) => (
          <View>
            <Text>Add new inheritants</Text>
            <TextInput
              placeholder="Amount to deposit"
              value={values.depositAmount}
              onChangeText={handleChange('depositAmount')}
              onBlur={handleBlur('depositAmount')}
            />
            <Button
              onPress={e =>
                handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
              }
              title="Submit"
            />
          </View>
        )}
      </Formik>
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
