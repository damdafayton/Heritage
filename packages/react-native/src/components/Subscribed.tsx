import {Formik} from 'formik';
import {FormEvent} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import {DisplayVariable} from './Contract/DiplayVariable';
import {formatEther} from 'ethers';

export function Subscribed({subscriptionData}) {
  const [
    timestamp,
    minFeePerYear,
    feeThousandagePerYear,
    paidFeeCount,
    lastYearPaid,
    deposited,
  ] = subscriptionData as Array<any>;
  console.log(deposited, formatEther(deposited));
  const handleFormSubmit = () => {};

  return (
    <>
      <View style={styles.contractDataRow}>
        <Text>Wallet deposit: </Text>
        <DisplayVariable
          overrideValue={parseFloat(
            parseFloat(formatEther(deposited)).toFixed(4),
          )}
        />
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
